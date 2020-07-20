import React from "react";
import {
  useApolloClient,
  useQuery,
  useMutation,
  useLazyQuery
} from "@apollo/react-hooks";
import gql from "graphql-tag";
import { GET_CUSTOMER } from "../pages/cars";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { numberFormat, priceFormat } from "../number-formats";
import { findTaxRate } from "../sales-tax";
import { estRegistrationFee } from "../registration-fee";

const useStyles = makeStyles({
  table: {
    minWidth: 552
  }
});

export const GET_COUNTY = gql`
  query GetCountyByZip($zip: String!) {
    county(zip: $zip) {
      county
      county_code
    }
  }
`;

export const GET_RATE = gql`
  query GetRateByCounty($countyName: String!) {
    rate(countyName: $countyName) {
      rate
      taxJurisdiction
    }
  }
`;

export default function PriceTable({ car }) {
  const client = useApolloClient();
  const { data, loading, error } = useQuery(GET_CUSTOMER);

  // best way to work this in?
  // if (!stateTaxRate) {
  //   // seed customerTaxRate if it's empty
  //   const stateTaxRate = findTaxRate(data.customerState);
  //   // client.writeQuery({
  //   //   query: GET_CUSTOMER,
  //   //   data: { customerTaxRate }
  //   // });
  // }

  const customerStateRate = findTaxRate(data.customerState);

  if (customerStateRate.length === 1 && !data.customerTaxRate) {
    client.writeQuery({
      query: GET_CUSTOMER,
      data: { customerTaxRate: customerStateRate }
    });
  }

  // price constants
  // temporary estimates until all fields come over from database
  // let firstMonthSalesTax = null;
  // let monthlySalesTax = null;
  const firstEstimate = car.leaseFirst
    ? car.leaseFirst
    : 0.12 * car.retailPrice;

  const monthlyEstimate = car.leaseMonthly
    ? car.leaseMonthly
    : 0.03 * car.retailPrice;

  // if (data.customerTaxRate) {
  //   firstMonthSalesTax =
  //     data.customerTaxRate &&
  //     data.customerTaxRate.map(rate => (rate / 100) * firstEstimate);

  //   monthlySalesTax =
  //     data.customerTaxRate &&
  //     data.customerTaxRate.map(rate => (rate / 100) * monthlyEstimate);

  //   // just calculate these in priceTableBody
  //   let totalFirstMonth = firstMonthSalesTax.map(tax => firstEstimate + tax);

  //   let totalMonthly = monthlySalesTax.map(tax => monthlyEstimate + tax);
  // }

  // mutation hooks
  // const [
  //   getCounty,
  //   { loading: countyLoading, error: countyError }
  // ] = useMutation(GET_COUNTY);

  const [getRate, { loading: rateLoading, data: rateData }] = useLazyQuery(
    GET_RATE,
    {
      onCompleted(data) {
        client.writeData({ data: { customerTaxRate: data.rate.rate } });
      }
    }
  );

  const [
    getCounty,
    { loading: countyLoading, data: countyData }
  ] = useLazyQuery(GET_COUNTY, {
    onCompleted(data) {
      client.writeData({ data: { customerCounty: data.county.county } });
      getRate({ variables: { countyName: data.county.county } });
    }
  });

  // const {
  //   data: testData,
  //   loading: testLoading,
  //   error: testError
  // } = useQuery(GET_COUNTY, { variables: { zip: "10994" } });

  // handlers
  const handleZipType = event => {
    const target = event.target;
    const searchText = target.value;
    client.writeData({ data: { customerZip: searchText } });
  };

  const handleFindSubmit = event => {
    client.writeData({ data: { isZipDialog: true } });
  };

  const handleDialogClose = event => {
    client.writeData({ data: { isZipDialog: false } });
  };

  const handleDialogSubmit = async event => {
    const zip = await data.customerZip;
    getCounty({ variables: { zip } });
    client.writeData({ data: { isZipDialog: false } });
  };

  const classes = useStyles();

  if (loading) return <p>Loading...</p>;

  // debugger;

  return (
    // add a term selector or toggle?  under 3 months or over 3 months.
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>First Month</TableCell>
            <TableCell>Monthly Payment</TableCell>
          </TableRow>
        </TableHead>
        <PriceTableBody
          car={car}
          customerState={data.customerState}
          customerCounty={data.customerCounty}
          customerTaxRate={
            data.customerTaxRate ? [data.customerTaxRate] : customerStateRate
          }
          firstMonthPrice={firstEstimate}
          monthlyPrice={monthlyEstimate}
          // firstMonthSalesTax={firstMonthSalesTax ? firstMonthSalesTax : [0]}
          // monthlySalesTax={monthlySalesTax ? monthlySalesTax : [0]}
          handleFindSubmit={handleFindSubmit}
          handleZipType={handleZipType}
          handleDialogSubmit={handleDialogSubmit}
          handleDialogClose={handleDialogClose}
          isZipDialog={data.isZipDialog}
        />
      </Table>
    </TableContainer>
  );
}

const PriceTableBody = function({
  car,
  customerState,
  customerCounty,
  customerTaxRate,
  firstMonthPrice,
  monthlyPrice,
  handleFindSubmit,
  handleZipType,
  handleDialogSubmit,
  handleDialogClose,
  isZipDialog
}) {
  const firstMonthSalesTax = customerTaxRate.map(
    rate => (rate / 100) * firstMonthPrice
  );
  const monthlySalesTax = customerTaxRate.map(
    rate => (rate / 100) * monthlyPrice
  );
  const totalFirstMonth = firstMonthSalesTax.map(tax => firstMonthPrice + tax);
  const totalMonthly = monthlySalesTax.map(tax => monthlyPrice + tax);
  // const totalFirstMonth = firstMonthSalesTax.map(tax => firstMonthPrice + tax);
  // const totalMonthly = monthlySalesTax.map(tax => monthlyPrice + tax);

  return (
    <TableBody>
      <TableRow>
        <TableCell>
          {car.year} {car.make} {car.model}
        </TableCell>
        <TableCell align="right">{priceFormat(firstMonthPrice)}</TableCell>
        <TableCell align="right">{priceFormat(monthlyPrice)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          Sales Tax
          {(customerState === "New York" || customerState === "New Jersey") &&
            " in " + customerState + " "}
          {customerCounty && customerCounty + " County "}
          {"- "}
          {customerTaxRate[0] + "%"}
          {customerTaxRate[1] && " - " + customerTaxRate[1] + "%"}
          {customerTaxRate.length === 2 && (
            <Button onClick={handleFindSubmit}>FIND TAX RATE</Button>
          )}
          <Dialog
            open={isZipDialog}
            onClose={handleDialogClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Enter zip code</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To subscribe to this website, please enter your email address
                here. We will send updates occasionally.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Zip code"
                type="number"
                onChange={handleZipType}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDialogSubmit} color="primary">
                Subscribe
              </Button>
            </DialogActions>
          </Dialog>
        </TableCell>
        <TableCell align="right">
          {priceFormat(firstMonthSalesTax[0])}
          {firstMonthSalesTax[1] && " - " + priceFormat(firstMonthSalesTax[1])}
        </TableCell>
        <TableCell align="right">
          {priceFormat(monthlySalesTax[0])}
          {monthlySalesTax[1] && " - " + priceFormat(monthlySalesTax[1])}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Total</TableCell>
        <TableCell align="right">
          {priceFormat(totalFirstMonth[0])}
          {totalFirstMonth[1] && " - " + priceFormat(totalFirstMonth[1])}
        </TableCell>
        <TableCell align="right">
          {priceFormat(totalMonthly[0])}
          {totalMonthly[1] && " - " + priceFormat(totalMonthly[1])}
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
