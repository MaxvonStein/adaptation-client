import React, { Fragment } from "react";
import {
  useQuery,
  useApolloClient,
  useMutation,
  useLazyQuery,
} from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Loading, CarDetail, ReserveForm } from "../components";
import { ActionButton } from "../containers";
import { GET_CART } from "./details";
import { GET_CAR_DETAILS } from "./car";
import { GET_CAR_CUSTOMER, GET_CUSTOMER, LEASE_DATA } from "./cars";
import { periodEndDate } from "../dates";
import LeaseDetail from "../components/lease-detail";
import RegistrationDetail from "../components/registration-detail";
import LoadLeaseQuote from "../components/load-leasequote";
import Button from "@material-ui/core/Button";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import LeaseHighlights from "../components/lease-highlights";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const GET_CARTLEASE_CARTCAR = gql`
  query getCartLeaseCartCar {
    cartCar @client {
      vin
      year
      make
      model
    }
    cartLease @client {
      __typename
      pickupLocation
      dropoffLocation
      transportCost
      secondLegFee
      dropoffLegFee
      leaseTotal
      firstMonthSalesTax
      firstMonthRentalTax
      monthlySalesTax
      monthlyRentalTax
      proration
      dropoffLegSalesTax
      dropoffLegRentalTax
      paymentsTotal
      leaseFirst
      leaseMonthly
      customerPickupDate
      customerLeaseMonths
      vin
      yearMakeModel
      insuranceMonthly
      insuranceAccuracy
      customerTaxRate
      taxRateAccuracy
      customerState
      stateAccuracy
      createdDate
    }
    customerPickupDate @client
  }
`;

export const GET_CARTLEASE = gql`
  query cartLease @client {
    __typename
    pickupLocation
    dropoffLocation
    transportCost
    secondLegFee
    dropoffLegFee
    leaseTotal
    firstMonthSalesTax
    firstMonthRentalTax
    monthlySalesTax
    monthlyRentalTax
    proration
    dropoffLegSalesTax
    dropoffLegRentalTax
    paymentsTotal
    leaseFirst
    leaseMonthly
    customerPickupDate
    customerLeaseMonths
    vin
    yearMakeModel
    insuranceMonthly
    insuranceAccuracy
    customerTaxRate
    taxRateAccuracy
    customerState
    stateAccuracy
    createdDate
  }
`;

// export const LOAD_LEASEQUOTE = gql`
//   mutation loadLeaseQuote($quoteId: ID!) {
//     loadLeaseQuote(quoteId: $quoteId) @client
//   }
// `;

export const GET_LEASEQUOTE = gql`
  query leaseQuote($quoteId: ID!) {
    leaseQuote(quoteId: $quoteId) {
      pickupLocation
      dropoffLocation
      transportCost
      secondLegFee
      dropoffLegFee
      leaseTotal
      firstMonthSalesTax
      firstMonthRentalTax
      monthlySalesTax
      monthlyRentalTax
      proration
      dropoffLegSalesTax
      dropoffLegRentalTax
      paymentsTotal
      leaseFirst
      leaseMonthly
      customerPickupDate
      customerLeaseMonths
      vin
      yearMakeModel
      insuranceMonthly
      insuranceAccuracy
      customerTaxRate
      taxRateAccuracy
      customerState
      stateAccuracy
      createdDate
    }
  }
`;

export const UPDATE_CARTLEASE = gql`
  mutation updateCartLease($cartLeaseUpdates: Lease!) {
    updateCartLease(cartLeaseUpdates: $cartLeaseUpdates) @client
  }
`;

export default function Reserve({ "*": quoteId }) {
  const client = useApolloClient();
  const { data, loading, error } = useQuery(GET_CARTLEASE_CARTCAR, {
    // fetchPolicy: "network-only",
  });

  // const [
  //   loadLeaseQuote,
  //   { loading: leaseQuoteLoading, error: leaseQuoteError },
  // ] = useMutation(LOAD_LEASEQUOTE, {
  //   variables: { quoteId },
  //   onCompleted({ loadLeaseQuote }) {
  //     debugger;
  //     console.log("loadLeaseQuote onCompleted");
  //   },
  // });

  const [
    updateCartLease,
    { loading: cartLeaseLoading, error: cartLeaseError },
  ] = useMutation(UPDATE_CARTLEASE, {
    // strip back all these refetches/updates in both mutation functions now that we know what the issue was
    refetchQueries: [{ query: GET_CARTLEASE_CARTCAR }],
    awaitRefetchQueries: true,
    onCompleted({ updateCartLease }) {
      console.log("updateCartLease completed");
      console.log(updateCartLease);
    },
    update(cache, { data: { updateCartLease } }) {
      cache.writeQuery({
        query: GET_CARTLEASE,
        data: { cartLease: updateCartLease.cartLease },
      });
      // const { todos } = cache.readQuery({ query: GET_TODOS });
      // cache.writeQuery({
      //   query: GET_TODOS,
      //   data: { todos: todos.concat([addTodo]) },
      // });
      console.log("update updateCartLease");
      console.log(updateCartLease);
    },
  });

  // debug, doesn't look like GET_LEASEQUOTE is actually running
  const [
    getLeaseQuoteLoad,
    { loading: getLeaseQuoteLoading, data: getLeaseQuoteError },
  ] = useLazyQuery(GET_LEASEQUOTE, {
    // variables: { quoteId },
    // refetchQueries: [{ query: GET_CARTLEASE_CARTCAR }],
    // awaitRefetchQueries: true,
    onCompleted({ leaseQuote }) {
      console.log("getLeaseQuote onCompleted");
      console.log(leaseQuote);
      // client.writeData({
      //   data: {
      //     cartLease: { pickupLocation: leaseQuote.pickupLocation },
      //   },
      // });
      const updateResponse = updateCartLease({
        variables: { cartLeaseUpdates: leaseQuote },
      });
      console.log("updateResponse");
      console.log(updateResponse);
    },
  });

  const [isQuoteLoaded, setIsQuoteLoaded] = React.useState(false);

  // const handleReserveClick = event => {
  //   event.preventDefault();
  //   client.writeData({ data: { cart: vin } });
  // };

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  console.log("quoteId");
  console.log(quoteId);

  console.log("data");
  console.log(data);

  // if the car's available

  if (!data.cartLease.vin && !quoteId) return <p>Choose a car</p>;
  if (!data.cartLease.vin && !isQuoteLoaded) {
    // check into using .called on useLazyQuery here instead of isQuoteLoaded
    console.log("loadLeaseQuote");
    getLeaseQuoteLoad({ variables: { quoteId } });
    setIsQuoteLoaded(true);
  }

  if (!data.cartLease.vin) return <p>Choose a car</p>;

  return (
    <Fragment>
      <h2>Reserve this lease</h2>
      <LeaseHighlights lease={data.cartLease} />
      <Elements stripe={stripePromise}>
        <ReserveForm lease={data.cartLease} quoteId={quoteId} />
      </Elements>
    </Fragment>
  );
}
