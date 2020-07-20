import React from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { unit } from "../styles";
import Card from "@material-ui/core/Card";
import { GET_CAR_DETAILS } from "../pages/car";
import Loading from "./loading";

export default function CarDetail({ car }) {
  // const client = useApolloClient();

  return (
    <Card>
      <p>Car</p>
      <h5>
        {car.make} {car.model}
      </h5>
      <h5>{car.vin}</h5>
    </Card>
    // add photo
  );
}
