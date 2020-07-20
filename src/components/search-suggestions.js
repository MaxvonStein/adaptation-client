import React from "react";
import styled, { css } from "react-emotion";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  GET_CARS_VIEW,
  GET_CARFORM,
  GET_SORT_CARS,
  GET_SORT_VIEW,
  GET_FILTERS,
  GET_SEARCHTEXT,
  GET_SEARCH_RESULTS
} from "../pages/cars";
import {
  SORT_CARS,
  ADD_OR_REMOVE_FILTERS_CARS,
  ADD_OR_REMOVE_MAKE_FILTER
} from "./cars-forms";
import SuggestionItem from "./suggestion-item";
// import StyledSelect from "./cars-forms";
// import StyledForm from "./cars-forms";

// export { GET_SORT_VIEW, GET_CARS_VIEW };

import { colors, unit } from "../styles";

export default function SearchSuggestions({ handleFilterChange }) {
  // figure out how to import this from cars-forms.  or maybe from a util?
  const isInFilter = (attribute, value) => {
    // is this the best way to get the filters?  we're querying the client for each checkbox - unless react is optimizing this and I'm not aware
    // no luck with determining isInFilter with a local query to ModelFilter typeDef, got 400 errors
    const { filters } = client.readQuery({
      query: GET_FILTERS
    });
    // const filters = { model: [] };
    return filters[attribute].includes(value);
    // return false;
  };

  const client = useApolloClient();

  const { searchMakeModels, searchText } = client.readQuery({
    query: GET_SEARCH_RESULTS
  });

  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  // what's the right way to import these or share them from component to component?
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
          sortAttribute: addOrRemoveFiltersCars.sortAttribute,
          isSortReverse: addOrRemoveFiltersCars.isSortReverse
        }
      });
    }
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

  return (
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
                handleClick={handleFilterChange("checkbox", true)}
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
                  handleClick={handleFilterChange("checkbox")}
                  searchString={searchText}
                ></SuggestionItem>
              );
            })}
          </div>
        );
      })}
    </StyledSuggestionList>
  );
}

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
