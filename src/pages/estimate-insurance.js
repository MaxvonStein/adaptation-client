import React, { Fragment } from "react";
import {
  useApolloClient,
  useMutation,
  useQuery,
  useLazyQuery,
} from "@apollo/react-hooks";
import gql from "graphql-tag";
import EstimateInsuranceForm from "../components/estimate-insurance-form";

import { Loading } from "../components";
import { priceFormat } from "../number-formats";
import Box from "@material-ui/core/Box";
import { Typography } from "@material-ui/core";
import { UPDATE_CUSTOMER_STATE } from "../components/customer-form";

export const GET_INSURANCEESTIMATE = gql`
  query getInsuranceestimate($customerState: String!, $driver: String!) {
    insuranceEstimate(customerState: $customerState, driver: $driver) {
      lowEstimate
      averageEstimate
      highEstimate
    }
  }
`;

export const GET_INSURANCE = gql`
  query getInsurance {
    insuranceMonthly
    insuranceAccuracy
  }
`;

// const [getRate, { loading: rateLoading, data: rateData }] = useLazyQuery(
//   GET_RATE,
//   {
//     onCompleted(data) {
//       client.writeData({ data: { customerTaxRate: data.rate.rate } });
//     }
//   }
// );

export default function EstimateInsurance() {
  const client = useApolloClient();

  const { data, loading, error } = useQuery(GET_INSURANCE);

  const [
    estimateInsurance,
    { loading: estimateInsuranceLoading, error: estimateInsuranceError },
  ] = useLazyQuery(GET_INSURANCEESTIMATE, {
    onCompleted({ insuranceEstimate }) {
      console.log(insuranceEstimate);
      client.writeData({
        data: {
          insuranceMonthly: insuranceEstimate.averageEstimate,
          insuranceAccuracy: "estimate",
        },
      });
    },
  });

  const [
    updateCustomerState,
    { loading: customerLoading, error: customerError },
  ] = useMutation(UPDATE_CUSTOMER_STATE);

  // if (loading) return <Loading />;
  // if (error) return <p>An error occurred</p>;

  const handleChange = async (customerState, driver) => {
    estimateInsurance({
      variables: { customerState, driver },
    });
    client.writeData({ data: { customerState } });
    // updateCustomerState({ variables: { customerState } });
  };

  return (
    <Fragment>
      <Box>
        <EstimateInsuranceForm
          onChange={handleChange}
          onStateSelect={(customerState) => {
            updateCustomerState({ variables: { customerState } });
            client.writeData({ data: { stateAccuracy: "positive" } });
          }}
          initialCustomerState={data.customerState || ""}
          initialDriver={null}
        ></EstimateInsuranceForm>
      </Box>
      {data.insuranceAccuracy === "estimate" && (
        <Box style={{ display: "flex", marginTop: 36 }}>
          <Box style={{ flex: "auto" }}>
            <Typography>Estimated insurance premium</Typography>
            <Typography>
              Collission and comprehensive coverage, $1,000 deductibles
            </Typography>
          </Box>
          <Box style={{ flex: "initial" }}>
            <Typography variant="h4">
              {priceFormat(data.insuranceMonthly)}
            </Typography>
            <Typography>per month</Typography>
          </Box>
        </Box>
      )}
    </Fragment>
  );
}
