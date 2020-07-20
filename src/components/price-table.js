import React from "react";
import { useApolloClient, useQuery } from "@apollo/react-hooks";
import { GET_CUSTOMER } from "../pages/cars";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { numberFormat, priceFormat } from "../number-formats";
import { findTaxRate } from "../sales-tax";
import { estRegistrationFee } from "../registration-fee";

const useStyles = makeStyles({
  table: {
    minWidth: 552
  }
});

export default function PriceTable({ car, listingType }) {
  const client = useApolloClient();
  const { customerState } = client.readQuery({
    query: GET_CUSTOMER
  });

  const taxRate = findTaxRate(customerState);

  const purchaseSalesTax = taxRate.map(rate => (rate / 100) * car.retailPrice);

  const registrationFee = estRegistrationFee(customerState, car.type);

  const totalCashPrice = purchaseSalesTax.map(
    tax => car.retailPrice + tax + registrationFee
  );

  const classes = useStyles();

  return (
    // add a term selector or toggle?  under 3 months or over 3 months.
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="">
        <TableBody>
          <TableRow>
            <TableCell>
              {car.year} {car.make} {car.model}
            </TableCell>
            <TableCell align="right">{priceFormat(car.retailPrice)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              Sales Tax
              {(customerState === "New York" ||
                customerState === "New Jersey") &&
                " in " + customerState + " - "}
              {taxRate[0] + "%"}
              {taxRate[1] && " - " + taxRate[1] + "%"}
            </TableCell>
            <TableCell align="right">
              {priceFormat(purchaseSalesTax[0])}
              {purchaseSalesTax[1] && " - " + priceFormat(purchaseSalesTax[1])}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Registration Fee (est.)</TableCell>
            <TableCell align="right">{priceFormat(registrationFee)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell align="right">
              {priceFormat(totalCashPrice[0])}
              {totalCashPrice[1] && " - " + priceFormat(totalCashPrice[1])}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
