import React, { Component, Fragment } from "react";
// import styled, { css } from "react-emotion";
import { size } from "polished";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { GET_CARFORM, GET_CUSTOMER, GET_SORT_CARS } from "../pages/cars";
import { ADD_OR_REMOVE_FILTERS_CARS, SORT_CARS } from "./cars-forms";

import space from "../assets/images/space.jpg";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { ReactComponent as Curve } from "../assets/curve.svg";
import { ReactComponent as Rocket } from "../assets/rocket.svg";
import { WhiteBox } from "./quote-location-form";
import { colors, unit } from "../styles";
import { makeStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import SubtitlesIcon from "@material-ui/icons/Subtitles";
import IconSelect from "./icon-select";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import InputBase from "@material-ui/core/InputBase";
import { findTaxRate } from "../sales-tax";

const useStyles = makeStyles((theme) => ({
  prefixAdornment: {
    whiteSpace: "pre",
    padding: "6px 0 7px",
  },
  formcapBox: {
    paddingBottom: 6,
    "& .MuiInputBase-root": {
      fontSize: theme.typography.body2.fontSize,
    },
  },
}));

export const UPDATE_CUSTOMER_STATE = gql`
  mutation updateCustomerState($customerState: String!) {
    updateCustomerState(customerState: $customerState) @client
  }
`;

export const UPDATE_CUSTOMER_STATE_TAXRATE = gql`
  mutation updateCustomerStateTaxrate(
    $customerState: String!
    $customerTaxRate: Float!
    $taxRateAccuracy: String!
  ) {
    updateCustomerStateTaxrate(
      customerState: $customerState
      customerTaxRate: $customerTaxRate
      taxRateAccuracy: $taxRateAccuracy
    ) @client
  }
`;

export default function CustomerForm() {
  const classes = useStyles();
  const client = useApolloClient();
  const { customerState } = client.readQuery({
    query: GET_CUSTOMER,
  });

  // the same mutate function appears in filter-form
  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  // use this function first, it filters on a fresh cars query and then sorts on completion
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

  const [
    updateCustomerState,
    { loading: customerLoading, error: customerError },
  ] = useMutation(UPDATE_CUSTOMER_STATE, {
    // do we need this?
    refetchQueries: [{ query: GET_CARFORM }],
    awaitRefetchQueries: true,
  });

  const [
    updateCustomerStateTaxRateAccuracy,
    { loading: customerStateTaxLoading, error: customerStateTaxError },
  ] = useMutation(UPDATE_CUSTOMER_STATE_TAXRATE, {
    refetchQueries: [{ query: GET_CARFORM }],
    awaitRefetchQueries: true,
    // onCompleted: async () => {
    //   const { cars, isAlphabetical } = await client.readQuery({
    //     query: GET_SORT_CARS
    //   });

    //   debugger;
    // }
    //   filterCarsSort({
    //     variables: { cars },
    //     context: { isAlphabetical }
    //   });
    // }
  });

  const handleLocationChangeOld = (event) => {
    const customerState = event.target.value;
    // client.writeQuery({ query: GET_CUSTOMER, data: { customerState } });
    updateCustomerState({ variables: { customerState } });
  };

  const handleLocationChange = async (event) => {
    const customerStateInput = event.target.value;
    if (customerStateInput === customerState) return;
    // const taxRateArray = findTaxRate(customerStateInput);
    // let customerTaxRate, taxRateAccuracy;

    // if the customer goes and selects state again after they've already inputted county or zip code this is going to override that more accurate input
    // could check to see whether the accuracy is "positive" and state matches what we have first and jsut hold off if it does

    // if (taxRateArray.length === 1) {
    //   customerTaxRate = taxRateArray[0];
    //   taxRateAccuracy = "positive";
    // } else if (taxRateArray[0] === 0) {
    //   customerTaxRate = 8;
    //   taxRateAccuracy = "guess";
    // } else {
    //   customerTaxRate = (taxRateArray[0] + taxRateArray[1]) / 2;
    //   taxRateAccuracy = "guess";
    // }

    // this handler queries cars and filters and sorts again, that's so the deliveryDays updates on /cars
    // could change over to the update logic used elsewhere

    // write the new customerState here so it's picked up in the query fro cars
    // using constant only to activate async await functionality
    // const customerStateResponse = await updateCustomerStateTaxRate({
    //   variables: { customerState, customerTaxRate, taxRateAccuracy },
    // });

    const customerStateResponse = await updateCustomerState({
      variables: { customerState: customerStateInput },
    });

    // await query for cars
    const { cars, sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT_CARS,
    });
    filterCarsSort({
      variables: { cars, value: false, isChecked: false, attribute: false },
      context: { sortAttribute, isSortReverse },
    });

    localStorage.setItem("state", customerStateInput);
  };

  return (
    <Box className={classes.formcapBox}>
      <Select
        // value={customerState}
        defaultValue={customerState}
        onChange={handleLocationChange}
        input={<InputBase />}
        startAdornment={
          <span className={classes.prefixAdornment}>{"Based in "}</span>
        }
      >
        <MenuItem value="New York">New York</MenuItem>
        <MenuItem value="New Jersey">New Jersey</MenuItem>
        <MenuItem value="Other">Other State</MenuItem>
      </Select>
    </Box>
  );
}
