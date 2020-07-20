import React, { Fragment } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Loading, CarDetail, ReserveForm } from "../components";
import { ActionButton } from "../containers";
// import { GET_CAR_DETAILS } from "./car";
import { GET_CAR_CUSTOMER, GET_CUSTOMER } from "../pages/cars";
import { periodEndDate } from "../dates";
import LeaseDetail from "../components/lease-detail";
import RegistrationDetail from "../components/registration-detail";
import Button from "@material-ui/core/Button";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export const LOAD_LEASEQUOTE = gql`
  mutation loadLeaseQuote($quoteId: ID!) {
    loadLeaseQuote(quoteId: $quoteId) @client {
      pickupLocation
    }
  }
`;

export default function LoadLeaseQuote({ quoteId }) {
  const client = useApolloClient();

  const [loadLeasequote, { loading, error }] = useMutation(LOAD_LEASEQUOTE, {
    variables: { quoteId },
  });

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  const leaseQuote = loadLeasequote({ variables: { quoteId } });
  // setIsLoading()

  console.log("LoadLeaseQuote quoteId");
  console.log(quoteId);

  // should there be a client resolver for loadLeasequote instead?  handle logic in resolver

  // if the car's available, write it to cartCar and cartLease

  return <Loading></Loading>;
}
