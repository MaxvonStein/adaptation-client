import React, { Fragment } from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Loading, ReserveForm } from "../components";
import { GET_CAR_CUSTOMER, GET_CUSTOMER } from "./cars";

export default function Reserve() {
  const client = useApolloClient();
  const { data, loading, error } = useQuery(GET_CUSTOMER);

  // const handleReserveClick = event => {
  //   event.preventDefault();
  //   client.writeData({ data: { cart: vin } });
  // };

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  if (!data.cartLease) return <p>Choose a car</p>;

  return (
    <Fragment>
      <h2>Reserve</h2>
      <ReserveForm />
    </Fragment>
  );
}
