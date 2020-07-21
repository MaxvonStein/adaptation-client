import React from "react";
// import ErrorBoundary from "@react-error-boundary";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Link } from "@reach/router";
import {
  GET_CARS_VIEW,
  GET_CARFORM,
  GET_CARFORM_VARIABLE,
} from "../pages/cars";
import { SORT_CARS } from "../components/cars-forms";
import CarImage from "./car-image";
import ImageError from "./image-error";
import { numberFormat, priceFormat } from "../number-formats";
import filtersInitial from "../index";
import { MAXPRICE } from "../constants";

// const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
//   SORT_CARS
// );

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

let isSorted = false;

export default function CarList() {
  const integerAttributes = ["mileage", "retailPrice", "leasePrice"];
  // changing the fetchPolicy didn't help
  const { data, loading, error } = useQuery(GET_CARFORM, {
    // fetchPolicy: "cache-and-network"
    // variables: { customerStateVariable: "New Jersey" }
  });

  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  const filters = data.filters;
  // const isFiltered = !Object.keys(filters).every(
  //   key =>
  //     key === "__typename" ||
  //     (integerAttributes.includes(key) &&
  //       (filters[key] === 999999 || filters[key] === MAXPRICE)) ||
  //     (Array.isArray(filters[key]) && filters[key].length === 0)
  // );
  // const isFiltered = !filters === filtersInitial;

  // if (!data.isFiltered) {
  //   // is this supposed to be in a hook and not just freestanding?
  //   console.log("not filtered");
  //   // sortCars({
  //   //   variables: {
  //   //     cars: data.cars,
  //   //     sortAttribute: data.sortAttribute,
  //   //     isSortReverse: data.isSortReverse
  //   //   }
  //   // });
  // } else {
  //   console.log("filtered");
  // }

  // think this also seeds viewCars, don't remember
  if (!isSorted) {
    console.log("run sortCars");
    // was getting some kind of error loop when passing data. to sortCars directly
    const cars = data.cars;
    const sortAttribute = data.sortAttribute;
    const isSortReverse = data.isSortReverse;
    sortCars({
      variables: {
        cars,
        sortAttribute,
        isSortReverse,
      },
    });
    isSorted = true;
  }

  // const nonEmptyCars =
  //   data.viewCars.length !== 0 || data.isFiltered ? data.viewCars : data.cars;
  return (
    <div>
      {data.viewCars.map((car) => (
        <div key={car.vin}>
          {/* <ErrorBoundary FallbackComponent={ImageError}> */}
          <CarImage car={car}></CarImage>
          {/* </ErrorBoundary> */}
          <Link to={`/car/${car.vin}`}>
            <p>
              {car.year} {car.model}
            </p>
            <p>{numberFormat(car.mileage)} miles</p>
            <p>{priceFormat(car.retailPrice)}</p>
            <p>
              delivered to {data.customerState} in {car.deliveryDays} days
            </p>
          </Link>
        </div>
      ))}
    </div>
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
