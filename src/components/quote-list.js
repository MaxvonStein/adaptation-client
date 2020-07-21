import React, { Fragment } from "react";
import { createBrowserHistory } from "history";
import { Redirect, Router, useNavigate } from "@reach/router";
// import ErrorBoundary from "@react-error-boundary";
import { useApolloClient, useQuery, useMutation } from "@apollo/react-hooks";
import { Link } from "@reach/router";
import {
  GET_CARS_VIEW,
  GET_CARFORM,
  GET_CARFORM_VARIABLE,
  GET_CARS_VIEW_CUSTOMER,
} from "../pages/cars";
import { SORT_CARS } from "../components/cars-forms";
import CarImage from "./car-image";
import ImageError from "./image-error";
import { numberFormat, priceFormat } from "../number-formats";
import filtersInitial from "../index";
import { MAXPRICE } from "../constants";
import { calculateLease } from "../lease-total";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { ButtonBase } from "@material-ui/core";

// const { data, loading, error } = useQuery(GET_CARFORM, {
//   // fetchPolicy: "cache-and-network"
//   // variables: { customerStateVariable: "New Jersey" }
// });

// sortCars({
//   variables: {
//     cars: data.cars,
//     sortAttribute: data.sortAttribute,
//     isSortReverse: data.isSortReverse
//   }
// });

const useStyles = makeStyles((theme) => ({
  quoteList: { marginTop: 12 },
  buttonBox: { marginTop: 8 },
  button: { width: "100%", display: "block", zIndex: 1 },
  priceTagImageBox: {
    width: "50%",
    display: "inline-block",
  },
  detailsBox: {
    display: "inline-block",
    width: "50%",
    verticalAlign: "top",
    marginTop: 12,
    padding: "6px 10px",
  },
  detailLine: {
    marginTop: 4,
  },
  detailHeading: {
    marginTop: 4,
  },
  priceHighlight: {
    display: "inline-block",
    borderBottom: "4px solid #1bff00",
    lineHeight: "0.4",
    fontWeight: 500,
  },
  priceSuperscript: {
    fontSize: 13,
    verticalAlign: "top",
    lineHeight: "0.2",
  },
  priceLabel: {
    // borderBottom: "unset",
    fontSize: 13,
    marginLeft: 3,
  },
  hidden: {
    visibility: "hidden",
  },
}));

let isSorted = false;

export default function QuoteList({ isPricesLoading }) {
  // there's gotta be a better way to redirect
  // const [toLease, setToLease] = React.useState(false);
  const client = useApolloClient();
  const navigate = useNavigate();

  const classes = useStyles();

  const { data, loading, error } = useQuery(GET_CARS_VIEW_CUSTOMER);

  const handleClick = (car) => {
    client.writeData({
      data: {
        cartCar: car,
        customerPickupLocation: car.leaseQuote.pickupLocation,
        // idea here is to add the car vin and details here so it doesn't need to happen everytime there's unputs to the quote forms
        cartLease: {
          ...car.leaseQuote,
          customerPickupDate: data.customerPickupDate,
          // insuranceMonthly: data.insuranceMonthly,
          // insuranceAccuracy: data.insuranceAccuracy,
          // customerState: data.customerState,
          // stateAccuracy: data.stateAccuracy,
          // taxRate: data.customerTaxRate,
          // taxRateAccuracy: data.taxRateAccuracy,
          vin: car.vin,
          yearMakeModel: `${car.year} ${car.make} ${car.model}`,
        },
      },
    });
    // return <Redirect to="/lease" />;
    // setToLease(true);
    navigate("/lease");
  };

  // may need this later if adding sorting
  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  // if (toLease === true) {
  //   return <Redirect noThrow to="/lease" />;
  // }

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  // don't seem to be using this, especially for quotes

  // const filters = data.filters;
  // const isFiltered = !Object.keys(filters).every(
  //   key =>
  //     key === "__typename" ||
  //     (integerAttributes.includes(key) &&
  //       (filters[key] === 999999 || filters[key] === MAXPRICE)) ||
  //     (Array.isArray(filters[key]) && filters[key].length === 0)
  // );

  // can add sorting later
  if (!isSorted) {
    console.log("run sortCars");
    // was getting some kind of error loop when passing data. to sortCars directly
    const cars = data.cars;
    // default to sorting by price
    const sortAttribute = "leaseTotal";
    const isSortReverse = false;
    sortCars({
      variables: {
        cars,
        sortAttribute,
        isSortReverse,
      },
    });
    isSorted = true;
  }

  console.log(data.viewCars);

  return (
    <Box className={classes.quoteList}>
      {data.viewCars.slice(0, 5).map((car) => {
        // if (car.vin === "3N1AB7AP2KY228385") {
        //   debugger;
        // }
        return (
          <Box className={classes.buttonBox}>
            <ButtonBase
              onClick={() =>
                // just pass the whole car object
                handleClick(car)
              }
              key={car.vin}
              component={Box}
              className={classes.button}
            >
              {/* <ErrorBoundary FallbackComponent={ImageError}> */}
              <Box className={classes.priceTagImageBox}>
                <CarImage car={car} />
              </Box>
              {/* </ErrorBoundary> */}
              <Box className={classes.detailsBox}>
                <Box className={isPricesLoading ? classes.hidden : undefined}>
                  <Typography variant="h5" className={classes.priceHighlight}>
                    <span className={classes.priceSuperscript}>$</span>
                    {Math.round(
                      car.leaseQuote.leaseTotal /
                        Math.round(data.customerLeaseMonths * 30)
                    )}
                  </Typography>
                  <span className={classes.priceLabel}>/day</span>
                </Box>

                <Typography variant="body1" className={classes.detailHeading}>
                  {car.year} {car.make} {car.model}
                </Typography>
                {/* not really the lease tota yet */}
                <Typography
                  variant="body2"
                  className={
                    isPricesLoading
                      ? classes.detailLine + " " + classes.hidden
                      : classes.detailLine
                  }
                >
                  {priceFormat(car.leaseQuote.leaseTotal)} lease total
                </Typography>
                {/* <Typography variant="body2">
                {priceFormat(
                  car.leaseQuote.total /
                  Math.round(data.customerLeaseMonths * 30)
                  )}{" "}
                  per day
                  {data.customerLeaseMonths > 1 &&
                  ", " +
                  priceFormat(
                    car.leaseQuote.total /
                        Math.round(data.customerLeaseMonths)
                        ) +
                        " per month"}
              </Typography> */}
                {/* throws Warning: Functions are not valid as a React child. */}

                {data.customerPickupLocations.length !== 0 &&
                  car.leaseQuote.secondLegFee !== 0 && (
                    <Typography
                      variant="caption"
                      className={classes.detailLine}
                    >
                      {`includes $${
                        car.transportCost + car.leaseQuote.secondLegFee
                      }
                    transfer from ${car.location}`}
                    </Typography>
                  )}
                <Typography variant="body2" className={classes.detailLine}>
                  pickup in {car.leaseQuote.pickupLocation}
                </Typography>
              </Box>
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
}

// export default CarList;

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

// export const cardClassName = css({
//   padding: `${unit * 4}px ${unit * 5}px`,
//   borderRadius: 7,
//   color: "grey",
//   backgroundSize: "cover",
//   backgroundPosition: "center"
// });

// const padding = unit * 2;
// const StyledLink = styled(Link)(cardClassName, {
//   display: "block",
//   height: 193,
//   marginTop: padding,
//   textDecoration: "none",
//   ":not(:last-child)": {
//     marginBottom: padding * 2
//   }
// });
