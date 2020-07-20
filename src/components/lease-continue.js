import React from "react";
import gql from "graphql-tag";
import { useMutation, useQuery, useApolloClient } from "@apollo/react-hooks";
import { GET_CARTLEASE, UPDATE_CARTLEASE } from "../pages/reserve";
import { Link, useNavigate } from "@reach/router";
import styled from "react-emotion";
import { size } from "polished";

import { unit, colors } from "../styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import MenuItem from "./menu-item";
import { GET_CUSTOMER } from "../pages/cars";
import { GET_CART } from "../pages/details";

// export const ADD_TO_CART = gql`
//   mutation addCarToCart($vin: String!) {
//     addCarToCart(vin: $vin) @client
//   }
// `;

export default function LeaseContinue({
  customerTaxRate,
  taxRateAccuracy,
  customerState,
  stateAccuracy,
  insuranceMonthly,
  insuranceAccuracy,
}) {
  // const [toReserve, setToLease] = React.useState(false);
  const client = useApolloClient();

  const navigate = useNavigate();

  const [
    updateCartLease,
    { loading: cartLeaseLoading, error: cartLeaseError },
  ] = useMutation(UPDATE_CARTLEASE);

  const handleClick = async (event) => {
    // why doesn't this seem to update?
    // try awaiting a mutation?
    const cartLeaseResponse = await updateCartLease({
      variables: {
        cartLeaseUpdates: {
          customerTaxRate,
          taxRateAccuracy,
          customerState,
          stateAccuracy,
          insuranceMonthly,
          insuranceAccuracy,
          createdDate: new Date().toISOString(),
        },
      },
    });
    // client.writeQuery({
    //   query: GET_CARTLEASE,
    //   data: {
    //     cartLease: {
    //       customerTaxRate,
    //       taxRateAccuracy,
    //       customerState,
    //       stateAccuracy,
    //       insuranceMonthly,
    //       insuranceAccuracy,
    //     },
    //   },
    // });
    console.log(cartLeaseResponse);
    navigate("/reserve/driver");
  };

  // const { data, loading, error } = useQuery(GET_CART);

  return (
    <Box>
      <Button
        // component={Link}
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        Reserve
      </Button>
    </Box>
  );
}
