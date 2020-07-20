import React from "react";
import styled, { css } from "react-emotion";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  GET_CARS_VIEW,
  GET_SORT_VIEW,
  GET_CARFORM,
  GET_SEARCHTEXT
} from "../pages/cars";
import { SORT_CARS } from "./cars-forms";
// import StyledSelect from "./cars-forms";
// import StyledForm from "./cars-forms";

// export { GET_SORT_VIEW, GET_CARS_VIEW };

import { colors, unit } from "../styles";

export default function SearchBar({ makes, makeModels }) {
  const aWordStartsWith = (substring, string) => {
    return string
      .toLowerCase()
      .split(" ")
      .some(w => w.substring(0, substring.length) === substring.toLowerCase());
  };

  const isSpelledWith = (substring, string) => {
    return (" " + string.toLowerCase()).includes(" " + substring.toLowerCase());
  };

  const client = useApolloClient();

  const { searchText } = client.readQuery({ query: GET_SEARCHTEXT });

  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

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
    <StyledTextInput
      type="text"
      onChange={handleSearchType}
      value={searchText}
      placeholder="search for a make or model..."
    ></StyledTextInput>
  );
}

export const StyledForm = styled("form")({
  width: "100%",
  maxWidth: 380,
  padding: unit * 3.5,
  borderRadius: 3,
  boxShadow: "6px 6px 1px rgba(0, 0, 0, 0.25)",
  color: colors.text,
  backgroundColor: "white"
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
