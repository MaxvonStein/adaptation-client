import React from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { unit } from "../styles";
import Card from "@material-ui/core/Card";
import Loading from "./loading";
import { GET_LEASEQUOTE } from "../pages/cars";
import LeaseDetailsBox from "./lease-details-box";

export default function LeaseDetail({
  vin,
  customerPickupDate,
  customerLeaseMonths,
  insuranceMonthly,
  insuranceAccuracy,
  leaseQuote,
  customerState,
  stateAccuracy,
  taxRateAccuracy,
  customerTaxRate,
}) {
  // const client = useApolloClient();
  // const { data, loading, error } = useQuery(GET_LEASEQUOTE, {
  //   variables: { vin }
  // });

  // if (loading) return <Loading />;
  // if (error) return <p>ERROR: {error.message}</p>;

  // console.log(data.car.leaseQuote);

  return (
    <LeaseDetailsBox
      {...leaseQuote}
      customerPickupDate={customerPickupDate}
      customerLeaseMonths={customerLeaseMonths}
      insuranceMonthly={insuranceMonthly}
      insuranceAccuracy={insuranceAccuracy}
      customerState={customerState}
      stateAccuracy={stateAccuracy}
      customerTaxRate={customerTaxRate}
      taxRateAccuracy={taxRateAccuracy}
    />
  );
}
