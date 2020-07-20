import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { GET_CAR_DETAILS } from "../pages/car";
import { Loading, Header, CarDetail, CarImage } from "../components";

export default function CartDetail({ vin }) {
  const { data, loading, error } = useQuery(GET_CAR_DETAILS, {
    variables: { vin }
  });

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  return (
    <p>
      {data.car.make} {data.car.model} {data.car.vin}
    </p>
  );
}
