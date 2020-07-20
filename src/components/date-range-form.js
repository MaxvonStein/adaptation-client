// react component meant to allow for a view state.  consider reducing the number of props by moving the date logic inside the component, e.g. just pass term and start date

import React, { Fragment } from "react";
import { KeyboardDatePicker } from "@material-ui/pickers";
import TextField from "@material-ui/core/TextField";
import DateRangeIcon from "@material-ui/icons/DateRange";
import Box from "@material-ui/core/Box";
import IconMenu from "./icon-menu";
import TodayIcon from "@material-ui/icons/Today";
import { makeStyles } from "@material-ui/core/styles";
import addDays from "date-fns/addDays";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import { periodEndDate, differenceInPeriods, dateOnly } from "../dates";

const useStyles = makeStyles((theme) => ({
  flexParent: {
    display: "flex",
  },
  switchbankRow: theme.switchbankRow,
  switchbankIconMenu: theme.switchbankIconMenu,
  switchbankBox: theme.switchbankBox,
}));

export default function DateRangeForm({
  onPickupChange,
  onLeaseMonthsChange,
  initialPickup,
  initialLeaseMonths,
}) {
  const classes = useStyles();
  // const theme = useTheme();
  const [inputView, setInputView] = React.useState("dateRange");
  const [customerLeaseMonths, setCustomerLeaseMonths] = React.useState(
    initialLeaseMonths || 3
  );
  const [pickupDate, setPickupDate] = React.useState(
    new Date(initialPickup) || dateOnly(new Date())
  );
  const [wholeMonths, setWholeMonths] = React.useState(
    Math.floor(initialLeaseMonths) || 3
  );
  const [days, setDays] = React.useState(
    parseInt((initialLeaseMonths % 1) * 30) || 0
  );

  // switching to controlled component.  handlers should just pass the pickupDate and customerLeaseMonths

  const handlePickupChange = (date) => {
    const strippedDate = dateOnly(date);
    // const difference = differenceInDays(event, pickupDate);
    console.log(periodEndDate(pickupDate, customerLeaseMonths));
    const newCustomerLeaseMonths = differenceInPeriods(
      strippedDate,
      // previous return date
      periodEndDate(pickupDate, customerLeaseMonths)
    );
    setPickupDate(strippedDate);
    setCustomerLeaseMonths(newCustomerLeaseMonths);
    onPickupChange(strippedDate);
  };

  const handleDropoffChange = (date) => {
    const strippedDate = dateOnly(date);
    // change customerLeaseMonths and pass the value to the onDropoffChange prop
    const newCustomerLeaseMonths = differenceInPeriods(
      pickupDate,
      strippedDate
    );
    const newWholeMonths = Math.floor(newCustomerLeaseMonths);
    setDays(
      differenceInCalendarDays(
        strippedDate,
        periodEndDate(pickupDate, newWholeMonths)
      )
    );
    console.log("whole months: ", Math.floor(newCustomerLeaseMonths));
    console.log(
      "days: ",
      differenceInCalendarDays(
        periodEndDate(pickupDate, newWholeMonths),
        strippedDate
      )
    );
    setCustomerLeaseMonths(newCustomerLeaseMonths);
    setWholeMonths(newWholeMonths);
    // will this work in time?
    onLeaseMonthsChange(newCustomerLeaseMonths);
  };

  const handleMonthDayChange = (event) => {
    const target = event.target;
    let newCustomerLeaseMonths;
    // short circuit blank string values so when the user backspaces value we wait and see what's typed next
    // can't replace the 0 now

    if (target.name === "months") {
      setWholeMonths(target.value);
      newCustomerLeaseMonths =
        parseInt(target.value << 0) + (customerLeaseMonths % 1);
      setCustomerLeaseMonths(newCustomerLeaseMonths);
    } else if (target.name === "days") {
      setDays(target.value);
      newCustomerLeaseMonths =
        Math.floor(customerLeaseMonths) + parseInt(target.value << 0) / 30;
      setCustomerLeaseMonths(newCustomerLeaseMonths);
    }

    // don't call onChange if we're backspacing to a blank string
    if (target.value === "") return;

    // will this work?
    onLeaseMonthsChange(newCustomerLeaseMonths);
  };

  return (
    <Box className={classes.switchbankRow}>
      <IconMenu
        className={classes.switchbankIconMenu}
        options={[
          { name: "Choose dates", value: "dateRange" },
          { name: "Choose months", value: "months" },
        ]}
        onChange={(event, value) => setInputView(value)}
        icon={<DateRangeIcon />}
      />
      {/* <Box className={classes.switchbankBox} style={{ display: "flex" }}> */}
      <Box className={`${classes.switchbankBox} ${classes.flexParent}`}>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          disablePast={true}
          label="Pickup date"
          // maxDate={dropoffDate}
          value={pickupDate}
          // this should update the customerPickupDate field
          onChange={handlePickupChange}
          autoOk={true}
          keyboardIcon={<TodayIcon />}
        />
        <TextField
          label="Months"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ min: 0, max: 53 }}
          name="months"
          // value has to be controlled becasue the return date field has to change it
          // these are independant of the customerLeaseMonths state because the TextFields need to be able to show "" when the customer backspaces
          value={wholeMonths}
          // value={Math.floor(customerLeaseMonths)}
          onChange={handleMonthDayChange}
          style={
            inputView === "months" ? { marginLeft: 12 } : { display: "none" }
          }
        />
        <TextField
          label="Days"
          type="number"
          inputProps={{ min: 0, max: 29 }}
          name="days"
          InputLabelProps={{
            shrink: true,
          }}
          value={days}
          onChange={handleMonthDayChange}
          style={
            inputView === "months" ? { marginLeft: 12 } : { display: "none" }
          }
        />
        <KeyboardDatePicker
          // don't need to mess with style display: none here because this input has a value declared so the date won't reset when it renders
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          label="Return date"
          minDate={addDays(pickupDate, 1)}
          value={periodEndDate(pickupDate, customerLeaseMonths)}
          // this should update the dropoffDate variable, then the term data field
          onChange={handleDropoffChange}
          autoOk={true}
          style={
            inputView === "dateRange"
              ? { marginLeft: 12 }
              : { display: "none", marginLeft: 12 }
          }
        />
      </Box>
    </Box>
  );
}
