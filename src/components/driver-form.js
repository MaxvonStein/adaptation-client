import React, { Fragment } from "react";
import { useQuery } from "@apollo/react-hooks";
import { GET_CAR_DETAILS } from "../pages/car";
import { Loading, Header, CarDetail, CarImage } from "../components";
import { GET_CUSTOMER } from "../pages/cars";
import TextField from "@material-ui/core/TextField";

export default function DriverForm() {
  const { data, loading, error } = useQuery(GET_CUSTOMER);

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  return (
    <Fragment>
      <p>Driver</p>
      <form>
        <TextField label="First Name" />
        <TextField label="Last Name" />
        <TextField label="Driver License Number" />
        <TextField label="Address" />
      </form>
    </Fragment>
  );
}
