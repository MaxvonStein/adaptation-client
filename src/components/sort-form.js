import React, { Fragment } from "react";
import styled, { css } from "react-emotion";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { GET_CARS_VIEW, GET_SORT } from "../pages/cars";
import { SORT_CARS } from "./cars-forms";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Box from "@material-ui/core/Box";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import { colors, unit } from "../styles";
import { IconButton } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import SimpleMenu from "./simple-menu";
import IconMenu from "./icon-menu";

// import StyledSelect from "./cars-forms";
// import StyledForm from "./cars-forms";

// export { GET_SORT_VIEW, GET_CARS_VIEW };

const useStyles = makeStyles((theme) => ({
  sortMenuBox: { position: "relative" },
  sortMenu: { position: "absolute", right: 0, zIndex: 2 },
}));

export default function SortForm({ isLease }) {
  const client = useApolloClient();

  const classes = useStyles();

  let { sortAttribute, isSortReverse } = client.readQuery({
    query: GET_SORT,
  });

  // if (!sortAttribute) {
  //   sortAttribute = isLease ? "leaseTotal" : "retailPrice";
  //   client.writeData({ data: { sortAttribute, isSortReverse: false } });
  // }

  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  const handleSortChange = (event, value) => {
    const sortAttribute = value.replace("-reverse", "");
    const isSortReverse = value.includes("-reverse");
    const { cars, viewCars } = client.readQuery({
      query: GET_CARS_VIEW,
    });
    sortCars({
      variables: {
        sortAttribute,
        isSortReverse,
        cars: viewCars.length === 0 ? cars : viewCars,
      },
    });
    localStorage.setItem("sortAttribute", sortAttribute);
    localStorage.setItem("isSortReverse", isSortReverse);
  };

  return (
    <Box className={classes.sortMenuBox}>
      <IconMenu
        // make optione depend on isLease
        options={[
          { name: "price", value: "leaseTotal" },
          { name: "reverse price", value: "leaseTotal-reverse" },
          { name: "make", value: "make" },
          { name: "reverse make", value: "make-reverse" },
        ]}
        onChange={handleSortChange}
        icon={<ImportExportIcon />}
        className={classes.sortMenu}
      />
    </Box>
  );
}

export const StyledForm = styled("form")({
  width: "100%",
  maxWidth: 380,
  padding: unit * 3.5,
  borderRadius: 3,
  boxShadow: "6px 6px 1px rgba(0, 0, 0, 0.25)",
  color: colors.text,
  backgroundColor: "white",
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
