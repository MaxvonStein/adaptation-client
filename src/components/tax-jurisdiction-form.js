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
import { findTaxRate } from "../sales-tax";
import { newYorkTaxJurisdictions } from "../constants";

const useStyles = makeStyles({
  formRow: {
    marginTop: 14,
  },
});

export default function TaxJurisdictionForm({
  onStateChange,
  onJurisdictionChange,
  initialCustomerState,
  initialTaxJurisdiction,
}) {
  const classes = useStyles();
  const [customerState, setCustomerState] = React.useState(
    initialCustomerState
  );
  const [isJurisdictions, setIsJurisdictions] = React.useState(false);
  const [taxJurisdiction, setTaxJurisdiction] = React.useState(
    initialTaxJurisdiction || ""
  );

  const handleStateChange = (event) => {
    // set state
    const target = event.target;
    const newCustomerState = target.value;
    setCustomerState(newCustomerState);
    const taxRateArray = findTaxRate(newCustomerState);
    setIsJurisdictions(taxRateArray.length !== 1);
    onStateChange(newCustomerState);
  };

  const handleJurisdictionChange = (event) => {
    const target = event.target;
    const newTaxJurisdiction = target.value;
    setTaxJurisdiction(newTaxJurisdiction);
    onJurisdictionChange(customerState, newTaxJurisdiction);
  };

  return (
    <Fragment>
      <Box className={classes.formRow}>
        <FormControl style={{ minWidth: 240 }}>
          <InputLabel>State</InputLabel>
          <Select
            // defaultValue={"New York"}
            name="customerState"
            onChange={handleStateChange}
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
      {(isJurisdictions || customerState === "New York") && (
        <Box
          className={classes.formRow}
          style={{ display: "flex", alignItems: "center" }}
        >
          <FormControl style={{ minWidth: 240 }}>
            <InputLabel>New York County</InputLabel>
            <Select
              value={taxJurisdiction}
              name="jurisdiction"
              onChange={handleJurisdictionChange}
            >
              {newYorkTaxJurisdictions.map((jurisdiction) => (
                <MenuItem value={jurisdiction}>{jurisdiction}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <InfoTooltip message="Credit history is one factor insurance companies use to determine premiums." />
        </Box>
      )}
    </Fragment>
  );
}
