import React, { Component, Fragment } from "react";
import { css } from "react-emotion";
import { size } from "polished";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  GET_CARS_VIEW,
  GET_CARFORM,
  GET_SORT_CARS,
  GET_FILTERS,
} from "../pages/cars";
import {
  SORT_CARS,
  ADD_OR_REMOVE_FILTERS_CARS,
  CLEAR_FILTERS_CARS,
} from "../components/cars-forms";
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
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Slider from "@material-ui/core/Slider";
import Checkbox from "@material-ui/core/Checkbox";
import Collapse from "@material-ui/core/Collapse";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import blue from "@material-ui/core/colors/blue";
import FilterListIcon from "@material-ui/icons/FilterList";
import { makeStyles, styled, useTheme } from "@material-ui/core/styles";
import debounce from "lodash/debounce";
import SortForm from "./sort-form";
import SearchBar from "./search-bar";
import SearchSuggestions from "./search-suggestions";
import {
  filterAttributesNames,
  numericalAttributesNames,
  MAXTOTAL,
  MAXPRICE,
  MAXMILEAGE,
  DEFAULTVALUE,
} from "../constants";

const useStyles = makeStyles((theme) => ({
  none: {
    display: "none",
  },
  chipScrollbox: {
    overflowX: `auto`,
    whiteSpace: "nowrap",
    "&::-webkit-scrollbar": { display: "none" },
    // prevents margin collapse
    display: "inline-block",
    marginTop: 5,
  },
  filterChip: {
    marginRight: 6,
    marginBottom: 3,
    color: theme.palette.text.primary,
  },
  // filteredChip first so the color is overwritten by selectedChip
  filteredChip: {
    backgroundColor: blue[100],
    "&:hover": {
      backgroundColor: blue[200],
    },
  },
  selectedChip: {
    color: theme.palette.primary.light,
    fontWeight: 500,
  },
  scrollboxContainer: {
    // prevents inline-block scrollbox from creating a huge width
    overflow: "hidden",
  },
  collapseButtonBox: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 6,
    marginBottom: 8,
  },
  collapseButton: {
    margin: 8,
  },
  // collapse: { paddingLeft: theme.switchbankRow.paddingLeft },
  filtersetBox: { marginTop: 8 },
  formElement: theme.formElement,
  switchbankRow: theme.switchbankRow,
  switchbankIconMenu: theme.switchbankIconMenu,
  switchbankBox: theme.switchbankBox,
}));

function AttributeFilterset({
  cars,
  attribute,
  attributeName,
  onChange,
  checked,
}) {
  const classes = useStyles();
  const values = [
    ...new Set(
      cars.map((c) => c[attribute]).sort((a, b) => a.localeCompare(b))
    ),
  ];

  return (
    <Box className={classes.filtersetBox}>
      <FormLabel>{attributeName}</FormLabel>
      <FormGroup row>
        {values.map((value, i) => {
          return (
            <InputContainer key={i}>
              <Checkbox
                name={attribute}
                value={value}
                checked={checked(value)}
                onChange={onChange}
              />
              <StyledSpan>{value}</StyledSpan>
            </InputContainer>
          );
        })}
      </FormGroup>
    </Box>
  );
}

function NumericalAttributeFilter({
  attribute,
  attributeName,
  // value,
  onChange,
  ...other
}) {
  // const client = useApolloClient();
  // const { filters } = client.readQuery({ query: GET_FILTERS });
  let maxValue = ((attribute) => {
    switch (attribute) {
      case "retailPrice":
        return MAXPRICE;
      case "mileage":
        return MAXMILEAGE;
      default:
        return MAXTOTAL;
    }
  })(attribute);

  return (
    <FormGroup {...other}>
      <FormLabel>{attributeName}</FormLabel>
      <Slider
        min={0}
        max={maxValue}
        // value={value}
        defaultValue={maxValue}
        step={attribute === "mileage" ? 5000 : 100}
        // valueLabelFormat={thousands && ksLabelFormat}
        aria-label={attributeName}
        name={attributeName}
        valueLabelDisplay="auto"
        // onChange={() => {
        //   console.log("onChange");
        // }}
        onChangeCommitted={onChange}
        {...other}
      />
    </FormGroup>
  );
}

export default function QuoteFilterForms() {
  const client = useApolloClient();

  const classes = useStyles();

  // find tighter query
  const { data, loading, error } = useQuery(GET_CARFORM);

  // useMutation hooks need to be called before return
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

  const [
    clearFiltersCarsSort,
    { loading: clearCarsSortLoading, error: clearCarSortError },
  ] = useMutation(CLEAR_FILTERS_CARS, {
    onCompleted({ clearFiltersCars }) {
      client.writeData({
        data: { filters: clearFiltersCars.filters, isFiltered: true },
      });
      // instead of writing to the client, call the sortCars mutate function and let that mutation take care of writing to the client
      sortCars({
        variables: {
          cars: clearFiltersCars.viewCars,
          sortAttribute: clearFiltersCars.sortAttribute,
          isSortReverse: clearFiltersCars.isSortReverse,
        },
      });
    },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const makes = [
    ...new Set(data.cars.map((c) => c.make).sort((a, b) => a.localeCompare(b))),
  ];

  const makeModels = [...new Set(data.cars.map((c) => c.makeModel))];

  const types = [
    ...new Set(data.cars.map((c) => c.type).sort((a, b) => a.localeCompare(b))),
  ];

  const exteriorColors = [
    ...new Set(
      data.cars.map((c) => c.exteriorColor).sort((a, b) => a.localeCompare(b))
    ),
  ];

  const drivetrains = [
    ...new Set(
      data.cars.map((c) => c.drivetrain).sort((a, b) => a.localeCompare(b))
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
    return filters[attribute].includes(value) ? true : false;
    // return false;
  };

  const isInFilterCurry = (attribute) => (value) => {
    // is this the best way to get the filters?  we're querying the client for each checkbox - unless react is optimizing this and I'm not aware
    // no luck with determining isInFilter with a local query to ModelFilter typeDef, got 400 errors
    const { filters } = client.readQuery({
      query: GET_CARFORM,
    });
    // const filters = { model: [] };
    return filters[attribute].includes(value) ? true : false;
    // return false;
  };

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

  const handleNumericalChange = (attribute) => async (event, value) => {
    const values = [value];
    // await query for cars
    // do we need this?
    const { cars, sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT_CARS,
    });
    addOrRemoveFiltersCarsSort({
      variables: { attribute, values, isChecked: true, cars, makeModels },
      context: { sortAttribute, isSortReverse, makeModels },
    });
  };

  // const handleFilterClear = {};

  const handleClear = (attribute) => async (event) => {
    // await query for cars
    const { cars, sortAttribute, isSortReverse } = await client.readQuery({
      query: GET_SORT_CARS,
    });
    clearFiltersCarsSort({
      variables: { attribute, cars, makeModels },
      context: { sortAttribute, isSortReverse, makeModels },
    });
  };

  const handleAttributeClick = (attribute) => (event) => {
    client.writeData({ data: { viewField: attribute } });
  };

  const viewFilterAttributeObject = filterAttributesNames.find(
    (attributeObject) => attributeObject.attribute === data.viewField
  );

  const viewNumericalAttributeObject = numericalAttributesNames.find(
    (attributeObject) => attributeObject.attribute === data.viewField
  );

  return (
    <Fragment>
      {/* filter chips */}
      <Box className={classes.switchbankRow}>
        {/* <FilterListIcon /> */}
        <Box
          // invisible scrollbar still adding height to this div?
          className={`${classes.switchbankBox} ${classes.scrollboxContainer}`}
        >
          <Box className={classes.chipScrollbox}>
            {[...filterAttributesNames, ...numericalAttributesNames].map(
              (attributeObject, index) => (
                <Chip
                  clickable
                  // variant={
                  //   data.filters[attributeObject.attribute].length === 0 ||
                  //   data.filters[attributeObject.attribute] === DEFAULTVALUE
                  //     ? "outlined"
                  //     : "default"
                  // }
                  // variant="outlined"
                  onClick={handleAttributeClick(attributeObject.attribute)}
                  label={attributeObject.name}
                  // selected={data.viewField === attributeObject.attribute}
                  className={`${classes.filterChip} ${
                    !(
                      data.filters[attributeObject.attribute].length === 0 ||
                      data.filters[attributeObject.attribute] === DEFAULTVALUE
                    ) && classes.filteredChip
                  } ${
                    data.viewField === attributeObject.attribute &&
                    classes.selectedChip
                  }`}
                  key={index}
                  // consider a custom delete icon that's a filter with a strikethrough
                />
              )
            )}
          </Box>
        </Box>
      </Box>
      {/* filter sets */}
      {/* what do we need the form for? */}
      {/* <StyledForm> */}
      <Collapse in={!!data.viewField} className={classes.switchbankBox}>
        {data.viewField === "makeModel" && (
          <Fragment>
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
                      data.cars
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
            </ScrollBox>{" "}
          </Fragment>
        )}
        {/*  can't find a better way  */}
        {/* {[...filterAttributesNames.find(attributeObject => attributeObject.attribute === data.viewField)].map(viewAttributeObject => {
      return ( */}
        {viewFilterAttributeObject && (
          <AttributeFilterset
            cars={data.cars}
            attribute={viewFilterAttributeObject.attribute}
            attributeName={viewFilterAttributeObject.name}
            onChange={handleFilterChange("checkbox")}
            checked={isInFilterCurry(viewFilterAttributeObject.attribute)}
          />
        )}
        {numericalAttributesNames.map((attributeObject, index) => (
          // how to assign keys here?
          <Box
            className={
              attributeObject.attribute === data.viewField
                ? classes.filtersetBox
                : classes.none
            }
          >
            <NumericalAttributeFilter
              className={
                attributeObject.attribute === data.viewField
                  ? null
                  : classes.none
              }
              attribute={attributeObject.attribute}
              attributeName={attributeObject.name}
              onChange={handleNumericalChange(attributeObject.attribute)}
            />
          </Box>
        ))}
        <Box className={classes.collapseButtonBox}>
          {data.viewField &&
          data.filters &&
          data.filters[data.viewField] &&
          (data.filters[data.viewField].length === 0 ||
            data.filters[data.viewField] === DEFAULTVALUE) ? undefined : (
            <Button
              size="small"
              onClick={handleClear(data.viewField)}
              className={classes.collapseButton}
            >
              Clear all
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={() => client.writeData({ data: { viewField: null } })}
            className={classes.collapseButton}
          >
            Done
          </Button>
        </Box>
      </Collapse>
      {/* because this renders a new Slider each time the filter changes, the value hangs over from one filter to the other  */}
      {/* {viewNumericalAttributeObject && (
        <Fragment>
        <NumericalAttributeFilter
              attribute={viewNumericalAttributeObject.attribute}
              attributeName={viewNumericalAttributeObject.name}
              // value={data.filters[viewNumericalAttributeObject.attribute]}
              onChange={handleNumericalChange(
                viewNumericalAttributeObject.attribute
                )}
                filters={data.filters}
                />
                </Fragment>
              )} */}
      {/* </StyledForm> */}
    </Fragment>
  );
}
/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

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
  // maxWidth: 380,
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

export const InputContainer = styled("div")({
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

const ChipScrollBox = styled("div")({
  overflowX: `auto`,
  whiteSpace: "nowrap",
  "&::-webkit-scrollbar": { display: "none" },
});

const FilterChipOLD = styled(Chip)({
  color: "blue",
});

// function FilterChip(props) {
//   const classes = useStyles(props);
//   return <Chip className={classes.root} {...props} />;
// }

const FilterChip = styled(({ selected, ...other }) => <Chip {...other} />)({
  color: (props) =>
    props.selected === true ? props.theme.palette.primary.light : "black",
  marginRight: 6,
  marginBottom: 3,
});
