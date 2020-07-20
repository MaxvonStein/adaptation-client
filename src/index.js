import React from "react";
import ReactDOM from "react-dom";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider, useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { createUploadLink } from "apollo-upload-client";

import { GET_CARS } from "./pages/cars";
import { SORT_CARS } from "./components/cars-forms";

import Pages from "./pages";
import Login from "./pages/login";
import { resolvers, typeDefs } from "./resolvers";
import { dateOnly } from "./dates";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import grey from "@material-ui/core/colors/grey";
import blue from "@material-ui/core/colors/blue";
import purple from "@material-ui/core/colors/purple";
import CssBaseline from "@material-ui/core/CssBaseline";
import injectStyles from "./styles";
import {
  filtersInitial,
  cartLeaseInitial,
  customerDropoffLocationInitial,
} from "./constants";
import { UPDATE_CUSTOMER_STATE } from "./components/customer-form";
// import _ from "./env";

// Set up our apollo-client to point at the server we created
// this can be local or a remote endpoint
const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  // link: new HttpLink({
  //   uri: "http://localhost:4000/graphql",
  //   headers: {
  //     authorization: localStorage.getItem("token"),
  //     "client-name": "Space Explorer [web]",
  //     "client-version": "1.0.0",
  //   },
  // }),
  //@ts-ignore, don't need this we're working in js
  link: createUploadLink({
    // using the ip throws a cors error
    // uri:
    //   process.env.NODE_ENV === "development"
    //     ? process.env.REACT_APP_SERVER_DEVELOPMENT_URI
    //     : process.env.REACT_APP_SERVER_PRODUCTION_URI,
    // uri: process.env.REACT_APP_SERVER_PRODUCTION_URI,
    uri: "https://fathomless-waters-32944.herokuapp.com/",
  }),
  resolvers,
  typeDefs,
});

// this throws an error, can this be put in a hook instead?  getDerivedStateFromProps?
// const { data } = useQuery(GET_CARS);

const localStorageState = localStorage.getItem("state");

// write Apollo cache with default state
client.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem("token"),
    // cartItems: [],
    sortAttribute: null,
    isSortReverse: false,
    isFilterView: false,
    searchText: "",
    pickupText: "",
    dropoffText: "",
    customerState: localStorageState || "New York",
    customerZip: null,
    customerCounty: null,
    customerTaxRate: 8,
    // changed this from "guess", see what happens
    taxRateAccuracy: "guess",
    viewCars: [],
    filters: filtersInitial,
    isFiltered: false,
    // filteredCars: [],
    searchMakes: [],
    // add a typename here:
    searchMakeModels: [],
    isZipDialog: false,
    isUsingDeposit: false,
    // temporary
    cartVin: "5NPD84LF9KH436823",
    cartCar: null,
    // temporary
    // customerEmail: null,
    // customerPhone: null,
    // customerLicenseUri: null,
    customerEmail: "mevonstein@gmail.com",
    customerPhone: "(203) 333 3333",
    customerLicenseUri:
      "https://skips-virginia.s3.amazonaws.com/license-Scan0001.jpg",
    customerPickupLocation: null,
    customerDropoffLocation: "West Nyack, NY",
    customerPickupLocations: [],
    customerPickupDate: dateOnly(new Date()).toISOString(),
    customerLeaseMonths: 3,
    // temp
    viewField: null,
    // not sure we need these still
    // firstSuggestionAddress: null,
    // firstSuggestionLatitude: null,
    // firstSuggestionLongitude: null,
    // closestLocationCity: null,
    // closestLocationDistance: null,
    // secondClosestCity: null,
    // secondClosestDistance: null,
    isShowMore: false,
    customerCoordinates: { lat: null, lng: null, __typename: "Coordinates" },
    cartLease: cartLeaseInitial,
    insuranceMonthly: 200,
    insuranceAccuracy: "guess",
    stateAccuracy: "guess",
  },
});

/**
 * Render our app
 * - We wrap the whole app with ApolloProvider, so any component in the app can
 *    make GraphqL requests. Our provider needs the client we created above,
 *    so we pass it as a prop
 * - We need a router, so we can navigate the app. We're using Reach router for this.
 *    The router chooses between which component to render, depending on the url path.
 *    ex: localhost:3000/login will render only the `Login` component
 */

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

function IsLoggedIn() {
  const { data } = useQuery(IS_LOGGED_IN);
  if (!data.isLoggedIn) {
    return <Login />;
  }
}

// generic default theme allows us to use breakpoints when creating the theme we'll use
const defaultTheme = createMuiTheme();
const theme = createMuiTheme({
  grey: "#131313",
  green: "#4cae4c",
  red: "#f44336",
  placeholderGrey: "rgba(0, 0, 0, 0.54)",
  palette: {
    type: "light",
    background: { default: "#fff" },
    primary: blue,
    secondary: purple,
  },

  typography: {
    h5: { color: grey[700] },
  },
  //
  // global classes
  //
  // forms that are primary to page function - e.g. checkout form
  formElement: {
    marginTop: 22,
  },
  // embedded form - "switchbank"
  switchbankRow: {
    marginBottom: 12,
  },
  switchbankIconMenu: {
    position: "absolute",
    marginTop: 6,
    [defaultTheme.breakpoints.down("sm")]: {
      // this overrides the pageContainer padding
      left: 0,
    },
  },
  switchbankBox: {
    [defaultTheme.breakpoints.up("md")]: {
      paddingLeft: 62,
    },
    [defaultTheme.breakpoints.down("sm")]: {
      paddingLeft: 36,
    },
  },
});

// how to
// do we need this?
// injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Pages />
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById("root")
);

// write sort data to client if it's present

// const [
//   updateCustomerState,
//   { loading: customerLoading, error: customerError },
// ] = useMutation(UPDATE_CUSTOMER_STATE);

!!localStorage.getItem("sortAttribute") &&
  client.writeData({
    data: {
      isSortReverse: localStorage.getItem("isSortReverse"),
      sortAttribute: localStorage.getItem("sortAttribute"),
    },
  });

// call updateCustomerState to seed customerTaxRate and associated accuracy fields
!!localStorageState &&
  client.mutate({
    mutation: UPDATE_CUSTOMER_STATE,
    variables: { customerState: localStorageState },
  });

// const { data } = useQuery(GET_CARS);

// Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
// 1. You might have mismatching versions of React and the renderer (such as React DOM)
// 2. You might be breaking the Rules of Hooks
// 3. You might have more than one copy of React in the same app
// See https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.

// sortCars({
//   variables: { sortAttribute, isSortReverse: false, cars: data.cars }
// });

// temporary comment becuase we're testing a stripped down client to debug file upload
// client
//   .query({
//     query: gql`
//       query GetCartTest {
//         # cartVin @client
//         # customerPickupDate @client
//         cars {
//           model
//           location
//           deliveryDays
//         }
//       }
//     `,
//   })
//   .then((result) => console.log(result));
