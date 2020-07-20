import React from "react";
import { useQuery } from "@apollo/react-hooks";
import styled from "react-emotion";
import gql from "graphql-tag";

import { colors, unit } from "../styles";

const GET_CHECKBOX_DETAILS = gql`
  query CheckboxDetails($modelName: String!) {
    modelCheckbox(name: $modelName) {
      isInFilter @client
    }
  }
  # Might need a fragment here, see launch.js
`;

export const GET_LAUNCH_DETAILS = gql`
  query LaunchDetails($launchId: ID!) {
    launch(id: $launchId) {
      id
      site
      isBooked
      rocket {
        id
        name
        type
      }
      mission {
        name
        missionPatch
      }
    }
  }
`;

export default function ModelCheckbox({ modelName, onChange, checked }) {
  // const { data, loading, error } = useQuery(GET_CHECKBOX_DETAILS, {
  //   // variables: { launchId: modelName }
  //   variables: { modelName }
  // });

  // if (error) {
  //   console.log(error);
  //   return <p>ERROR: {error.message}</p>;
  // }

  return (
    <StyledInput
      type="checkbox"
      name="model"
      value={modelName}
      // checked={data.isInFilter}
      checked={checked}
      data-testid="filter-model"
      onChange={onChange}
    />
  );
}

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

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
