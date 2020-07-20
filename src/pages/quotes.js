import React, { Fragment } from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
// import QuoteForm from "../components/quote-form";
import QuoteList from "../components/quote-list";
import QuoteFilterForm from "../components/quote-filter-form";
// import PickupLocationInput from "../components/pickup-location-input";
// import SortForm from "../components/sort-form";
import DateFnsUtils from "@date-io/date-fns";
import { GET_CARS, GET_CUSTOMER, GET_CARFORM } from "./cars";

import {
  Header,
  Loading,
  CarsForms,
  FilterForm,
  CustomerForm,
  CarList,
  ChipSet,
  SortForm,
} from "../components";
import QuoteDateForm from "../components/quote-date-form";
import QuoteLocationForm from "../components/quote-location-form";

// export const GET_CARS = gql`
//   query carList {
//     cars {
//       make
//       model
//       vin
//       deliveryDays @client
//     }
//   }
// `;

// export const GET_VIEW = gql`
//   query getViewCars {
//     viewCars @client {
//       make
//       model
//       vin
//       supplier
//       # deliveryDays
//     }
//   }
// `;

export default function Quotes() {
  const { data, loading, error } = useQuery(GET_CARFORM);
  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;
  return (
    // does this have to be so high up?
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Fragment>
        <Header />
        <CustomerForm />
        <QuoteDateForm />
        <QuoteLocationForm />
        <QuoteFilterForm />
        <SortForm isLease={true} />
        <QuoteList />
      </Fragment>
    </MuiPickersUtilsProvider>
  );
}
