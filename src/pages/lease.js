import React, { Fragment } from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  Loading,
  DateDetail,
  LocationDetail,
  CarDetail,
  CarImage,
  LeaseContinue,
} from "../components";
import { ActionButton } from "../containers";
import { GET_CART } from "./details";
import { GET_CAR_DETAILS } from "./car";
import { GET_CAR_CUSTOMER, GET_CUSTOMER } from "./cars";
import { periodEndDate } from "../dates";
import LeaseDetail from "../components/lease-detail";
import RegistrationDetail from "../components/registration-detail";
import Button from "@material-ui/core/Button";

// how to allow for data to come over as a uri parameter?
// vin could help load the cartCar but then we need the customer sales tax and all that
// create a table with quotes and link using an id?
// for now just have the vin and go to a car page where you can create a lease again

export default function Lease() {
  // const client = useApolloClient();
  const { data, loading, error } = useQuery(GET_CUSTOMER);

  // const handleReserveClick = event => {
  //   event.preventDefault();
  //   client.writeData({ data: { cart: vin } });
  // };

  if (loading || !data) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;
  // what changed here, why does it error?  typename off somewhere?  changed?  lease fields?
  if (!data.cartLease || !data.cartCar) return <p>Choose a car</p>;

  return (
    <Fragment>
      <h2>Lease details</h2>
      <DateDetail
        pickupDate={data.customerPickupDate}
        dropoffDate={
          new Date(
            periodEndDate(
              new Date(data.customerPickupDate),
              data.customerLeaseMonths
            )
          )
        }
        customerLeaseMonths={data.customerLeaseMonths}
      />
      <LocationDetail
        pickupLocation={data.customerPickupLocation}
        dropoffLocation={data.customerDropoffLocation}
      />
      <CarDetail car={data.cartCar} listingType="flex-lease" />
      <RegistrationDetail
        customerState={data.customerState}
        stateAccuracy={data.stateAccuracy}
      />
      <LeaseDetail
        vin={data.cartCar.vin}
        customerLeaseMonths={data.customerLeaseMonths}
        customerPickupDate={data.customerPickupDate}
        insuranceMonthly={data.insuranceMonthly}
        insuranceAccuracy={data.insuranceAccuracy}
        leaseQuote={data.cartLease}
        customerState={data.customerState}
        stateAccuracy={data.stateAccuracy}
        taxRateAccuracy={data.taxRateAccuracy}
        customerTaxRate={data.customerTaxRate}
      />
      {/* <Button onClick={() => {}}>RESERVE</Button> */}
      <LeaseContinue
        customerTaxRate={data.customerTaxRate}
        taxRateAccuracy={data.taxRateAccuracy}
        customerState={data.customerState}
        stateAccuracy={data.stateAccuracy}
        insuranceMonthly={data.insuranceMonthly}
        insuranceAccuracy={data.insuranceAccuracy}
      />
    </Fragment>
  );
}
