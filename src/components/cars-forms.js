import React, { Component, Fragment } from "react";
import styled, { css } from "react-emotion";
import { size } from "polished";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { GET_CARS_VIEW, GET_CARFORM, GET_SORT_CARS } from "../pages/cars";

import ModelCheckbox from "./model-checkbox";
import FilterCheckbox from "./filter-checkbox";
import SuggestionItem from "./suggestion-item";
import PriceSlider from "./price-slider";
import space from "../assets/images/space.jpg";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { ReactComponent as Curve } from "../assets/curve.svg";
import { ReactComponent as Rocket } from "../assets/rocket.svg";
import { colors, unit } from "../styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import SortForm from "./sort-form";
import SearchBar from "./search-bar";
import SearchSuggestions from "./search-suggestions";
import ChipSet from "./chip-set";

// can't call hook outside a function component
// const client = useApolloClient();

export const SORT_CARS = gql`
  mutation sortCars(
    $sortAttribute: String!
    $isSortReverse: Boolean
    $cars: Array!
  ) {
    sortCars(
      sortAttribute: $sortAttribute
      isSortReverse: $isSortReverse
      cars: $cars
    ) @client
  }
`;

export const ADD_OR_REMOVE_FILTERS_CARS = gql`
  mutation addOrRemoveFiltersCars(
    $attribute: String!
    $values: [String!]
    $isChecked: Boolean!
    $cars: Array!
    $makeModels: Array
  ) {
    addOrRemoveFiltersCars(
      attribute: $attribute
      values: $values
      isChecked: $isChecked
      cars: $cars
      makeModels: $makeModels
    ) @client
  }
`;

export const CLEAR_FILTERS_CARS = gql`
  mutation clearFiltersCars(
    $attribute: String!
    $cars: Array!
    $makeModels: Array
  ) {
    clearFiltersCars(
      attribute: $attribute
      cars: $cars
      makeModels: $makeModels
    ) @client
  }
`;

// export const ADD_OR_REMOVE_MAKE_FILTER = gql`
//   mutation addOrRemoveMakeFilter($value: String!, $isChecked: Boolean!) {
//     addOrRemoveMakeFilter(value: $value, isChecked: $isChecked) @client
//   }
// `;

export default function CarsForms() {
  const client = useApolloClient();
  const {
    cars,
    viewCars,
    sortAttribute,
    isSortReverse,
    isFilterView,
    searchText,
    searchMakes,
    searchMakeModels,
  } = client.readQuery({
    query: GET_CARFORM,
  });

  const makes = [
    ...new Set(cars.map((c) => c.make).sort((a, b) => a.localeCompare(b))),
  ];

  const makeModels = [...new Set(cars.map((c) => c.makeModel))];

  const types = [
    ...new Set(cars.map((c) => c.type).sort((a, b) => a.localeCompare(b))),
  ];

  const exteriorColors = [
    ...new Set(
      cars.map((c) => c.exteriorColor).sort((a, b) => a.localeCompare(b))
    ),
  ];

  const drivetrains = [
    ...new Set(
      cars.map((c) => c.drivetrain).sort((a, b) => a.localeCompare(b))
    ),
  ];

  // const interiorColors = [
  //   ...new Set(
  //     cars.map(c => c.interiorColor).sort((a, b) => a.localeCompare(b))
  //   )
  // ];

  const isInFilter = (attribute, value) => {
    // is this the best way to get the filters?  we're querying the client for each checkbox - unless react is optimizing this and I'm not aware
    // no luck with determining isInFilter with a local query to ModelFilter typeDef, got 400 errors
    const { filters } = client.readQuery({
      query: GET_CARFORM,
    });
    // const filters = { model: [] };
    return filters[attribute].includes(value);
    // return false;
  };

  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  const [
    addOrRemoveFiltersCarsSort,
    { loading: addRemoveCarsSortLoading, error: addRemoveCarSortError },
  ] = useMutation(ADD_OR_REMOVE_FILTERS_CARS, {
    onCompleted({ addOrRemoveFiltersCars }) {
      client.writeData({
        data: { filters: addOrRemoveFiltersCars.filters, isFiltered: true },
      });
      // instead of writing to the client, call the sortCars mutate function and let that mutation take care of writing to the client
      sortCars({
        variables: {
          cars: addOrRemoveFiltersCars.viewCars,
          sortAttribute: addOrRemoveFiltersCars.sortAttribute,
          isSortReverse: addOrRemoveFiltersCars.isSortReverse,
        },
      });
    },
  });

  // const [
  //   addOrRemoveMake,
  //   { loading: addRemoveMakeLoading, error: addRemoveMakeError }
  // ] = useMutation(ADD_OR_REMOVE_MAKE_FILTER, {
  //   onCompleted({ addOrRemoveMakeFilter }) {
  //     debugger;
  //     client.writeData({
  //       data: { filters: addOrRemoveMakeFilter.filters }
  //     });
  //   }
  // });

  const handleFilterChange = (targetType, makeFilter = false) => async (
    event
  ) => {
    // curried handler
    let target, attribute, values, isChecked, modelValues;
    switch (targetType) {
      case "checkbox":
        target = event.target;
        attribute = target.name;
        values = [target.value];
        isChecked = target.checked;
        break;
      case "chip":
        target = event.target.closest("div[role='button']");
        attribute = target.getAttribute("name");
        values = [target.getAttribute("value")];
        isChecked = false;
        break;
      default:
    }
    console.log(target, attribute, values, isChecked, modelValues);
    // await query for cars
    const { cars, sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT_CARS,
    });
    if (makeFilter) {
      // addOrRemoveMake({
      //   variables: {
      //     value: values[0],
      //     isChecked
      //   }
      // });
      modelValues = makeModels.filter(
        (makeModel) => makeModel.substr(0, makeModel.indexOf(":")) === values[0]
      );
    }
    addOrRemoveFiltersCarsSort({
      variables: {
        // because we have addOrRemoveMake adding the make to filters["make"], and we have the addOrRemoveFilterCarsSort adding all the modelValues, that's also checking for all models in a make being checked
        attribute: !makeFilter ? attribute : "makeModel",
        values: !makeFilter ? values : modelValues,
        isChecked,
        cars,
        makeModels,
      },
      context: { sortAttribute, isSortReverse, makeModels },
    });
  };

  // const handleMakeFilterChange = targetType => async event => {
  //   // mirror handleFilterChange except pass addOrRemove.. more than one value

  //   const target = event.target;
  //   const make = target.value;
  //   const modelValues = makeModels.filter(
  //     makeModel => makeModel.substr(0, makeModel.indexOf(":")) === make
  //   );
  //   const isChecked = target.checked;
  //   // await query for cars
  //   const { cars, isAlphabetical } = await client.readQuery({
  //     query: GET_SORT_CARS
  //   });
  //   // add or remove the make to or from filters
  //   addOrRemoveMake({
  //     variables: {
  //       value: make,
  //       isChecked
  //     }
  //   });
  //   addOrRemoveFiltersCarsSort({
  //     variables: {
  //       attribute: "makeModel",
  //       values: modelValues,
  //       isChecked,
  //       cars
  //     },
  //     context: { isAlphabetical }
  //   });
  // };

  const handleRetailPriceChange = async (event, value) => {
    const attribute = "retailPrice";
    const values = [value];
    // await query for cars
    const { cars, sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT_CARS,
    });
    addOrRemoveFiltersCarsSort({
      variables: { attribute, values, isChecked: true, cars, makeModels },
      context: { sortAttribute, isSortReverse, makeModels },
    });
  };

  return (
    <Container>
      <SortForm />
      <StyledForm>
        <SearchBar makes={makes} makeModels={makeModels} />
        <SearchSuggestions handleFilterChange={handleFilterChange} />
        <p>Price</p>
        <PriceSlider
          attributeName="retailPrice"
          onChange={handleRetailPriceChange}
          thousands={true}
        />
      </StyledForm>
      {isFilterView && (
        <StyledForm>
          <p>Make & Model</p>
          <ScrollBox>
            {
              // [
              // ...new Set(
              //   cars
              //     .map(c => c.make + ":" + c.model)
              //     .sort((a, b) => a.localeCompare(b))
              // )
              makes.map((m, i) => {
                let makeMatchModels = [
                  ...new Set(
                    cars
                      .filter((c) => c.make === m)
                      .map((c) => c.makeModel)
                      .sort((a, b) => a.localeCompare(b))
                  ),
                ];
                //let make = makes[0]
                // .filter(c => c.make === m)
                return (
                  <div key={i}>
                    <InputContainer>
                      <FilterCheckbox
                        attributeName="make"
                        attributeValue={m}
                        checked={isInFilter("make", m)}
                        onChange={handleFilterChange("checkbox", true)}
                        matchModels={makeMatchModels}
                      />
                      <StyledSpan>{m.replace(":", " ")}</StyledSpan>
                    </InputContainer>
                    {makeMatchModels.map((m, j) => {
                      return (
                        <InputContainer key={j}>
                          <FilterCheckbox
                            attributeName="makeModel"
                            attributeValue={m}
                            checked={isInFilter("makeModel", m)}
                            onChange={handleFilterChange("checkbox")}
                            child
                          />
                          <StyledSpan>{m.split(":").pop()}</StyledSpan>
                        </InputContainer>
                      );
                    })}
                  </div>
                );
              })
            }
          </ScrollBox>
          <p>Type</p>
          {types.map((type, i) => {
            return (
              <InputContainer key={i}>
                <FilterCheckbox
                  attributeName="type"
                  attributeValue={type}
                  checked={isInFilter("type", type)}
                  onChange={handleFilterChange("checkbox")}
                />
                <StyledSpan>{type}</StyledSpan>
              </InputContainer>
            );
          })}
          <p>Color</p>
          {exteriorColors.map((exteriorColor, i) => {
            return (
              <InputContainer key={i}>
                <FilterCheckbox
                  attributeName="exteriorColor"
                  attributeValue={exteriorColor}
                  checked={isInFilter("exteriorColor", exteriorColor)}
                  onChange={handleFilterChange("checkbox")}
                />
                <StyledSpan>{exteriorColor}</StyledSpan>
              </InputContainer>
            );
          })}
        </StyledForm>
      )}
      {isFilterView && (
        <Box
          display="flex"
          alignItems="center"
          maxWidth={380}
          padding={3.5}
          width="100%"
        >
          <span>{viewCars.length} options</span>
          <Box flexGrow={1}></Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                client.writeData({ data: { isFilterView: false } })
              }
            >
              Done
            </Button>
          </Box>
        </Box>
      )}
      <ChipSet handleFilterChange={handleFilterChange}></ChipSet>
    </Container>
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

const svgClassName = css({
  display: "block",
  fill: "currentColor",
});

const Header = styled("header")(svgClassName, {
  width: "100%",
  marginBottom: unit * 5,
  padding: unit * 2.5,
  position: "relative",
});

const StyledLogo = styled(Logo)(size(56), {
  display: "block",
  margin: "0 auto",
  position: "relative",
});

const StyledCurve = styled(Curve)(size("100%"), {
  fill: colors.primary,
  position: "absolute",
  top: 0,
  left: 0,
});

const Heading = styled("h1")({
  margin: `${unit * 3}px 0 ${unit * 6}px`,
});

const StyledRocket = styled(Rocket)(svgClassName, {
  width: 250,
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

const StyledInput = styled("input")({
  width: 16,
  // width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary,
  },
});

const StyledTextInput = styled("input")({
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

const StyledSuggestionList = styled("ul")({
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

const InputContainer = styled("div")({
  display: `inline-block`,
  width: 170,
});

const StyledSpan = styled("span")({
  padding: `${unit * 1.2}px ${unit * 1.2}px ${unit}px ${unit * 2}`,
  fontSize: 16,
  maxWidth: 112,
});

const ScrollBox = styled("div")({
  overflowY: `auto`,
  maxHeight: 300,
});
