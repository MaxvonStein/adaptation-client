import React, { Component, Fragment } from "react";
import styled, { css } from "react-emotion";
import { size } from "polished";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Loading } from "../components";
import {
  GET_CARS,
  GET_CARFORM,
  GET_CUSTOMER,
  GET_SORT_CARS,
  GET_CARS_CUSTOMER,
  GET_CARS_VIEW_CUSTOMER,
  GET_CARS_LEASETOTAL,
  GET_SORT,
} from "../pages/cars";
import { ADD_OR_REMOVE_FILTERS_CARS, SORT_CARS } from "./cars-forms";
// import { typeDefs } from "../resolvers";

import ModelCheckbox from "./model-checkbox";
import FilterCheckbox from "./filter-checkbox";
import SuggestionItem from "./suggestion-item";
import { InputContainer } from "./quote-filter-form";
import space from "../assets/images/space.jpg";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { ReactComponent as Curve } from "../assets/curve.svg";
import { ReactComponent as Rocket } from "../assets/rocket.svg";
import { colors, unit } from "../styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import { IconButton } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
// import datefns from "@date-io/date-fns";
import differenceInDays from "date-fns/differenceInDays";
import getDate from "date-fns/getDate";
import differenceInMonths from "date-fns/differenceInMonths";
import eachMonthOfInterval from "date-fns/eachMonthOfInterval";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import isBefore from "date-fns/isBefore";
import {
  DatePicker,
  KeyboardDatePicker,
  TimePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { calculateLease } from "../lease-total";
import { transportCosts, dropoffLocations } from "../constants";

export const UPDATE_PICKUP_LOCATION = gql`
  mutation updateCustomerPickupLocation($customerPickupLocation: String!) {
    updateCustomerPickupLocation(
      customerPickupLocation: $customerPickupLocation
    ) @client
  }
`;

export const ADD_OR_REMOVE_PICKUP_LOCATION = gql`
  mutation addOrRemoveCustomerPickupLocation(
    $location: String!
    $viewCars: [Car]!
  ) {
    addOrRemoveCustomerPickupLocation(location: $location, viewCars: $viewCars)
      @client
  }
`;

export const ADD_OR_REMOVE_PICKUP_LOCATION_VIEW_REQUERY = gql`
  mutation addOrRemoveCustomerPickupLocation($location: String!) {
    addOrRemoveCustomerPickupLocation(location: $location) @client
  }
`;

export const UPDATE_PICKUP_DATE = gql`
  mutation updateCustomerPickupDate($customerPickupDate: Date!) {
    updateCustomerPickupDate(customerPickupDate: $customerPickupDate) @client
  }
`;

export const UPDATE_LEASE_MONTHS = gql`
  mutation updateCustomerLeaseMonths($customerLeaseMonths: Float!) {
    updateCustomerLeaseMonths(customerLeaseMonths: $customerLeaseMonths) @client
  }
`;

export const REQUERY_LEASETOTAL = gql`
  mutation requeryLeasetotal($viewCars: [Car]!) {
    requeryLeasetotal(viewCars: $viewCars) @client
  }
`;

function LocationFilterset({ locations, attributeName, onChange, checked }) {
  return (
    <Fragment>
      <p>{attributeName}</p>
      {locations.map((location, i) => {
        return (
          <InputContainer key={i}>
            <Checkbox
              name={attributeName}
              value={location}
              checked={checked(location)}
              onChange={onChange}
            />
            <StyledSpan>{location}</StyledSpan>
          </InputContainer>
        );
      })}
    </Fragment>
  );
}

// export const ADD_OR_REMOVE_MAKE_FILTER = gql`
//   mutation addOrRemoveMakeFilter($value: String!, $isChecked: Boolean!) {
//     addOrRemoveMakeFilter(value: $value, isChecked: $isChecked) @client
//   }
// `;

// is this better defined here?
let dropoffDate, wholeMonths;
let days = 0;
let isLastChangeDate = false;

const differenceInPeriods = (startDate, endDate) => {
  const firstDay = getDate(startDate);
  const secondDay = getDate(endDate);
  const decimalMonths = differenceInMonths(startDate, endDate);
  const wholeMonths = Math.floor(decimalMonths);
  // const intervalDates = eachMonthOfInterval({
  //   start: startDate,
  //   end: endDate
  // });
  // const wholeMonths = intervalDates.length;
  // const lastWholePeriodEnd = intervalDates[intervalDates.length - 1];
  const lastWholePeriodEnd = addMonths(startDate, wholeMonths);
  const partialDays = differenceInDays(endDate, lastWholePeriodEnd);
  const partialPeriod = partialDays / 30;
  return wholeMonths + partialPeriod;
};

const periodEndDate = (startDate, months) => {
  const wholeMonths = Math.floor(months);
  const partialPeriod = months - wholeMonths;
  const lastWholePeriodEnd = addMonths(startDate, wholeMonths);
  return addDays(lastWholePeriodEnd, Math.round(partialPeriod * 30));
};

const updateTermVaribles = (leaseMonths) => {
  wholeMonths = Math.floor(leaseMonths);
  days = Math.round((leaseMonths - wholeMonths) * 30);
};

// const isInData = (attribute, value) => {
//   // adapted from isInFilter
//   // is this the best way to get the filters?  we're querying the client for each checkbox - unless react is optimizing this and I'm not aware
//   const { data, loading, error } = client.useQuery(GET_CUSTOMER);
//   return data[attribute].includes(value);
// };

export default function QuoteForm() {
  const client = useApolloClient();

  // is this resetting dropoffDate?
  // let dropoffDate;
  // should this be assigned to data.customerLeaseMonths one time somehow, with an if statement maybe.
  // let wholeMonths;
  // when you assign days to 0 here, the input is reset everytime the component renders
  // let days;

  // cars, customerPickupLocation, customerPickupDate, customerLeaseMonths;

  const { data, loading, error } = useQuery(GET_CARS_VIEW_CUSTOMER);
  // problem is cars isn't client data - CLIENT.readqu..

  // seed variables
  if (!wholeMonths && data.customerLeaseMonths) {
    wholeMonths = Math.floor(data.customerLeaseMonths);
  }

  const locations = [
    ...new Set(
      data.cars.map((c) => c.location).sort((a, b) => a.localeCompare(b))
    ),
  ];

  // if (!isLocationsInitialized) {
  //   console.log(transportCosts);
  //   console.log(transportCosts["Boston, Massachusetts"]);
  //   client.writeData({ data: { customerPickupLocations: locations } });
  //   isLocationsInitialized = true;
  // }

  const isInDataCurry = (attribute) => (value) => {
    // adapted from isInFilter
    // is this the best way to get the filters?  we're querying the client for each checkbox - unless react is optimizing this and I'm not aware
    // better setup, doesn't throw the controlled/uncontrolled error - add to other filters
    return data[attribute] && data[attribute].includes(value) ? true : false;
  };

  // const [
  //   updatePickupLocation,
  //   { loading: pickupLocationLoading, error: pickupLocationError }
  // ] = useMutation(UPDATE_PICKUP_LOCATION);

  const [
    requeryLeasetotal,
    { loading: requeryLeasetotalLoading, error: requeryLeasetotalError },
  ] = useMutation(REQUERY_LEASETOTAL);

  const [
    addOrRemoveCustomerPickupLocationRequery,
    { loading: pickupLocationLoading, error: pickupLocationError },
  ] = useMutation(ADD_OR_REMOVE_PICKUP_LOCATION, {
    refetchQueries: [{ query: GET_CARS_LEASETOTAL }],
    awaitRefetchQueries: true,
    onCompleted({ addOrRemoveCustomerPickupLocation }) {
      requeryLeasetotal({
        variables: { viewCars: addOrRemoveCustomerPickupLocation.viewCars },
      });
    },
  });

  // const [
  //   addOrRemoveCustomerPickupLocation,
  //   { loading: pickupLocationLoading, error: pickupLocationError }
  // ] = useMutation(ADD_OR_REMOVE_PICKUP_LOCATION, {
  //   refetchQueries: [{ query: GET_CARS_LEASETOTAL }],
  //   awaitRefetchQueries: true
  // });

  const [
    updatePickupDate,
    { loading: pickupDateLoading, error: pickupDateError },
  ] = useMutation(UPDATE_PICKUP_DATE);

  const [
    updateLeaseMonths,
    { loading: leaseMonthsLoading, error: leaseMonthsError },
  ] = useMutation(UPDATE_LEASE_MONTHS, {
    // this doesn't actually seem to update viewCars because that only changes on filter, customer-form runs the filter mutation in the handler
    // confirmed.  if quote-list is displaying cars only, the leaseTotal updates as expected
    refetchQueries: [{ query: GET_CARS_CUSTOMER }],
    awaitRefetchQueries: true,
  });

  // coppied from customer-form
  const [
    filterCarsSort,
    { loading: filterCarsLoading, error: filterCarsSortError },
  ] = useMutation(ADD_OR_REMOVE_FILTERS_CARS, {
    onCompleted({ addOrRemoveFiltersCars }) {
      // instead of writing to the client, call the sortCars mutate function and let that mutation take care of writing to the client
      sortCars({
        variables: {
          cars: addOrRemoveFiltersCars.viewCars,
          sortAttribute: addOrRemoveFiltersCars.sortAttribute,
          isSortReverse: addOrRemoveFiltersCars.isSortReverse,
        },
      });
    },
  });

  // coppied from customer-form
  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;

  const handlePickupChange = (date) => {
    updatePickupDate({ variables: { customerPickupDate: date } });
    if (isLastChangeDate && isBefore(new Date(date), dropoffDate)) {
      // the last user input was a date, change the lease months to keep that date
      const customerLeaseMonths = differenceInPeriods(
        new Date(date),
        dropoffDate
      );
      updateTermVaribles(customerLeaseMonths);
      client.writeData({ data: { customerLeaseMonths } });
    } else {
      dropoffDate = periodEndDate(new Date(date), wholeMonths + days / 30);
    }
  };

  const handleDropoffChange = (date) => {
    dropoffDate = date;
    const customerPickupDate = new Date(data.customerPickupDate);
    const customerLeaseMonths = differenceInPeriods(
      customerPickupDate,
      dropoffDate
    );
    updateTermVaribles(customerLeaseMonths);
    client.writeData({ data: { customerLeaseMonths } });
    isLastChangeDate = true;
  };

  // const handleDayChange = event => {
  //   event.preventDefault();
  //   days = event.target.value;
  //   // wholeMonths isn't defined here?
  //   // maybe create a mutation that just adds a month or subtracts a month or day
  //   const customerLeaseMonths = wholeMonths + days / 30;
  //   dropoffDate = periodEndDate(
  //     new Date(data.customerPickupDate),
  //     wholeMonths + days / 30
  //   );
  //   client.writeData({ data: { customerLeaseMonths } });
  //   isLastChangeDate = false;
  // };

  const handleMonthDayChangeOld = async (event) => {
    event.preventDefault();
    const target = event.target;
    if (target.name == "months") {
      wholeMonths = parseInt(target.value);
    } else if (target.name == "days") {
      days = parseInt(target.value);
    }
    const customerLeaseMonths = wholeMonths + days / 30;
    dropoffDate = periodEndDate(
      new Date(data.customerPickupDate),
      customerLeaseMonths
    );
    const leaseMonthsResponse = await updateLeaseMonths({
      variables: { customerLeaseMonths },
    });
    // client.writeData({ data: { customerLeaseMonths } });

    // this query may be running before the customerLeaseMonths is updated
    const { cars, sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT_CARS,
    });

    filterCarsSort({
      variables: { cars, value: false, isChecked: false, attribute: false },
      // passing customerStateResponse here only to force await for updateCustomer above
      // do we need to pass leaseMonthsResponse here too?
      context: { sortAttribute, isSortReverse },
    });

    isLastChangeDate = false;
  };

  const handleLocationButtonClick = (event) => {
    const field = event.target.name;
    // const { viewField } = await client.readQuery({ query: GET_CUSTOMER });
    client.writeData({ data: { viewField: field } });
  };

  const handlePickupLocationChange = async (event) => {
    const locationRequeryResponse = await addOrRemoveCustomerPickupLocationRequery(
      {
        variables: {
          location: event.target.value,
          viewCars: data.viewCars,
        },
      }
    );
    // run sortCars here with response.  first query for sortAttribute
    const { sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT,
    });
    // will firstMonth become an option?
    if (sortAttribute === "leaseTotal") {
      sortCars({
        variables: {
          cars:
            locationRequeryResponse.data.addOrRemoveCustomerPickupLocation
              .viewCars,
          sortAttribute,
          isSortReverse,
        },
      });
    }
  };

  return (
    <Container>
      <WhiteBox>
        <FormControl>
          <TextField
            label="Pickup Location"
            name="customerPickupLocations"
            onClick={handleLocationButtonClick}
            value={data.customerPickupLocations.join(", ")}
          />
        </FormControl>
        {/* probably better, more efficient to use css display */}
        {data.viewField === "customerPickupLocations" && (
          <Fragment>
            <IconButton
              onClick={() => client.writeData({ data: { viewField: null } })}
            >
              <ArrowBackIcon />
            </IconButton>
            <FormControl>
              <LocationFilterset
                locations={locations}
                attributeName="customerPickupLocations"
                onChange={handlePickupLocationChange}
                checked={isInDataCurry("customerPickupLocations")}
              />
            </FormControl>
          </Fragment>
        )}
        <FormControl>
          <InputLabel id="demo-simple-select-label">
            Drop-off Location
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={data.customerDropoffLocation}
            onChange={
              (event) =>
                client.writeData({
                  data: { customerDropoffLocation: event.target.value },
                })
              // updatePickupLocation({
              //   variables: { customerPickupLocation: event.target.value }
              // })
            }
          >
            {dropoffLocations.map((location, i) => (
              <MenuItem value={location}>{location}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          disablePast={true}
          // maxDate={dropoffDate}
          value={
            data.customerPickupDate
              ? data.customerPickupDate
              : addDays(new Date(), 3)
          }
          // this should update the customerPickupDate field
          onChange={handlePickupChange}
          autoOk={true}
        ></KeyboardDatePicker>
        <TextField
          id="standard-number"
          label="Months"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ min: 0, max: 53 }}
          name="months"
          value={wholeMonths}
          // value={Math.floor(data.customerLeaseMonths)}
          onChange={handleMonthDayChange}
        />
        <TextField
          id="standard-number"
          label="Days"
          type="number"
          inputProps={{ min: 0, max: 29 }}
          name="days"
          InputLabelProps={{
            shrink: true,
          }}
          value={days}
          onChange={handleMonthDayChange}
        />
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          minDate={data.customerPickupDate}
          value={dropoffDate}
          // this should update the dropoffDate variable, then the term data field
          onChange={handleDropoffChange}
          autoOk={true}
        ></KeyboardDatePicker>
      </WhiteBox>
    </Container>
  );
}
/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flexGrow: 1,
  paddingBottom: unit * 6,
  color: "white",
  backgroundColor: colors.primary,
  backgroundImage: `url(${space})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const svgClassName = css({
  display: "block",
  fill: "currentColor",
});

const Header = styled("header")(svgClassName, {
  width: "100%",
  marginBottom: unit * 5,
  padding: unit * 2.5,
  position: "relative",
});

const StyledLogo = styled(Logo)(size(56), {
  display: "block",
  margin: "0 auto",
  position: "relative",
});

const StyledCurve = styled(Curve)(size("100%"), {
  fill: colors.primary,
  position: "absolute",
  top: 0,
  left: 0,
});

const Heading = styled("h1")({
  margin: `${unit * 3}px 0 ${unit * 6}px`,
});

const StyledRocket = styled(Rocket)(svgClassName, {
  width: 250,
});

export const StyledForm = styled("form")({
  width: "100%",
  maxWidth: 380,
  padding: unit * 3.5,
  borderRadius: 3,
  boxShadow: "6px 6px 1px rgba(0, 0, 0, 0.25)",
  color: colors.text,
  backgroundColor: "white",
});

const StyledInput = styled("input")({
  width: 16,
  // width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary,
  },
});

const StyledTextInput = styled("input")({
  width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary,
  },
});

const StyledSuggestionList = styled("ul")({
  width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary,
  },
});

export const StyledSelect = styled("select")({
  width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary,
  },
});

const StyledSpan = styled("span")({
  color: "black",
  padding: `${unit * 1.2}px ${unit * 1.2}px ${unit}px ${unit * 2}`,
  fontSize: 16,
  maxWidth: 112,
});

const ScrollBox = styled("div")({
  overflowY: `auto`,
  maxHeight: 300,
});

export const WhiteBox = styled(Box)({
  background: "white",
});
