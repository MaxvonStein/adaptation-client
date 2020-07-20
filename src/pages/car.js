import React, { Fragment } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import {
  Loading,
  Header,
  CarDetail,
  CarImage,
  PriceTable
} from "../components";
import { ActionButton } from "../containers";

export const GET_CAR_DETAILS = gql`
  query GetCarByVin($vin: String!) {
    car(vin: $vin) {
      make
      model
      vin
      type
      retailPrice
    }
  }
`;

export default function Car({ vin }) {
  const { data, loading, error } = useQuery(GET_CAR_DETAILS, {
    variables: { vin }
  });

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  return (
    <Fragment>
      {/* <Header image={data.launch.mission.missionPatch}>
        {data.launch.mission.name}
      </Header> */}
      <CarDetail {...data.car} />
      <CarImage car={data.car}></CarImage>
      <PriceTable car={data.car}></PriceTable>
    </Fragment>
  );
}
