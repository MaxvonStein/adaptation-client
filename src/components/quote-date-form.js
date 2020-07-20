import React from "react";
import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  GET_CARS_VIEW_CUSTOMER,
  GET_CARS_CUSTOMER,
  GET_SORT_CARS,
  GET_CARS_LEASETOTALQUOTE,
  GET_CARS_LEASEQUOTE,
} from "../pages/cars";
import Loading from "./loading";
import Box from "@material-ui/core/Box";
import styled, { css } from "react-emotion";
import DateRangeForm from "./date-range-form";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { REQUERY_LEASEQUOTE } from "./quote-location-form";

// clean up all the extranious functions

// viewCars is included here for the updateCustomerLeaseMonthsRequery function, we pass it to requeryLeasequote in onCompleted
const UPDATE_LEASE_MONTHS = gql`
  mutation updateCustomerLeaseMonths(
    $customerLeaseMonths: Float!
    $viewCars: [Car]
  ) {
    updateCustomerLeaseMonths(
      customerLeaseMonths: $customerLeaseMonths
      viewCars: $viewCars
    ) @client
  }
`;

const UPDATE_PICKUP_DATE = gql`
  mutation updateCustomerPickupDate($customerPickupDate: Date!) {
    updateCustomerPickupDate(customerPickupDate: $customerPickupDate) @client
  }
`;

export default function QuoteDateForm({ setIsPricesLoading }) {
  const { data, loading, error } = useQuery(GET_CARS_VIEW_CUSTOMER);
  // problem is cars isn't client data - CLIENT.readqu..

  const [
    updatePickupDate,
    { loading: pickupDateLoading, error: pickupDateError },
  ] = useMutation(UPDATE_PICKUP_DATE);

  const [
    requeryLeasequote,
    { loading: requeryLeasequoteLoading, error: requeryLeasequoteError },
  ] = useMutation(REQUERY_LEASEQUOTE, {
    onCompleted() {
      setIsPricesLoading(false);
    },
  });

  // change to leaseMonths
  const [
    updateCustomerLeaseMonthsRequery,
    { loading: leaseMonthsRequeryLoading, error: leaseMonthsRequeryError },
  ] = useMutation(UPDATE_LEASE_MONTHS, {
    // probably just need LEASEQUOTE here
    refetchQueries: [{ query: GET_CARS_LEASEQUOTE }],
    // viewCars is passed to this mutation function, updateCustomerPickupLocationsRequery
    // so then why do we need the refetch query at all? GET_CARS_LEASEQUOTE is called in the requeryLeasequote resolver mutation
    awaitRefetchQueries: true,
    onCompleted({ updateCustomerLeaseMonths }) {
      // .viewCars isn't defined here
      requeryLeasequote({
        variables: { viewCars: updateCustomerLeaseMonths.viewCars },
      });
    },
  });

  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;

  const handlePickupChange = (date) => {
    const customerPickupDate = date.toISOString();
    updatePickupDate({ variables: { customerPickupDate } });
  };

  const handleLeaseMonthsChange = (customerLeaseMonths) => {
    setIsPricesLoading(true);
    updateCustomerLeaseMonthsRequery({
      variables: {
        viewCars: data.viewCars,
        customerLeaseMonths,
      },
    });
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateRangeForm
        onPickupChange={handlePickupChange}
        onLeaseMonthsChange={handleLeaseMonthsChange}
        initialLeaseMonths={data.customerLeaseMonths}
        initialPickup={data.customerPickupDate}
      />
    </MuiPickersUtilsProvider>
  );
}
