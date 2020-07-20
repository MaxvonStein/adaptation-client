import React, { Component, Fragment } from "react";
import styled, { css } from "react-emotion";
import { size } from "polished";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { GET_CARS_VIEW, GET_CARFORM, GET_SORT_CARS } from "../pages/cars";
// import { typeDefs } from "../resolvers";

import ModelCheckbox from "./model-checkbox";
import FilterCheckbox from "./filter-checkbox";
import SuggestionItem from "./suggestion-item";
import space from "../assets/images/space.jpg";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { ReactComponent as Curve } from "../assets/curve.svg";
import { ReactComponent as Rocket } from "../assets/rocket.svg";
import { colors, unit } from "../styles";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";
import Box from "@material-ui/core/Box";

// can't call hook outside a function component
// const client = useApolloClient();

// export const SORT_CARS = gql`
//   mutation sortCars($isSortReverse: Boolean!, $cars: Array!) {
//     sortCars(isAlphabetical: $isAlphabetical, cars: $cars) @client
//   }
// `;

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

export const ADD_OR_REMOVE_MAKE_FILTER = gql`
  mutation addOrRemoveMakeFilter($value: String!, $isChecked: Boolean!) {
    addOrRemoveMakeFilter(value: $value, isChecked: $isChecked) @client
  }
`;

export default function FilterForm() {
  const client = useApolloClient();
  const {
    cars,
    viewCars,
    isAlphabetical,
    searchText,
    searchMakes,
    searchMakeModels
  } = client.readQuery({
    query: GET_CARFORM
  });

  const makes = [
    ...new Set(cars.map(c => c.make).sort((a, b) => a.localeCompare(b)))
  ];

  const makeModels = [...new Set(cars.map(c => c.makeModel))];

  const types = [
    ...new Set(cars.map(c => c.type).sort((a, b) => a.localeCompare(b)))
  ];

  const exteriorColors = [
    ...new Set(
      cars.map(c => c.exteriorColor).sort((a, b) => a.localeCompare(b))
    )
  ];

  const interiorColors = [
    ...new Set(
      cars.map(c => c.interiorColor).sort((a, b) => a.localeCompare(b))
    )
  ];

  const isInFilter = (attribute, value) => {
    // is this the best way to get the filters?  we're querying the client for each checkbox - unless react is optimizing this and I'm not aware
    // no luck with determining isInFilter with a local query to ModelFilter typeDef, got 400 errors
    const { filters } = client.readQuery({
      query: GET_CARFORM
    });
    // const filters = { model: [] };
    return filters[attribute].includes(value) ? true : false;
    // return false;
  };

  const aWordStartsWith = (substring, string) => {
    return string
      .toLowerCase()
      .split(" ")
      .some(w => w.substring(0, substring.length) === substring.toLowerCase());
  };

  const isSpelledWith = (substring, string) => {
    return (" " + string.toLowerCase()).includes(" " + substring.toLowerCase());
  };

  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  const [
    addOrRemoveFiltersCarsSort,
    { loading: addRemoveCarsSortLoading, error: addRemoveCarSortError }
  ] = useMutation(ADD_OR_REMOVE_FILTERS_CARS, {
    onCompleted({ addOrRemoveFiltersCars }) {
      client.writeData({
        data: { filters: addOrRemoveFiltersCars.filters }
      });
      // instead of writing to the client, call the sortCars mutate function and let that mutation take care of writing to the client
      sortCars({
        variables: {
          cars: addOrRemoveFiltersCars.viewCars,
          isAlphabetical: addOrRemoveFiltersCars.isAlphabetical
        }
      });
    }
  });

  const [
    addOrRemoveMake,
    { loading: addRemoveMakeLoading, error: addRemoveMakeError }
  ] = useMutation(ADD_OR_REMOVE_MAKE_FILTER, {
    onCompleted({ addOrRemoveMakeFilter }) {
      client.writeData({
        data: { filters: addOrRemoveMakeFilter.filters }
      });
    }
  });

  const handleFilterChange = async event => {
    const target = event.target;
    const attribute = target.name;
    const values = [target.type === "checkbox" && target.value];
    // unchecked checkbox will show a false value?  Or null?
    const isChecked = target.checked;
    // await query for cars
    const { cars, isAlphabetical } = await client.readQuery({
      query: GET_SORT_CARS
    });
    addOrRemoveFiltersCarsSort({
      variables: { attribute, values, isChecked, cars, makeModels },
      context: { isAlphabetical, makeModels }
    });
  };

  const handleMakeFilterChange = async event => {
    // mirror handleFilterChange except pass addOrRemove.. more than one value
    const target = event.target;
    const make = target.value;
    const modelValues = makeModels.filter(
      makeModel => makeModel.substr(0, makeModel.indexOf(":")) === make
    );
    const isChecked = target.checked;
    // await query for cars
    const { cars, isAlphabetical } = await client.readQuery({
      query: GET_SORT_CARS
    });
    // add or remove the make to or from filters
    addOrRemoveMake({
      variables: {
        value: make,
        isChecked
      }
    });
    addOrRemoveFiltersCarsSort({
      variables: {
        attribute: "makeModel",
        values: modelValues,
        isChecked,
        cars
      },
      context: { isAlphabetical }
    });
  };

  const handleSortChange = event => {
    const isAlphabetical = event.target.value === "alphabetical";
    const { cars, viewCars } = client.readQuery({
      query: GET_CARS_VIEW
    });
    sortCars({
      variables: {
        isAlphabetical,
        cars: viewCars.length === 0 ? cars : viewCars
      }
    });
  };

  // update this to use constants instead of a query each time the function runs
  const handleSearchType = event => {
    const target = event.target;
    const searchText = target.value;
    if (searchText === "") {
      client.writeData({
        data: { searchMakes: [], searchMakeModels: [], searchText: "" }
      });
      return;
    }
    // const { cars } = client.readQuery({
    //   query: GET_CARS
    // });
    // const makeModels = [...new Set(cars.map(c => c.make + ":" + c.model))];
    const searchMakeModels = makeModels.filter(makeModel =>
      isSpelledWith(searchText, makeModel.replace(":", " "))
    );
    const searchMakes = makes.filter(make => aWordStartsWith(searchText, make));
    // check the substring after a make
    // if (searchMakes.length > 0 && )
    client.writeData({ data: { searchMakeModels, searchMakes, searchText } });
  };

  return (
    <Container>
      <StyledForm>
        <StyledTextInput
          type="text"
          onChange={handleSearchType}
          value={searchText}
          placeholder="search for a make or model..."
        ></StyledTextInput>
        {searchMakeModels.length > 0 && (
          <StyledSuggestionList>
            {[
              ...new Set(
                searchMakeModels.map(makeModel =>
                  makeModel.substr(0, makeModel.indexOf(":"))
                )
              )
            ].map(make => {
              let searchMakeMatchModels = searchMakeModels.filter(makeModel =>
                makeModel.includes(make + ":")
              );
              return (
                <div>
                  {make.toLowerCase().includes(searchText.toLowerCase()) && (
                    <SuggestionItem
                      name="make"
                      value={make}
                      label={make}
                      checked={isInFilter("make", make)}
                      handleClick={handleMakeFilterChange}
                      searchString={searchText}
                    ></SuggestionItem>
                  )}
                  {searchMakeMatchModels.map(makeMatchModel => {
                    return (
                      <SuggestionItem
                        name="makeModel"
                        value={makeMatchModel}
                        label={makeMatchModel.replace(":", " ")}
                        checked={isInFilter("makeModel", makeMatchModel)}
                        handleClick={handleFilterChange}
                        searchString={searchText}
                      ></SuggestionItem>
                    );
                  })}
                </div>
              );
            })}
          </StyledSuggestionList>
        )}
        <StyledSelect
          required
          name="sort"
          data-testid="sort-select"
          onChange={handleSortChange}
          value={isAlphabetical ? "alphabetical" : "reverse"}
        >
          <option value="alphabetical">alphabetical</option>
          <option value="reverse">reverse</option>
        </StyledSelect>
        <Slider min={0} max={50000} aria-label="Price" name="price" />
        <p>Make & Model</p>
        <ScrollBox>
          {// [
          // ...new Set(
          //   cars
          //     .map(c => c.make + ":" + c.model)
          //     .sort((a, b) => a.localeCompare(b))
          // )
          makes.map((m, i) => {
            let makeMatchModels = [
              ...new Set(
                cars
                  .filter(c => c.make === m)
                  .map(c => c.makeModel)
                  .sort((a, b) => a.localeCompare(b))
              )
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
                    onChange={handleMakeFilterChange}
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
                        onChange={handleFilterChange}
                        child
                      />
                      <StyledSpan>{m.split(":").pop()}</StyledSpan>
                    </InputContainer>
                  );
                })}
              </div>
            );
          })}
        </ScrollBox>
        <p>Type</p>
        {types.map((type, i) => {
          return (
            <InputContainer key={i}>
              <FilterCheckbox
                attributeName="type"
                attributeValue={type}
                checked={isInFilter("type", type)}
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
              />
              <StyledSpan>{exteriorColor}</StyledSpan>
            </InputContainer>
          );
        })}
      </StyledForm>
      <Box
        display="flex"
        alignItems="center"
        maxWidth={380}
        padding={3.5}
        width="100%"
      >
        <Box flexGrow={1}>
          <span>{viewCars.length} options</span>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => client.writeData({ data: { isFilterView: false } })}
          >
            Done
          </Button>
        </Box>
      </Box>
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
  backgroundPosition: "center"
});

const svgClassName = css({
  display: "block",
  fill: "currentColor"
});

const Header = styled("header")(svgClassName, {
  width: "100%",
  marginBottom: unit * 5,
  padding: unit * 2.5,
  position: "relative"
});

const StyledLogo = styled(Logo)(size(56), {
  display: "block",
  margin: "0 auto",
  position: "relative"
});

const StyledCurve = styled(Curve)(size("100%"), {
  fill: colors.primary,
  position: "absolute",
  top: 0,
  left: 0
});

const Heading = styled("h1")({
  margin: `${unit * 3}px 0 ${unit * 6}px`
});

const StyledRocket = styled(Rocket)(svgClassName, {
  width: 250
});

const StyledForm = styled("form")({
  width: "100%",
  maxWidth: 380,
  padding: unit * 3.5,
  borderRadius: 3,
  boxShadow: "6px 6px 1px rgba(0, 0, 0, 0.25)",
  color: colors.text,
  backgroundColor: "white"
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
    borderColor: colors.primary
  }
});

const StyledTextInput = styled("input")({
  width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary
  }
});

const StyledSuggestionList = styled("ul")({
  width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary
  }
});

const StyledSelect = styled("select")({
  width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary
  }
});

const InputContainer = styled("div")({
  display: `inline-block`,
  width: 170
});

const StyledSpan = styled("span")({
  padding: `${unit * 1.2}px ${unit * 1.2}px ${unit}px ${unit * 2}`,
  fontSize: 16,
  maxWidth: 112
});

const ScrollBox = styled("div")({
  overflowY: `auto`,
  maxHeight: 300
});
