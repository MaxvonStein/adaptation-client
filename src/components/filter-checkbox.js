import React from "react";
import { useQuery } from "@apollo/react-hooks";
import styled from "react-emotion";
import gql from "graphql-tag";

import { colors, unit } from "../styles";

export default function FilterCheckbox({
  attributeName,
  attributeValue,
  onChange,
  checked,
  child,
}) {
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
      name={attributeName}
      value={attributeValue}
      // checked={data.isInFilter}
      checked={checked}
      data-testid="filter-model"
      onChange={onChange}
      child={child}
    />
  );
}

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

// use the material ui styled tool here instead
const StyledInput = styled("input")((props) => ({
  width: 16,
  // width: "100%",
  marginBottom: unit * 2,
  padding: `${unit * 1.25}px ${unit * 2.5}px`,
  // clean up this logic, use a pure if statement instead of inherit
  marginLeft: props.child && `${unit * 2.5}px`,
  //marginLeft: props.child ? `${unit * 2.5}px` : `inherit`,
  border: `1px solid ${colors.grey}`,
  fontSize: 16,
  outline: "none",
  ":focus": {
    borderColor: colors.primary,
  },
}));
