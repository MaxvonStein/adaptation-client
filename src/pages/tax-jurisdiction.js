import React, { Fragment } from "react";
import {
  useApolloClient,
  useMutation,
  useQuery,
  useLazyQuery,
} from "@apollo/react-hooks";
import gql from "graphql-tag";
import TaxJurisdictionForm from "../components/tax-jurisdiction-form";

import { Loading } from "../components";
import { priceFormat } from "../number-formats";
import Box from "@material-ui/core/Box";
import { Typography } from "@material-ui/core";
import { UPDATE_CUSTOMER_STATE } from "../components/customer-form";
import { GET_RATE } from "../components/lease-price-table";

export const GET_CUSTOMERSTATE_TAXRATE = gql`
  query getCustomerTaxrate {
    customerState @client
    stateAccuracy @client
    customerTaxRate @client
    taxRateAccuracy @client
    customerCounty @client
  }
`;

export default function TaxJurisdiction() {
  const client = useApolloClient();

  const { data, loading, error } = useQuery(GET_CUSTOMERSTATE_TAXRATE);

  // const [
  //   updateCustomerState,
  //   { loading: customerLoading, error: customerError }
  // ] = useMutation(UPDATE_CUSTOMERSTATE);

  // if (loading) return <Loading />;
  // if (error) return <p>An error occurred</p>;

  const [
    updateCustomerState,
    { loading: customerLoading, error: customerError },
  ] = useMutation(UPDATE_CUSTOMER_STATE);

  const [getRate, { loading: rateLoading, data: rateData }] = useLazyQuery(
    GET_RATE,
    {
      onCompleted(data) {
        client.writeQuery({
          query: GET_CUSTOMERSTATE_TAXRATE,
          data: {
            customerTaxRate: data.rate.rate,
            taxRateAccuracy: "positive",
            customerCounty: data.rate.taxJurisdiction,
          },
        });
      },
    }
  );

  const handleStateChange = (customerState) => {
    updateCustomerState({ variables: { customerState } });
    // client.writeQuery({
    //   query: GET_CUSTOMERSTATE_TAXRATE,
    //   data: { customerState, stateAccuracy: "positive" },
    // });
  };

  const handleJurisdictionChange = (customerState, taxJurisdiction) => {
    // resolver that will query the taxJurisdictions API?
    getRate({ variables: { countyName: taxJurisdiction } });
  };

  return (
    <Fragment>
      <Box>
        <TaxJurisdictionForm
          onStateChange={handleStateChange}
          onJurisdictionChange={handleJurisdictionChange}
          initialCustomerState={data.customerState}
          initialTaxJurisdiction={data.customerCounty}
        />
      </Box>
      {data.taxRateAccuracy === "positive" && (
        <Box style={{ display: "flex", marginTop: 36 }}>
          <Box style={{ flex: "auto" }}>
            <Typography>
              Sales tax in{" "}
              {data.customerCounty
                ? data.customerCounty + " County"
                : data.customerState}
            </Typography>
          </Box>
          <Box style={{ flex: "initial" }}>
            <Typography variant="h4">
              {Number(data.customerTaxRate).toFixed(3)}%
            </Typography>
          </Box>
        </Box>
      )}
    </Fragment>
  );
}
