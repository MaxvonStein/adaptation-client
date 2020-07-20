import React, { Fragment } from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { Loading, Header, CarDetail, CarImage } from "../components";
import CartDetail from "../components/cart-detail";
import DriverForm from "../components/driver-form";
import PurchaseButton from "../components/purchase-button";
import ReserveForm from "../components/reserve-form";
import InsuranceForm from "../components/insurance-form";

export const GET_CART = gql`
  query getCart {
    cartVin @client
    isUsingDeposit @client
    # maybe refactor to move this someplace else, not quite part of the cart
    customerEmail @client
    pickupDate @client
    dropoffDate @client
  }
`;

export default function Details() {
  const { data, loading, error } = useQuery(GET_CART);

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  return (
    <Fragment>
      {/* <Header image={data.launch.mission.missionPatch}>
        {data.launch.mission.name}
      </Header> */}
      {!data || !data.cartVin ? (
        <p>Choose a car</p>
      ) : (
        <Fragment>
          <p>{data.cartVin}</p>
          <CartDetail vin={data.cartVin}></CartDetail>
          <DriverForm />
          <ReserveForm />
          {data.isUsingDeposit ? (
            <PurchaseButton title="lease deposit" price={50} />
          ) : (
            <Fragment>
              <p>insurance document form here</p>
              <InsuranceForm />
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
