import React, { Component, Fragment } from "react";
// import styled, { css } from "react-emotion";
// import { size } from "polished";

import { makeStyles } from "@material-ui/core/styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import InputBase from "@material-ui/core/InputBase";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import InfoTooltip from "./info-tooltip";

const useStyles = makeStyles({
  formRow: {
    marginTop: 14,
  },
});

export default function EstimateInsuranceForm({
  onChange,
  onStateSelect,
  initialCustomerState,
  initialDriver,
}) {
  const classes = useStyles();
  const [customerState, setCustomerState] = React.useState(
    initialCustomerState
  );
  const [driver, setDriver] = React.useState(initialDriver || "");

  const handleChange = (event) => {
    // set state
    const target = event.target;
    if (target.name === "customerState") {
      const newCustomerState = target.value;
      setCustomerState(newCustomerState);
      if (!!driver) {
        // driver hasn't been selected
        onChange(newCustomerState, driver);
      }
      onStateSelect(newCustomerState);
    } else if (target.name === "driver") {
      const newDriver = target.value;
      setDriver(newDriver);
      if (!!customerState) {
        onChange(customerState, newDriver);
      }
    }
    // call onChange prop
  };

  return (
    <Fragment>
      <Box className={classes.formRow}>
        <FormControl style={{ minWidth: 240 }}>
          <InputLabel>State</InputLabel>
          <Select
            // defaultValue={"New York"}
            name="customerState"
            onChange={handleChange}
            value={customerState}
          >
            <MenuItem value="Connecticut">Connecticut</MenuItem>
            <MenuItem value="Delaware">Delaware</MenuItem>
            <MenuItem value="Maryland">Maryland</MenuItem>
            <MenuItem value="Massachusetts">Massachusetts</MenuItem>
            <MenuItem value="New Jersey">New Jersey</MenuItem>
            <MenuItem value="New York">New York</MenuItem>
            <MenuItem value="Pennsylvania">Pennsylvania</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box
        className={classes.formRow}
        style={{ display: "flex", alignItems: "center" }}
      >
        <FormControl style={{ minWidth: 240 }}>
          <InputLabel>Driving record and credit</InputLabel>
          <Select value={driver} name="driver" onChange={handleChange}>
            <MenuItem value="good">Clean driving record, good credit</MenuItem>
            <MenuItem value="creditChallenged">
              Clean driving record, iffy credit
            </MenuItem>
            <MenuItem value="bad">
              Caused an accident or had a major violation
            </MenuItem>
          </Select>
        </FormControl>
        <InfoTooltip message="Credit history is one factor insurance companies use to determine premiums." />
      </Box>
    </Fragment>
  );
}
