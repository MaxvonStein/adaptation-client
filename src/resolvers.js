import gql from "graphql-tag";
import { GraphQLDate, GraphQLDateTime } from "graphql-iso-date";
import { GET_CART_ITEMS } from "./pages/cart";
import {
  GET_FILTERS,
  GET_SORT_VIEW,
  GET_CUSTOMER,
  GET_CARS_LEASETOTAL,
  GET_CARS_LEASETOTALQUOTE,
  GET_VIEW_LEASETOTAL,
  GET_VIEW_LEASEQUOTE,
  GET_VIEW_LEASETOTALQUOTE,
  GET_CARS_LEASEQUOTE,
  GET_LEASEQUOTE,
} from "./pages/cars";
import { GET_CARTLEASE_CARTCAR } from "./pages/reserve";
import { GET_CART } from "./pages/details";
import { GET_CAR_DETAILS } from "./pages/car";
import { calculateLease } from "./lease-total";
import { findTaxRate } from "./sales-tax";
import { pythagoreanDistance } from "./distances";
import {
  DEFAULTVALUE,
  filterAttributes,
  numericalAttributes,
  transportCosts,
  locations,
} from "./constants";
import { GET_CUSTOMERSTATE_TAXRATE } from "./pages/tax-jurisdiction";

// add a Query isAlphabetical or getFilter?
// figure out what went wrong with the MakeAndModel type later
export const typeDefs = gql`
  scalar Date
  extend type Query {
    isLoggedIn: Boolean!
    cartItems: [ID!]!
    sortAttribute: String
    isSortReverse: Boolean
    isFilterView: Boolean
    searchText: String
    pickupText: String
    dropoffText: String
    customerState: String
    filters: Filters
    isFiltered: Boolean
    searchMakes: [String]
    searchMakeModels: [String]
    cartVin: String
    cartLease: Lease
    cartCar: Car
    isUsingDeposit: Boolean
    customerPickupLocations: [String]
    customerPickupLocation: String
    customerPickupDate: Date
    customerLeaseMonths: Float
    viewField: String
    # firstSuggestionAddress: String
    # firstSuggestionLatitude: Float
    # firstSuggestionLongitude: Float
    # closestLocationCity: String
    # closestLocationDistance: Int
    # secondClosestCity: String
    # secondClosestDistance: Int
    isShowMore: Boolean
    customerCoordinates: Coordinates
    insuranceMonthly: FLoat
    insuranceAccuracy: String
    stateAccuracy: String
  }

  extend type Launch {
    isInCart: Boolean!
  }

  extend type Car {
    isViewed: Boolean!
    isFavorited: Boolean!
    deliveryDays: Int
    leaseTotal: Int
  }

  type Filters {
    model: [String]
    make: [String]
    purchasePrice: Int
    leasePrice: Int
    timeline: Int
  }

  type Coordinates {
    lat: Float
    lng: Float
  }

  # put this typedef in schema, doesn't look like we need it here
  # type Lease {
  #   pickupLocation: String
  #   dropoffLocation: String
  #   transportCost: Int
  #   secondLegFee: Int
  #   dropoffLegFee: Int
  # }

  extend type Mutation {
    addOrRemoveFromCart(id: ID!): [Launch]
    addCarToCart(vin: String!): String
  }
  # Do we need more mutation declarations?  Most aren't present

  # Not sure we have the output right here
  extend type Mutation {
    addOrRemoveFilter(
      attribute: String!
      value: String!
      isChecked: Boolean!
    ): Filters
  }
`;

export const resolvers = {
  // Query: {
  //   modelCheckbox: (_, { modelName }, {client}) =>
  // }
  Launch: {
    isInCart: (launch, _, { cache }) => {
      const { cartItems } = cache.readQuery({ query: GET_CART_ITEMS });
      return cartItems.includes(launch.id);
    },
  },
  Car: {
    deliveryDays: (car, _, { cache, client }) => {
      // why not use client here?
      const { customerState, customerPickupLocations } = client.readQuery({
        query: GET_CUSTOMER,
      });
      const newYorkPrepDays = 0;
      const newJerseyPrepDays = 1;
      const otherPrepDays = 1;
      let titleBizDays, titleCopyBizDays, pickupBizDays, deliveryDays;
      const transportDays = customerPickupLocations.includes(car.location)
        ? 0
        : car.transportTimeline;
      // move this logic to a seperate utility file?
      switch (car.supplier) {
        case "SKIP'S LLC":
          titleBizDays = 0;
          pickupBizDays = 0;
          break;
        case "Avis":
          titleBizDays = 3;
          pickupBizDays = 1;
          break;
        case "Enterprise":
          titleBizDays = 3;
          titleCopyBizDays = 1;
          pickupBizDays = 1;
          break;
        case "Hertz":
          titleBizDays = 5;
          pickupBizDays = 1;
          break;
        case "Manheim":
          titleBizDays = 1;
          pickupBizDays = 1;
          break;
        default:
          titleBizDays = 5;
          pickupBizDays = 5;
      }
      switch (customerState) {
        case "New York":
          // can issue a plate wiht just a copy of title
          deliveryDays =
            Math.max(
              titleCopyBizDays ? titleCopyBizDays : titleBizDays,
              pickupBizDays,
              transportDays
            ) + newYorkPrepDays;
          break;
        case "New Jersey":
          // need original title to issue temp plate
          deliveryDays =
            Math.max(titleBizDays, pickupBizDays, transportDays) +
            newJerseyPrepDays;
          break;
        case "Pennsylvania":
          deliveryDays =
            Math.max(titleBizDays, pickupBizDays, transportDays) +
            otherPrepDays;
          break;
        default:
          deliveryDays =
            Math.max(titleBizDays, pickupBizDays, transportDays) +
            otherPrepDays +
            4;
      }
      return deliveryDays;
    },
    leaseQuote: async (car, _, { cache, client }) => {
      let pickupLocation,
        dropoffLocation,
        transportCost,
        secondLegFee,
        dropoffLegFee;

      const {
        customerState,
        customerTaxRate,
        customerPickupDate,
        customerLeaseMonths,
        customerPickupLocations,
        customerDropoffLocation,
      } = await client.readQuery({
        query: GET_CUSTOMER,
      });

      dropoffLegFee = locations[customerDropoffLocation].transportFee;

      if (
        customerPickupLocations.length === 0 ||
        customerPickupLocations.includes(car.location)
      ) {
        // can assign transportCost and secondLegFee and pickupLocation
        transportCost = 0;

        const {
          firstMonthSalesTax,
          firstMonthRentalTax,
          monthlySalesTax,
          monthlyRentalTax,
          leaseTotal,
          proration,
          dropoffLegSalesTax,
          dropoffLegRentalTax,
          paymentsTotal,
        } = calculateLease(
          car.leaseFirst,
          car.leaseMonthly,
          customerLeaseMonths,
          customerState,
          customerTaxRate,
          transportCost,
          dropoffLegFee
        );

        return {
          leaseFirst: car.leaseFirst,
          leaseMonthly: car.leaseMonthly,
          pickupLocation: car.location,
          dropoffLocation: customerDropoffLocation,
          secondLegFee: 0,
          transportCost,
          dropoffLegFee,
          leaseTotal,
          firstMonthSalesTax,
          firstMonthRentalTax,
          monthlySalesTax,
          monthlyRentalTax,
          dropoffLegSalesTax,
          dropoffLegRentalTax,
          proration,
          paymentsTotal,
          customerPickupDate,
          // had to add all this because
          customerLeaseMonths,
          vin: null,
          yearMakeModel: null,
          insuranceMonthly: null,
          insuranceAccuracy: null,
          customerTaxRate: null,
          taxRateAccuracy: null,
          customerState: null,
          stateAccuracy: null,
          createdDate: null,
          __typename: "Lease",
        };
      } else {
        // find secondLeg details
        const carLocation = locations[car.location];
        const secondLegs = customerPickupLocations.map((location) => ({
          ...locations[location],
        }));
        const lowestSecondLegFee = Math.min(
          ...secondLegs.map(({ transportFee }) => transportFee)
        );

        // secondLegs filtered for lowestSecondLegFee then reduced on distance
        const closestPickupLocation = secondLegs
          .filter(({ transportFee }) => transportFee === lowestSecondLegFee)
          .reduce((accumulator, currentValue) => {
            return pythagoreanDistance(
              carLocation.latitude,
              carLocation.longitude,
              currentValue.latitude,
              currentValue.longitude
            ) <
              pythagoreanDistance(
                carLocation.latitude,
                carLocation.longitude,
                accumulator.latitude,
                accumulator.longitude
              )
              ? currentValue
              : accumulator;
          });

        // think about leaving transportCost independant of the cars - leaving it off the cars table
        transportCost = car.transportCost + lowestSecondLegFee;

        const {
          firstMonthSalesTax,
          firstMonthRentalTax,
          monthlySalesTax,
          monthlyRentalTax,
          leaseTotal,
          proration,
          dropoffLegSalesTax,
          dropoffLegRentalTax,
          paymentsTotal,
        } = calculateLease(
          car.leaseFirst,
          car.leaseMonthly,
          customerLeaseMonths,
          customerState,
          customerTaxRate,
          transportCost,
          dropoffLegFee
        );

        return {
          leaseFirst: car.leaseFirst,
          leaseMonthly: car.leaseMonthly,
          pickupLocation: closestPickupLocation.description,
          dropoffLocation: customerDropoffLocation,
          secondLegFee: lowestSecondLegFee,
          transportCost,
          dropoffLegFee,
          leaseTotal,
          firstMonthSalesTax,
          firstMonthRentalTax,
          monthlySalesTax,
          monthlyRentalTax,
          dropoffLegSalesTax,
          dropoffLegRentalTax,
          proration,
          paymentsTotal,
          customerPickupDate,
          customerLeaseMonths,
          vin: null,
          yearMakeModel: null,
          insuranceMonthly: null,
          insuranceAccuracy: null,
          customerTaxRate: null,
          taxRateAccuracy: null,
          customerState: null,
          stateAccuracy: null,
          createdDate: null,
          yearMakeModel: `${car.year} ${car.make} ${car.model}`,
          __typename: "Lease",
        };
      }
    },
    // should leaseTotal be async?  querying here
    leaseTotal: (car, _, { cache, client }) => {
      const {
        customerState,
        customerTaxRate,
        customerLeaseMonths,
        customerPickupLocations,
        customerDropoffLocation,
      } = client.readQuery({
        query: GET_CUSTOMER,
      });

      // if the pickup isn't where the car is, add a second transportCost for the second leg
      const secondLegFees = customerPickupLocations.map((city) => {
        // transportCosts[city] 0 is falsey
        // maybe change this ref over to locations constant
        return Object.keys(locations).includes(city)
          ? locations[city].transportFee
          : 999999;
      });

      if (Math.max(secondLegFees === 999999)) {
        console.log(
          "missing transportCost for a city in ",
          customerPickupLocations
        );
      }

      const dropoffLegCost = locations[customerDropoffLocation].transportFee;

      const transportCost =
        customerPickupLocations.includes(car.location) ||
        customerPickupLocations.length === 0
          ? 0
          : car.transportCost + Math.min(...secondLegFees);

      // where should we handle assigning a pickupLocation when the customer has more than one pickupLocation checked

      // if (car.vin === "3N1AB7AP2KY228385") {
      //   debugger;
      // }

      const { leaseTotal } = calculateLease(
        car.leaseFirst,
        car.leaseMonthly,
        customerLeaseMonths,
        customerState,
        customerTaxRate,
        transportCost,
        dropoffLegCost
      );

      if (!leaseTotal && !customerTaxRate) {
        // use the customerState (which has a default value) to get a range
        // make sure we plug in a customerTaxRate for New Jersey as soon as we get that input
      }
      return leaseTotal;
    },
    isViewed: (car, _, { cache }) => {
      return false;
    },
  },
  // Date: A date string, such as 2007-12-03 source: https://www.npmjs.com/package/graphql-iso-date
  Date: GraphQLDate,

  Mutation: {
    addOrRemoveFromCart: (_, { id }, { cache }) => {
      const { cartItems } = cache.readQuery({ query: GET_CART_ITEMS });
      const data = {
        cartItems: cartItems.includes(id)
          ? cartItems.filter((i) => i !== id)
          : [...cartItems, id],
      };
      // write to the cache with the new change
      cache.writeQuery({ query: GET_CART_ITEMS, data });
      return data.cartItems;
    },
    addCarToCart: (_, { vin }, { client }) => {
      // const { car } = client.readQuery({
      //   query: GET_CAR_DETAILS,
      //   variables: { vin }
      // });
      const data = { cart: vin };
      client.writeQuery({ query: GET_CART, data });
      return data.cartVin;
    },
    sortCars: (
      _,
      { cars, sortAttribute, isSortReverse },
      { client, cache, isFiltered }
    ) => {
      let forwardCars;
      switch (sortAttribute) {
        case "make":
        case "model":
          forwardCars = cars.sort((a, b) =>
            a[sortAttribute].localeCompare(b[sortAttribute])
          );
          break;
        case "leaseTotal":
          forwardCars = cars.sort(
            (a, b) => a.leaseQuote[sortAttribute] - b.leaseQuote[sortAttribute]
          );
          break;
        case "retailPrice":
          forwardCars = cars.sort(
            (a, b) => a[sortAttribute] - b[sortAttribute]
          );
          break;
        default:
      }
      // const alphabeticalCars = cars.sort((a, b) =>
      //   a.model.localeCompare(b.model)
      // );
      const sortedCars = isSortReverse ? forwardCars.reverse() : forwardCars;
      const data = {
        viewCars: sortedCars,
        sortAttribute,
        isSortReverse,
        isFiltered,
      };
      // will I need a query here?
      client.writeQuery({ query: GET_SORT_VIEW, data });
      return data.viewCars;
    },
    addOrRemoveFiltersCars: (
      _,
      { attribute, values, isChecked, cars, makeModels },
      { client, cache, sortAttribute, isSortReverse }
    ) => {
      // query for the current filters object
      const { filters } = client.readQuery({ query: GET_FILTERS });
      // update filters according to variables.  or can pass attribute as false to re-filter
      if (numericalAttributes.includes(attribute) && isChecked) {
        // integer attribute and checked, set attribute
        filters[attribute] = values[0];
      } else if (attribute && isChecked) {
        // array attribute and checked, add values to filters attribute array
        filters[attribute] = filters[attribute]
          ? [...filters[attribute], ...values]
          : [...values];
      } else if (attribute) {
        // uchecked, filter filters attribute array to include only the elements in the values array
        filters[attribute] = filters[attribute].filter((v) =>
          values.every((w) => w !== v)
        );
      }
      // try just sending checked = true, no special case for retailPrice
      // if (attribute === "retailPrice") {
      //   filters["retailPrice"] = values[0]
      // }
      const make =
        attribute === "makeModel" &&
        values[0].substr(0, values[0].indexOf(":"));
      // now that we're passing an array of all makeModel values when a make is checked/unchecked we need to add the values.length check in this special case logic
      // the handleMakeFilterChange handler is going to update the ["make"] filters attribute anyway
      // there's got to be a better way to do this, why does this have to be a special case at all?
      if (attribute === "makeModel" && !isChecked) {
        // special case, if we're unchecking a makeModel, remove that make from filters["makes"]
        filters["make"] = filters["make"].filter((m) => m !== make);
      } else if (attribute === "makeModel") {
        // we're checking a makeModel, determine whether we've got all the makeModels in that make checked now
        // there's no way to know at this point whether we've checked a make and..
        if (
          makeModels &&
          makeModels
            .filter((m) => m.substr(0, m.indexOf(":")) === make)
            .every((m) => filters["makeModel"].includes(m))
        ) {
          filters["make"] = [...filters["make"], make];
        }
      }
      // if (attribute === "retailPrice") {
      //   filters["retailPrice"] = values[0];
      // }
      const filteredCars = !Object.keys(filters)
        // first check for all [] filter attributes case
        .filter((key) => key !== "__typename")
        .map((key) => filters[key])
        .every(
          (attributeValue) =>
            attributeValue.length === 0 || attributeValue === DEFAULTVALUE
        )
        ? // filter cars where every key in filter
          cars.filter((car) =>
            Object.keys(filters).every((key) => {
              return (
                key === "__typename" ||
                // add leasePrice and other numerical filter logic here
                (numericalAttributes.includes(key) &&
                  filters[key] >= car[key]) ||
                // numericalAttributes.includes(key) ||
                // key === "mileage" ||
                // key === "leaseTotal" ||
                // key === "leaseFirst" ||
                // key === "leaseMonthly" ||
                key === "make" ||
                // why do we need a seperate makeModel conditional
                filters[key].length === 0 ||
                (filterAttributes.includes(key) &&
                  filters[key].includes(car[key]))
              );
            })
          )
        : cars;
      return {
        viewCars: filteredCars,
        filters,
        isFiltered: true,
        sortAttribute,
        isSortReverse,
      };
    },
    clearFiltersCars: (
      _,
      { attribute, cars, makeModels },
      { client, cache, sortAttribute, isSortReverse }
    ) => {
      // query for the current filters object
      const { filters } = client.readQuery({ query: GET_FILTERS });
      // update filters according to variables.  or can pass attribute as false to re-filter
      if (numericalAttributes.includes(attribute)) {
        // integer attribute and not checked, set attribute
        filters[attribute] = DEFAULTVALUE;
      } else if (attribute) {
        // uchecked, set attribute to empty array
        filters[attribute] = [];
      }
      if (attribute === "makeModel") {
        // special case, if we're clearing makeModel, clear makes also
        filters["make"] = [];
      }
      const filteredCars = !Object.keys(filters)
        // first check for all [] filter attributes case
        .filter((key) => key !== "__typename")
        .map((key) => filters[key])
        .every(
          (attributeValue) =>
            attributeValue.length === 0 || attributeValue === DEFAULTVALUE
        )
        ? // filter cars where every key in filter
          cars.filter((car) =>
            Object.keys(filters).every((key) => {
              return (
                key === "__typename" ||
                // add leasePrice and other numerical filter logic here
                (numericalAttributes.includes(key) &&
                  filters[key] >= car[key]) ||
                // numericalAttributes.includes(key) ||
                // key === "mileage" ||
                // key === "leaseTotal" ||
                // key === "leaseFirst" ||
                // key === "leaseMonthly" ||
                key === "make" ||
                // make is ignored because
                filters[key].length === 0 ||
                (filterAttributes.includes(key) &&
                  filters[key].includes(car[key]))
              );
            })
          )
        : cars;
      return {
        viewCars: filteredCars,
        filters,
        isFiltered: true,
        sortAttribute,
        isSortReverse,
      };
    },
    // addOrRemoveMakeFilter: (_, { value, isChecked }, { client, cache }) => {
    //   // update filters only, consider makeing this generic if there's ever another use for it
    //   const { filters } = client.readQuery({ query: GET_FILTERS });
    //   if (isChecked) {
    //     filters["make"] =
    //       filters["make"].length !== 0
    //         ? // if a make filter is set
    //           [...filters["make"], value]
    //         : [value];
    //   } else {
    //     filters["make"] = filters["make"].filter(v => v !== value);
    //   }
    //   return { filters };
    // },
    // addFilterCars: (_, { attribute, value, cars }, { client, cache }) => {
    //   const viewCars = cars.filter(car => value === car.make + ":" + car.model);
    //   client.writeQuery({ query: GET_VIEW, data: { viewCars } });
    //   return viewCars;
    //   // might make sense to keep the addOrRemoveFilter function to create the filter object since this function doesn't require this information at all.  call that on onCompleted
    // },
    updateCustomerState: async (_, { customerState }, { client }) => {
      // this clears out the taxRateAccuracy so make sure this is only called when the customerState is changing
      const taxRateArray = findTaxRate(customerState);
      const stateAccuracy = "positive";
      let customerTaxRate, taxRateAccuracy;
      if (taxRateArray.length === 1) {
        customerTaxRate = taxRateArray[0];
        taxRateAccuracy = "positive";
      } else if (taxRateArray[0] === 0) {
        customerTaxRate = 8;
        taxRateAccuracy = "guess";
      } else {
        customerTaxRate = (taxRateArray[0] + taxRateArray[1]) / 2;
        taxRateAccuracy = "guess";
      }

      client.writeQuery({
        query: GET_CUSTOMERSTATE_TAXRATE,
        data: {
          customerState,
          customerTaxRate,
          taxRateAccuracy,
          stateAccuracy,
        },
      });

      return customerState;
    },
    updateCustomerPickupLocation: (
      _,
      { customerPickupLocation },
      { client }
    ) => {
      client.writeQuery({
        query: GET_CUSTOMER,
        data: { customerPickupLocation },
      });
      return customerPickupLocation;
    },
    addOrRemoveCustomerPickupLocation: (
      _,
      { location, viewCars },
      { client }
    ) => {
      // based on addOrRemoveFromCart, changed cache to client
      const { customerPickupLocations } = client.readQuery({
        query: GET_CUSTOMER,
      });
      const data = {
        customerPickupLocations: customerPickupLocations.includes(location)
          ? customerPickupLocations.filter((l) => l !== location)
          : [...customerPickupLocations, location],
      };
      // write to the cache with the new change
      client.writeQuery({ query: GET_CUSTOMER, data });
      return {
        customerPickupLocations: data.customerPickupLocations,
        viewCars,
      };
    },
    updateCustomerPickupLocations: (
      _,
      { customerPickupLocations, viewCars },
      { client }
    ) => {
      // to be used when the new locations are known, not querying for original customerPickupLocations like addOrRemove..
      const data = {
        customerPickupLocations,
      };
      // write to the cache with the new change
      client.writeQuery({
        query: GET_CUSTOMER,
        data,
      });
      return {
        customerPickupLocations: data.customerPickupLocations,
        viewCars,
      };
    },
    updateCustomerDropoffLocation: (
      _,
      { customerDropoffLocation, viewCars },
      { client }
    ) => {
      const data = {
        customerDropoffLocation,
      };
      // write to the cache with the new change
      client.writeQuery({
        query: GET_CUSTOMER,
        data,
      });
      return {
        customerDropoffLocation: data.customerDropoffLocation,
        viewCars,
      };
    },
    requeryLeasetotal: async (_, { viewCars }, { client, cache }) => {
      const { cars } = await client.readQuery({
        query: GET_CARS_LEASEQUOTE,
        fetchPolicy: "network-only",
      });
      let updatedViewCars = viewCars;
      updatedViewCars.forEach(
        (viewCar, i, updatedViewCars) =>
          (updatedViewCars[i].leaseQuote.leaseTotal = cars.find(
            (car) => car.vin === viewCar.vin
          ).leaseQuote.leaseTotal)
      );
      const data = { viewCars: updatedViewCars };
      client.writeQuery({ query: GET_VIEW_LEASEQUOTE, data });
      return data.viewCars;
    },
    requeryLeasequote: async (_, { viewCars }, { client, cache }) => {
      const { cars } = await client.readQuery({
        // can we slim this query down?  includes pickup and dropoff
        query: GET_CARS_LEASEQUOTE,
        fetchPolicy: "network-only",
      });
      let updatedViewCars = viewCars;
      updatedViewCars.forEach(
        (viewCar, i, updatedViewCars) =>
          (updatedViewCars[i].leaseQuote = cars.find(
            (car) => car.vin === viewCar.vin
          ).leaseQuote)
      );
      const data = { viewCars: updatedViewCars };
      client.writeQuery({ query: GET_VIEW_LEASEQUOTE, data });
      return data.viewCars;
    },
    refreshLeasequote: async (_, { viewCars }, { client, cache }) => {
      // try just clearing the leaseQuote field on viewCars and then requerying to see whether we can activate the leaseQuote virtual field resolver without having to query cars
      // this doesn't work because leaseQuote = undefined violates typedefs
      // const { cars } = await client.readQuery({
      //   // can we slim this query down?  includes pickup and dropoff
      //   query: GET_CARS_LEASEQUOTE,
      //   fetchPolicy: "network-only",
      // });
      const clearedViewCars = viewCars.map(
        (viewCar) => (viewCar.leaseQuote = undefined)
      );
      client.writeQuery({
        query: GET_VIEW_LEASEQUOTE,
        data: { viewCars: clearedViewCars },
      });
      const { viewCars: updatedViewCars } = await client.readQuery({
        query: GET_VIEW_LEASEQUOTE,
        fetchPolicy: "network-only",
      });
      // updatedViewCars.forEach(
      //   (viewCar, i, updatedViewCars) =>
      //     (updatedViewCars[i].leaseQuote = cars.find(
      //       (car) => car.vin === viewCar.vin
      //     ).leaseQuote)
      // );
      const data = { viewCars: updatedViewCars };
      client.writeQuery({ query: GET_VIEW_LEASEQUOTE, data });
      return data.viewCars;
    },
    requeryLeasetotalquote: async (_, { viewCars }, { client, cache }) => {
      const { cars } = await client.readQuery({
        query: GET_CARS_LEASETOTALQUOTE,
        fetchPolicy: "network-only",
      });
      let updatedViewCars = viewCars;
      updatedViewCars.forEach((viewCar, i, updatedViewCars) => {
        const car = cars.find((car) => car.vin === viewCar.vin);
        updatedViewCars[i].leaseTotal = car.leaseTotal;
        updatedViewCars[i].leaseQuote = car.leaseQuote;
      });
      const data = { viewCars: updatedViewCars };
      client.writeQuery({ query: GET_VIEW_LEASETOTALQUOTE, data });
      return data.viewCars;
    },
    updateCustomerPickupDate: (_, { customerPickupDate }, { client }) => {
      client.writeQuery({
        query: GET_CUSTOMER,
        data: { customerPickupDate },
      });
      return customerPickupDate;
    },
    updateCustomerLeaseMonths: (
      _,
      { customerLeaseMonths, viewCars },
      { client }
    ) => {
      client.writeQuery({
        query: GET_CUSTOMER,
        data: { customerLeaseMonths },
      });
      return { customerLeaseMonths, viewCars };
    },
    updateCustomerTaxJurisdiction: (
      _,
      { state, taxJurisdiction },
      { client, dataSources }
    ) => {},
    updateCartLease: (_, { cartLeaseUpdates }, { client, cache }) => {
      // may need to query for the original cartLease before adding everything
      // this had to be cache to work!  revisit the use of cache.write.. vs client.write..
      // perhaps because the initial values are written to cache and not client in client/index
      // what about writing the cache key as suggested here: https://www.apollographql.com/docs/react/data/local-state/#managing-the-cache
      const { cartLease: previousCartLease } = client.readQuery({
        query: GET_CARTLEASE_CARTCAR,
      });
      const cartLease = {
        ...previousCartLease,
        ...cartLeaseUpdates,
        __typename: "Lease",
      };
      client.writeQuery({
        query: GET_CARTLEASE_CARTCAR,
        data: { cartLease },
      });
      return { cartLease };
    },
    // loadLeaseQuote: async (_, { quoteId }, { client, dataSources }) => {
    //   const leaseQuote = await dataSources.mongoQuoteAPI.getLeaseQuoteById({
    //     quoteId,
    //   });
    //   console.log("client loadLeaseQuote");
    //   console.log(leaseQuote);
    //   return leaseQuote;
    // },
  },
};
