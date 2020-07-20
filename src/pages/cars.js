import React, { Fragment } from "react";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";

import {
  Header,
  Loading,
  CarsForms,
  FilterForm,
  CustomerForm,
  CarList,
  ChipSet,
} from "../components";

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

export const LEASE_DATA = gql`
  fragment LeaseData on Lease {
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

export const CAR_DATA = gql`
  fragment CarData on Car {
    __typename
    year
    make
    model
    makeModel
    vin
    mileage
    type
    drivetrain
    retailPrice
    leaseFirst
    leaseMonthly
    transportCost
    exteriorColor
    interiorColor
    supplier
    location
    transportTimeline
    deliveryDays @client
    leaseTotal @client
    leaseQuote @client {
      ...LeaseData
    }
  }
  ${LEASE_DATA}
`;

export const FILTERS_DATA = gql`
  fragment FiltersData on Filter {
    make
    makeModel
    mileage
    type
    drivetrain
    retailPrice
    exteriorColor
    interiorColor
    leaseTotal
    leaseFirst
    leaseMonthly
  }
`;

export const GET_CARS_VIEW = gql`
  query getCarsViewCars {
    cars {
      ...CarData
    }
    viewCars @client {
      ...CarData
    }
  }
  ${CAR_DATA}
`;

export const GET_CARS = gql`
  query getCarsCars {
    cars {
      ...CarData
    }
  }
  ${CAR_DATA}
`;

export const GET_CARS_LEASETOTAL = gql`
  query getCarsLeasetotal {
    cars {
      vin
      leaseFirst
      leaseMonthly
      location
      transportCost
      leaseTotal @client
    }
    customerPickupLocations @client
  }
`;

export const GET_CARS_LEASEQUOTE = gql`
  query getCarsLeasetotal {
    cars {
      vin
      leaseFirst
      leaseMonthly
      location
      transportCost
      leaseQuote @client {
        ...LeaseData
      }
    }
    customerPickupLocations @client
  }
  ${LEASE_DATA}
`;

//  just used for refetch queries
export const GET_CARS_LEASETOTALQUOTE = gql`
  query getCarsLeasetotal {
    cars {
      vin
      leaseFirst
      leaseMonthly
      location
      transportCost
      leaseTotal @client
      leaseQuote @client {
        secondLegFee
        pickupLocation
        # needed total here to get update in quoteList
        leaseTotal
        transportCost
      }
    }
    customerPickupLocations @client
  }
`;

export const GET_VIEW_LEASETOTAL = gql`
  query getCarsLeasetotal {
    viewCars @client {
      leaseTotal
    }
  }
`;

export const GET_VIEW_LEASEQUOTE = gql`
  query getCarsLeasetotal {
    viewCars @client {
      leaseQuote {
        ...LeaseData
      }
    }
  }
  ${LEASE_DATA}
`;

// export const GET_LEASEQUOTE = gql`
//   query GetLeasequoteByVin($vin: String!) {
//     car(vin: $vin) {
//       leaseQuote @client {
//         ...LeaseData
//       }
//     }
//   }
//   ${LEASE_DATA}
// `;

export const GET_VIEW_LEASETOTALQUOTE = gql`
  query getCarsLeasetotal {
    viewCars @client {
      leaseTotal
      leaseQuote {
        secondLegFee
        pickupLocation
      }
    }
  }
`;

export const GET_FILTERS = gql`
  query getFilters @client {
    filters @client {
      ...FiltersData
    }
  }
  ${FILTERS_DATA}
`;

export const GET_SORT_CARS = gql`
  query getSortAndViewCars {
    cars {
      ...CarData
    }
    sortAttribute @client
    isSortReverse @client
  }
  ${CAR_DATA}
`;

export const GET_SORT_VIEW = gql`
  query getSortAndViewCars {
    viewCars @client {
      ...CarData
    }
    sortAttribute @client
    isSortReverse @client
    isFiltered @client
  }
  ${CAR_DATA}
`;

export const GET_SORT = gql`
  query getSortAndViewCars {
    sortAttribute @client
    isSortReverse @client
  }
  ${CAR_DATA}
`;

// export const GET_CARFORM_VARIABLE = gql`
//   query getCarsAndForm($customerState: String!) {
//     cars {
//       make
//       model
//       vin
//       supplier
//       deliveryDays(customerStateVarible: $customerState) @client
//     }
//     viewCars @client {
//       make
//       model
//       vin
//       supplier
//       # deliveryDays
//     }
//     isAlphabetical @client
//     searchText @client
//     customerState @client
//     filters @client {
//       makeModel
//     }
//     searchMakes @client
//     searchMakeModels @client
//   }
// `;

export const GET_CARFORM = gql`
  query getCarsAndForm {
    cars {
      ...CarData
    }
    viewCars @client {
      ...CarData
    }
    sortAttribute @client
    isSortReverse @client
    isFilterView @client
    searchText @client
    customerState @client
    filters @client {
      # ...FiltersData
      # hard coding filter instead of setting up
      make
      makeModel
      mileage
      type
      drivetrain
      retailPrice
      exteriorColor
      interiorColor
      leaseTotal
      leaseFirst
      leaseMonthly
    }
    isFiltered @client
    searchMakes @client
    searchMakeModels @client
    viewField @client
  }
  ${CAR_DATA}
`;

export const GET_CUSTOMER = gql`
  query getCustomer {
    customerState @client
    customerZip @client
    customerCounty @client
    customerTaxRate @client
    taxRateAccuracy @client
    isZipDialog @client
    customerEmail @client
    customerPickupLocation @client
    customerPickupLocations @client
    customerDropoffLocation @client
    customerPickupDate @client
    customerLeaseMonths @client
    cartVin @client
    cartLease @client {
      ...LeaseData
    }
    cartCar @client {
      vin
      year
      make
      model
    }
    insuranceMonthly @client
    insuranceAccuracy @client
    stateAccuracy @client
  }
  ${LEASE_DATA}
`;

export const GET_CAR_CUSTOMER = gql`
  query GetCarByVinCustomer($vin: String!) {
    car(vin: $vin) {
      make
      model
      vin
      type
      retailPrice
    }
    customerState @client
    customerZip @client
    customerCounty @client
    customerTaxRate @client
    isZipDialog @client
    customerEmail @client
    customerPickupLocation @client
    customerPickupLocations @client
    customerDropoffLocation @client
    customerPickupDate @client
    customerLeaseMonths @client
  }
`;

export const GET_CARS_CUSTOMER = gql`
  query getCarsCustomer {
    cars {
      ...CarData
    }
    customerState @client
    customerZip @client
    customerCounty @client
    customerTaxRate @client
    isZipDialog @client
    customerEmail @client
    customerPickupLocation @client
    customerPickupLocations @client
    customerPickupDate @client
    customerLeaseMonths @client
    viewField @client
  }
  # ${CAR_DATA}
`;

export const GET_CARS_VIEW_CUSTOMER = gql`
  query getCarsCustomer {
    cars {
      ...CarData
    }
    viewCars @client {
      ...CarData
    }
    customerState @client
    customerZip @client
    customerCounty @client
    customerTaxRate @client
    isZipDialog @client
    customerEmail @client
    customerPickupLocation @client
    customerPickupLocations @client
    pickupText @client
    dropoffText @client
    customerDropoffLocation @client
    customerPickupDate @client
    customerLeaseMonths @client
    viewField @client
    isShowMore @client
    customerCoordinates @client {
      lat
      lng
    }
  }
  ${CAR_DATA}
`;

export const GET_SEARCHTEXT = gql`
  query getSearchText {
    searchText @client
  }
`;

export const GET_SEARCH_RESULTS = gql`
  query getSearchResults {
    searchText @client
    searchMakeModels @client
  }
`;

export const GET_LEASEQUOTE = gql`
  query getLeaseQuote($quoteId: ID!) {
    leaseQuote(quoteId: $quoteId) {
      ...LeaseData
    }
  }
  ${LEASE_DATA}
`;

// export const SORT_CARS = gql`
//   mutation sortCars($isAlphabetical: Boolean!, $cars: Array!) {
//     sortCars(isAlphabetical: $isAlphabetical, cars: $cars) @client
//   }
// `;

// function IsAlphabetical() {
//   const { data } = useQuery(GET_FILTERS);
//   return data.IsAlphabetical ? <Pages /> : <Login />;
// }

export default function Cars() {
  const { data, loading, error } = useQuery(GET_CARFORM);
  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;
  return (
    <Fragment>
      <Header />
      <CustomerForm />
      <CarsForms />
      {/* having chipset at this level prevents CarsForms from passing the handleMakeFilterChange handler to this component */}
      {/* {!data.isFilterView && <ChipSet />} */}
      <CarList />
    </Fragment>
  );
}
