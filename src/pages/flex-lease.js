import React, { Fragment } from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  Loading,
  Header,
  CarDetail,
  CarImage,
  LeasePriceTable,
  LeaseContinue,
} from "../components";
import { ActionButton } from "../containers";
import { GET_CART } from "./details";
import { GET_CAR_DETAILS } from "./car";

export default function Car({ vin }) {
  const client = useApolloClient();
  const { data, loading, error } = useQuery(GET_CAR_DETAILS, {
    variables: { vin },
  });

  const handleReserveClick = (event) => {
    event.preventDefault();
    client.writeData({ data: { cart: vin } });
  };

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  // write the cartCar on render so we don't need to mess with a click handler at all.  don't see why this would fire (render) more than once on navigate
  // problem here is that if the customer has more than one window open they could click on one reserve button and see the car from the most recently loaded detail page
  // client.writeQuery({ query: GET_CART, data: { cartCar: data.car } });
  // client.writeData({ data: { cartCar: data.car } });

  return (
    <Fragment>
      {/* <Header image={data.launch.mission.missionPatch}>
        {data.launch.mission.name}
      </Header> */}
      <CarDetail {...data.car} listingType="flex-lease" />
      <CarImage car={data.car}></CarImage>
      <LeasePriceTable car={data.car}></LeasePriceTable>
      <LeaseContinue
        vin={vin}
        // handleReserveClick={handleReserveClick}
      />
    </Fragment>
  );
}
