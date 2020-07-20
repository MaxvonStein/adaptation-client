import React, { Component, Fragment } from "react";
import styled, { css } from "react-emotion";
import { size } from "polished";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Loading } from "../components";
import {
  GET_CARS_VIEW_CUSTOMER,
  GET_CARS_LEASETOTAL,
  GET_SORT,
  GET_CARS_LEASEQUOTE,
  GET_CARS_LEASETOTALQUOTE,
  GET_CUSTOMER,
} from "../pages/cars";
import { ADD_OR_REMOVE_FILTERS_CARS, SORT_CARS } from "./cars-forms";
// import { typeDefs } from "../resolvers";

import ModelCheckbox from "./model-checkbox";
import FilterCheckbox from "./filter-checkbox";
import SuggestionItem from "./suggestion-item";
import { InputContainer } from "./quote-filter-form";
import space from "../assets/images/space.jpg";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { ReactComponent as Curve } from "../assets/curve.svg";
import { ReactComponent as Rocket } from "../assets/rocket.svg";
import { colors, unit } from "../styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import { IconButton } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import MapIcon from "@material-ui/icons/Map";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Autocomplete from "@material-ui/lab/Autocomplete";
// import datefns from "@date-io/date-fns";
import differenceInDays from "date-fns/differenceInDays";
import getDate from "date-fns/getDate";
import differenceInMonths from "date-fns/differenceInMonths";
import eachMonthOfInterval from "date-fns/eachMonthOfInterval";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import isBefore from "date-fns/isBefore";
import {
  DatePicker,
  KeyboardDatePicker,
  TimePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import Popper from "@material-ui/core/Popper";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import { calculateLease } from "../lease-total";
import { locations, customerDropoffLocationInitial } from "../constants";
import PlacesAutocompleteClosest from "./places-autocomplete-closest";
import LocationsMap from "./locations-map";
import IconMenu from "./icon-menu";
import UpdateBar from "./update-bar";

const useStyles = makeStyles((theme) => ({
  formRow: {
    marginTop: 14,
  },
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  pickupAutocomplete: { width: "55%", display: "inline-block" },
  dropoffAutocomplete: {
    marginLeft: 12,
    width: "calc(45% - 12px)",
    display: "inline-block",
  },
  overlappingAutocomplete: {
    "& .MuiAutocomplete-popupIndicator": {
      backgroundColor: theme.palette.background.default,
    },
  },
  locationsMap: {
    height: "100%",
    width: "100%",
  },
  locationsMapBox: {
    height: "calc(100% - 56px)",
    width: "100%",
  },
  locationsMapPage: {
    height: "100%",
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  none: {
    display: "none",
  },
  locationAutocompletesBox: {
    // 488 width of fields above
    maxWidth: 488,
  },
  switchbankRow: theme.switchbankRow,
  switchbankIconMenu: theme.switchbankIconMenu,
  switchbankBox: theme.switchbankBox,
}));

export const GET_CARS_LEASEQUOTEHIGHLIGHTS = gql`
  query getCarsLeasetotal {
    cars {
      vin
      leaseFirst
      leaseMonthly
      location
      transportCost
      leaseQuote @client {
        leaseTotal
        secondLegFee
        transportCost
        pickupLocation
        # may need dropoff location here if we decide to display that on quote-list
      }
    }
    customerPickupLocations @client
    customerDropoffLocation @client
  }
`;

// export const UPDATE_PICKUP_LOCATION = gql`
//   mutation updateCustomerPickupLocation($customerPickupLocation: String!) {
//     updateCustomerPickupLocation(
//       customerPickupLocation: $customerPickupLocation
//     ) @client
//   }
// `;

// export const ADD_OR_REMOVE_PICKUP_LOCATION = gql`
//   mutation addOrRemoveCustomerPickupLocation(
//     $location: String!
//     $viewCars: [Car]!
//   ) {
//     addOrRemoveCustomerPickupLocation(location: $location, viewCars: $viewCars)
//       @client
//   }
// `;

export const UPDATE_PICKUP_LOCATIONS = gql`
  mutation updateCustomerPickupLocations(
    $customerPickupLocations: [String]!
    $viewCars: [Car]!
  ) {
    updateCustomerPickupLocations(
      customerPickupLocations: $customerPickupLocations
      viewCars: $viewCars
    ) @client
  }
`;

export const UPDATE_DROPOFF_LOCATION = gql`
  mutation updateCustomerDropoffLocation(
    $customerDropoffLocation: [String]!
    $viewCars: [Car]!
  ) {
    updateCustomerDropoffLocation(
      customerDropoffLocation: $customerDropoffLocation
      viewCars: $viewCars
    ) @client
  }
`;

// export const ADD_OR_REMOVE_PICKUP_LOCATION_VIEW_REQUERY = gql`
//   mutation addOrRemoveCustomerPickupLocation($location: String!) {
//     addOrRemoveCustomerPickupLocation(location: $location) @client
//   }
// `;

// export const REQUERY_LEASETOTAL = gql`
//   mutation requeryLeasetotal($viewCars: [Car]!) {
//     requeryLeasetotal(viewCars: $viewCars) @client
//   }
// `;

export const REQUERY_LEASEQUOTE = gql`
  mutation requeryLeasequote($viewCars: [Car]!) {
    requeryLeasequote(viewCars: $viewCars) @client
  }
`;

// source: https://github.com/mui-org/material-ui/issues/19376
// forget the props just write the Popper directly to the autocomplete prop below
const WidePopper = function (props) {
  return <Popper {...props} style={{ minWidth: 250 }} />;
};
// just apply styles to the class instead, without using child selected

const WidePopperMultiple = function (props) {
  // setting a data attribute so we can apply to the muliple popper only
  return <Popper {...props} data-multiple="true" style={{ minWidth: 250 }} />;
};

export default function QuoteLocationForm() {
  const classes = useStyles();
  const theme = useTheme();

  const smallMedia = useMediaQuery(theme.breakpoints.down("sm"));

  const client = useApolloClient();

  // cars, customerPickupLocation, customerPickupDate, customerLeaseMonths;

  const { data, loading, error } = useQuery(GET_CARS_VIEW_CUSTOMER);
  // problem is cars isn't client data - CLIENT.readqu..

  // react hooks

  // value of the dropoff input text, not sure how to get an initial value here
  const [pickupInputValue, setPickupInputValue] = React.useState("");
  const [dropoffInputValue, setDropoffInputValue] = React.useState(
    "West Nyack, NY"
  );

  // const isInDataCurry = (attribute) => (value) => {
  //   // adapted from isInFilter
  //   return data[attribute] && data[attribute].includes(value) ? true : false;
  // };

  // const [
  //   requeryLeasetotalquote,
  //   {
  //     loading: requeryLeasetotalquoteLoading,
  //     error: requeryLeasetotalquoteError
  //   }
  // ] = useMutation(REQUERY_LEASETOTALQUOTE);

  const [
    requeryLeasequote,
    { loading: requeryLeasequoteLoading, error: requeryLeasequoteError },
  ] = useMutation(REQUERY_LEASEQUOTE);

  // const [
  //   addOrRemoveCustomerPickupLocationRequery,
  //   {
  //     loading: addRemovePickupLocationLoading,
  //     error: addRemovePickupLocationError
  //   }
  // ] = useMutation(ADD_OR_REMOVE_PICKUP_LOCATION, {
  //   refetchQueries: [{ query: GET_CARS_LEASETOTAL }],
  //   awaitRefetchQueries: true,
  //   onCompleted({ addOrRemoveCustomerPickupLocation }) {
  //     // old version before there was a leaseQuote to requery
  //     requeryLeasetotal({
  //       variables: { viewCars: addOrRemoveCustomerPickupLocation.viewCars }
  //     });
  //   }
  // });

  const [
    updateCustomerPickupLocationsRequery,
    { loading: pickupLocationLoading, error: pickupLocationError },
  ] = useMutation(UPDATE_PICKUP_LOCATIONS, {
    refetchQueries: [{ query: GET_CARS_LEASEQUOTEHIGHLIGHTS }],
    // viewCars is passed to this mutation function, updateCustomerPickupLocationsRequery
    // so then why do we need the refetch query at all? GET_CARS_LEASEQUOTE is called in the requeryLeasequote resolver mutation
    // doesn't work without the refetch query
    // maybe we need the refetch to actually perform the refetch otherwise requery gets stale data?
    awaitRefetchQueries: true,
    onCompleted({ updateCustomerPickupLocations }) {
      // requeryLeasequpte queries for cars and then assigns the leaseQuote value to each of the viewCars
      // function doesn't update viewCars without both the refetchQueries and the onCompleted
      requeryLeasequote({
        variables: { viewCars: updateCustomerPickupLocations.viewCars },
      });
    },
  });

  const [
    updateCustomerDropoffLocationRequery,
    {
      loading: addRemoveDropoffLocationLoading,
      error: addRemoveDropoffLocationError,
    },
  ] = useMutation(UPDATE_DROPOFF_LOCATION, {
    refetchQueries: [{ query: GET_CARS_LEASEQUOTEHIGHLIGHTS }],
    awaitRefetchQueries: true,
    onCompleted({ updateCustomerDropoffLocation }) {
      requeryLeasequote({
        variables: { viewCars: updateCustomerDropoffLocation.viewCars },
      });
    },
  });

  // coppied from customer-form
  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;

  // seed variables
  // is this getting redefined everytime we requery leaseQuote on cars
  const carLocations = [...new Set(data.cars.map((car) => car.location))];

  const updatePickupLocationsSort = async (customerPickupLocations) => {
    // function to handle updating location data and possibly resorting viewCars, repeated in two handlers
    const locationRequeryResponse = await updateCustomerPickupLocationsRequery({
      variables: {
        customerPickupLocations,
        viewCars: data.viewCars,
      },
    });

    // run sortCars here with response.  first query for sortAttribute
    const { sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT,
    });

    // will firstMonth become an option?  list of attributes that necescitate sort in constants?
    if (sortAttribute === "leaseTotal") {
      sortCars({
        variables: {
          cars:
            locationRequeryResponse.data.updateCustomerPickupLocations.viewCars,
          sortAttribute,
          isSortReverse,
        },
      });
    }
  };

  // handlers

  const handlePickupLocationsChange = (locations) => {
    updatePickupLocationsSort(locations);
  };

  // how about the question of retaining the customerPickupLocations as the user clicks to the map view or to a car, we'll need to make use of the initial.. props

  const handleDropoffLocationChange = async (location) => {
    setDropoffInputValue(location);
    // removing, now in component
    // if (reason === "clear" || value === null) {
    //   return;
    // }
    const locationRequeryResponse = await updateCustomerDropoffLocationRequery({
      variables: {
        // customerDropoffLocation: value.description,
        customerDropoffLocation: location,
        viewCars: data.viewCars,
      },
    });

    // I don't think we need to actually retain the dropoffText stuff render-to-render
    // client.writeData({ data: { dropoffText: value.description } });

    // run sortCars here with response.  first query for sortAttribute
    const { sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT,
    });

    // will firstMonth become an option?
    if (sortAttribute === "leaseTotal") {
      sortCars({
        variables: {
          cars:
            locationRequeryResponse.data.updateCustomerDropoffLocation.viewCars,
          sortAttribute,
          isSortReverse,
        },
      });
    }
  };

  const handlePickupInputChange = (event, value, reason) => {
    // fired when textinput changes
    if (reason === "clear") {
      // clear inputValue if the "x" is clicked
      setPickupInputValue("");
      return;
    }
    if (reason === "reset") return;

    setPickupInputValue(event.target.value);
  };

  const handleDropoffInputChange = (event, value, reason) => {
    // fired when textinput changes
    if (reason === "clear") {
      // clear inputValue if the "x" is clicked
      setDropoffInputValue("");
      return;
    }
    if (reason === "reset") return;

    setDropoffInputValue(event.target.value);
  };

  const handlePickupMarkerClick = async (event, marker) => {
    // should this logic be in a mutation?
    const { customerPickupLocations } = await client.readQuery({
      query: GET_CUSTOMER,
    });

    const location = marker.description;

    // filter or push in place
    updatePickupLocationsSort(
      customerPickupLocations.includes(location)
        ? customerPickupLocations.filter((l) => l !== location)
        : [...customerPickupLocations, location]
    );
  };

  const handleDropoffMarkerClick = (event, marker) => {
    const location = marker.description;

    handleDropoffLocationChange(location);
    setDropoffInputValue(location);
  };

  return (
    <Fragment>
      <Box className={classes.switchbankRow}>
        <IconMenu
          className={classes.switchbankIconMenu}
          options={[
            {
              name: "Choose pickup locations on map",
              value: "pickupLocationsMap",
              icon: <MapIcon />,
            },
            {
              name: "Choose return location on map",
              value: "dropoffLocationsMap",
              icon: <MapIcon />,
            },
          ]}
          onChange={(event, value) =>
            client.writeData({ data: { viewField: value } })
          }
          icon={<LocationOnIcon />}
        />
        <Box className={classes.switchbankBox}>
          <Box className={classes.locationAutocompletesBox}>
            {/* box to contain width-defined Autocompletes */}
            <PlacesAutocompleteClosest
              autocompleteClassName={classes.pickupAutocomplete}
              locationValue={data.customerPickupLocations}
              inputValue={pickupInputValue}
              onChange={handlePickupLocationsChange}
              onInputChange={handlePickupInputChange}
              // open={true}
              // for css/testing only
              onUseMapClick={() => {
                client.writeData({ data: { viewField: "pickupLocationsMap" } });
              }}
              filterOptions={(option) => option}
              multiple={true}
              inputLabel="Pickup location(s)"
              inputPlaceholder="Close to..."
              // initialLocationValue={data.customerPickupLocations}
              // initialLocationValue={["Newark, NJ"]}
              carLocations={carLocations}
              inputType={"customerPickupLocations"}
              writeCustomerCoordinates={(lat, lng) =>
                client.writeData({
                  data: {
                    customerCoordinates: {
                      lat,
                      lng,
                      __typename: "Coordinates",
                    },
                  },
                })
              }
              // add a breakpoint
              PopperComponent={smallMedia ? WidePopperMultiple : undefined}
            />
            {/* dropoff autocomplete */}
            {/* check source code and figure out what makes the display update */}
            <PlacesAutocompleteClosest
              autocompleteClassName={
                classes.dropoffAutocomplete +
                " " +
                classes.overlappingAutocomplete
              }
              inputValue={dropoffInputValue}
              initialInputValue={data.customerDropoffLocation}
              locationValue={data.customerDropoffLocation}
              onChange={handleDropoffLocationChange}
              onInputChange={handleDropoffInputChange}
              // open={true}
              onUseMapClick={() => {
                client.writeData({
                  data: { viewField: "dropoffLocationsMap" },
                });
              }}
              filterOptions={(option) => option}
              multiple={false}
              inputLabel="Return location"
              inputPlaceholder="Close to..."
              inputType={"customerDropoffLocation"}
              // why isn't this updated to data.cars with set
              // shouldn't need this, it's not use for dropoffLocations
              // carLocations={carLocations}
              // introduce logic to check on whether this has been set already, in a way that's a little more "for sure"
              PopperComponent={smallMedia ? WidePopper : undefined}
            />
          </Box>
        </Box>
      </Box>
      {/* pickup and dropoff locations map */}
      <Box
        className={
          data.viewField === "pickupLocationsMap" ||
          data.viewField === "dropoffLocationsMap"
            ? classes.locationsMapPage
            : classes.none
        }
      >
        <UpdateBar
          onBackClick={() => client.writeData({ data: { viewField: null } })}
        />
        <Box className={classes.locationsMapBox}>
          <LocationsMap
            locations={locations}
            value={
              data.viewField === "pickupLocationsMap"
                ? data.customerPickupLocations
                : data.customerDropoffLocation
            }
            onMarkerClick={
              data.viewField === "pickupLocationsMap"
                ? handlePickupMarkerClick
                : handleDropoffMarkerClick
            }
            mapType={
              data.viewField === "pickupLocationsMap" ||
              data.viewField === "dropooffLocationsMap"
                ? data.viewField
                : "pickupLocationsMap"
            }
            multiple={data.viewField === "pickupLocationsMap"}
            carLocations={
              data.viewField === "pickupLocationsMap" ? carLocations : undefined
            }
            customerCoordinates={data.customerCoordinates}
            boxClasses={classes.locationsMap}
          />
        </Box>
      </Box>

      {/* pickup locations map */}
      {/* {data.viewField === "dropoffLocationsMap" && (
        <LocationsMap
          locations={locations}
          value={data.customerDropoffLocation}
          handleMarkerClick={handleDropoffLocationChange}
          carLocations={carLocations}
          customerCoordinates={data.customerCoordinates}
        />
      )} */}
    </Fragment>
  );
}
/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flexGrow: 1,
  paddingBottom: unit * 6,
  color: "white",
  backgroundColor: colors.primary,
  backgroundImage: `url(${space})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

export const StyledForm = styled("form")({
  width: "100%",
  maxWidth: 380,
  padding: unit * 3.5,
  borderRadius: 3,
  boxShadow: "6px 6px 1px rgba(0, 0, 0, 0.25)",
  color: colors.text,
  backgroundColor: "white",
});

export const StyledSelect = styled("select")({
  width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary,
  },
});

const StyledSpan = styled("span")({
  color: "black",
  padding: `${unit * 1.2}px ${unit * 1.2}px ${unit}px ${unit * 2}`,
  fontSize: 16,
  maxWidth: 112,
});

export const WhiteBox = styled(Box)({
  background: "white",
});
