import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { priceFormat } from "../number-formats";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import MapIcon from "@material-ui/icons/Map";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import { flexbox, flex, flexGrow } from "@material-ui/system";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import { coordinates, transportCosts, locations } from "../constants";
import { getDistances } from "../distances";
import styled from "styled-components";

const useStyles = makeStyles((theme) => ({
  autocompleteClosest: {
    // don't need these styles with the smaller chip tags and with them padded to have the same height as text
    // "& .MuiInputBase-root": {
    //   minHeight: 39,
    // },
    // "& .MuiInputLabel-formControl": {
    //   transform: "translate(0, 32px) scale(1)",
    // },
    // "& .MuiInputLabel-shrink": {
    //   transform: "translate(0, 9.5px) scale(0.75)",
    // },
    "& .MuiAutocomplete-endAdornment": {
      bottom: 6,
      top: "unset",
    },
  },
  ".MuiAutocomplete-option[aria-selected='true']": {
    backgroundColor: theme.palette.background.default,
  },
  autocompleteClosestMultiple: {
    // "& .MuiInputLabel-shrink": {
    //   transform: "translate(0, 1.5px) scale(0.75)",
    // },
    "& .MuiAutocomplete-tag": {
      marginBottom: 4,
    },
    // don't need to pad out the close icon - makes this input more compact, allows for more than one chip tag per row
    // maybe there's a way to float this instead
    "& .MuiInputBase-adornedEnd.MuiAutocomplete-inputRoot": {
      paddingRight: 30,
    },
  },
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  iconLink: {
    color: theme.palette.primary.main,
  },
  chipScrollBox: {
    overflowX: `auto`,
    whiteSpace: "nowrap",
    "&::-webkit-scrollbar": { display: "none" },
  },
  popupOptionContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  popupOptionIconBox: {
    flexShrink: 0,
    lineHeight: 1,
  },
  popupOptionLabelBox: {
    flex: "1 1 auto",
  },
  popupOptionCheckboxBox: {
    flexShrink: 0,
  },
}));

// how about just using Math.min here
const lowestTransportFee = Object.values(locations)
  .filter((location) => location.description !== "West Nyack, NY")
  .reduce((accumulator, currentValue) =>
    accumulator.transportFee < currentValue.transportFee
      ? accumulator
      : currentValue
  ).transportFee;

const lowestDropoffLocations = Object.values(locations)
  .filter((object) => object.transportFee === lowestTransportFee)
  .sort((a, b) => a.description.localeCompare(b.description));

const mapOption = {
  link: "Choose on map",
  linkType: "map",
  description: "map",
};

const defaultDropoffOptions = [
  mapOption,
  { heading: "Low cost return locations" },
  locations["West Nyack, NY"],
  ...lowestDropoffLocations.slice(0, 4),
  ...lowestDropoffLocations.slice(5).map((option) => {
    option.more = true;
    return option;
  }),
  {
    link: "Show more low cost locations",
    linkType: "showMore",
    description: "showMore",
  },
];

const autocompleteService = { current: null };

const geocoderService = { current: null };

// pickup locations without a transport fee

export default function PlacesAutocompleteClosest({
  initialInputValue,
  locationValue,
  inputValue,
  // initialLocationValue,
  onChange,
  onInputChange,
  onUseMapClick,
  filterOptions,
  multiple,
  inputLabel,
  inputPlaceholder,
  carLocations = [],
  inputType,
  writeCustomerCoordinates,
  autocompleteClassName,
  ...other
}) {
  const classes = useStyles();
  // text in the textfield
  // this isn't updating wiht map changes, moving this state to the quote-location-form and passing it here, going to need to do that for multiple too
  // const [inputValue, setInputValue] = React.useState(initialInputValue || "");

  const [inputChoice, setInputChoice] = React.useState(initialInputValue || "");
  // add the initial defaults in later
  // const [locationValue, setLocationValue] = React.useState(
  //   initialLocationValue ? initialLocationValue : multiple ? [] : ""
  // );
  const [isShowMore, setIsShowMore] = React.useState(false);
  const [options, setOptions] = React.useState(
    inputType === "customerPickupLocations" ? [] : defaultDropoffOptions
  );

  // cross the Northeast pickup locations with the locations of the cars
  // figure out how to limit carLocations to Northeast only or maybe locations where the
  const defaultPickupLocations = [
    mapOption,
    { heading: "Low cost pickup locations" },
    locations["West Nyack, NY"],
    ...carLocations
      .map((carLocation) => locations[carLocation])
      .filter((location) => location.transportFee < 251),
    ...lowestDropoffLocations,
    { link: "Show more low cost locations", linkType: "showMore" },
  ];

  const fetch = React.useMemo(
    () =>
      throttle(
        (request, callback) => {
          autocompleteService.current.getPlacePredictions(request, callback);
        },
        400,
        { leading: true }
      ),
    []
  );

  React.useEffect(() => {
    // react hook -

    // component is actively searching
    let active = true;

    // initiate the services if they're not already set up
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (!geocoderService.current && window.google) {
      geocoderService.current = new window.google.maps.Geocoder();
    }
    if (!geocoderService.current) {
      return undefined;
    }

    // if (inputValue === "") {
    // showing "No options" until there's at least three characters
    if (inputValue.length < 3) {
      setOptions(
        inputType === "customerPickupLocations"
          ? defaultPickupLocations
          : defaultDropoffOptions
      );
      return undefined;
    }

    console.log("inputValue");
    console.log(inputValue);
    console.log("locationValue");
    console.log(locationValue);

    if (inputValue === inputChoice) {
      // this isn't working because locationValue isn't catching up fast enough, keep a state value for locationValue alongside the prop
      // used to have a pickupText field on data which would have delayed the if statement here and maybe allowed for an explicit set on option onClick?
      // we selected an option
      // setOptions([]);
      return undefined;
      // this seems to be working, add setOptions to clear the options menu?
    }

    if (
      options[1].description &&
      options[1].description.toLowerCase().startsWith(inputValue.toLowerCase())
    ) {
      // the new inputValue matches the first closestLocation suggestion in options - user is typing the name of that location
      // just alter the length of the matched substrings, short circuit the fetch
      const newOptions = options;
      newOptions[1].structured_formatting.main_text_matched_substrings[0].length =
        inputValue.length;

      setOptions(newOptions);
      return undefined;
    }

    console.log(options);

    // might think about using the customer's city field or state field if it's present and loading up pickup locations near that territory

    // the "effect" function to be run, fetch results from google getPlacePredictions service
    fetch(
      {
        input: inputValue,
        componentRestrictions: { country: "us" },
        // specifying a type heads off the multiple returns for e.g. Edgewater, Edgewater Train Station.. but you can't search for a car near a place you're not familiar with, say near your kid's school
        types: ["geocode"],
      },
      (results) => {
        // fetch callback, maybe run getDetails here
        if (results && results.length !== 0) {
          geocoderService.current.geocode(
            { placeId: results[0].place_id },
            async (geocodeResults, geocoderStatus) => {
              const firstGeometry = await geocodeResults[0].geometry.location;
              if (inputType === "customerPickupLocations") {
                writeCustomerCoordinates(
                  firstGeometry.lat(),
                  firstGeometry.lng()
                );
              }
              const closestLocations = await getDistances(
                firstGeometry.lat(),
                firstGeometry.lng()
              );
              let options = results;
              // present the map option
              options.unshift(mapOption);
              options.splice(
                2,
                0,
                {
                  ...closestLocations[0],
                },
                {
                  ...closestLocations[1],
                },
                {
                  ...closestLocations[2],
                }
              );
              // remove if (active)
              // ^ why?  so the options update as the user types?
              setOptions(options || []);
            }
          );
        }
      }
    );

    return () => {
      active = false;
    };
    // only rerun the effect when inputValue or fetch changes
  }, [inputValue, fetch]);

  // moved to parent
  // const handleInputChange = (event, value, reason) => {
  //   // fired when textinput changes
  //   if (reason === "clear") {
  //     // clear inputValue if the "x" is clicked
  //     setInputValue("");
  //     return;
  //   }
  //   if (reason === "reset") return;

  //   setInputValue(event.target.value);
  // };

  const handleAutocompleteChange = (event, value, reason) => {
    // fired when autocomplete changes - selection
    // is it safe to return early on the pickupLocations field?
    if (reason === "clear" || value === null) {
      return;
    }
    if (multiple) {
      const valueDescriptions = value.map((option) => option.description);
      // change these names - more generic
      let selectedLocations = [];
      // handle unclick
      valueDescriptions.map((string) => {
        const index = selectedLocations.indexOf(string);
        if (index > -1) {
          selectedLocations.splice(index, 1);
        } else {
          selectedLocations.push(string);
        }
      });
      onChange(selectedLocations);
    } else {
      const selectedLocation = value.description;
      // move this responsibility to parent
      // setInputValue(selectedLocation);
      setInputChoice(selectedLocation);
      onChange(selectedLocation);
    }
  };

  console.log("inputValue");
  console.log(inputValue);

  return (
    <Autocomplete
      inputValue={inputValue}
      // text in the textfield
      value={
        multiple
          ? locationValue.map((location) => {
              return {
                description: location,
              };
            })
          : { description: locationValue }
      }
      // values selected, create objects with description
      className={
        (multiple
          ? `${classes.autocompleteClosest} ${classes.autocompleteClosestMultiple}`
          : classes.autocompleteClosest) +
        " " +
        autocompleteClassName
      }
      multiple={multiple}
      disableCloseOnSelect={multiple}
      getOptionLabel={(option) => {
        return option.description;
      }}
      getOptionDisabled={(option) =>
        !Object.keys(locations).includes(option.description) && !option.link
      }
      getOptionSelected={(option, value) => {
        if (option.linkType === "showMore") return false;
        return option.description === value.description;
      }}
      filterOptions={(options) =>
        // determines which options show up
        options.filter((option) => {
          if (option.linkType === "showMore" && isShowMore) return false;
          // this isn't removing the link option, maybe showMore should be an attribute controlled by a data field
          if (!option.more || isShowMore) return true;
          if (option.linkType === "map") return true;
          return false;
        })
      }
      options={options}
      // autoHighlight={false}
      includeInputInList
      disableOpenOnFocus
      onChange={handleAutocompleteChange}
      // fired when autocomplete value changes, e.g. on select
      onInputChange={onInputChange}
      // fired when textinput value changes - event, value, reason
      renderInput={(params) => (
        <Box>
          <TextField
            {...params}
            label={inputLabel}
            // variant="outlined"
            fullWidth
            placeholder={inputPlaceholder}
          />
        </Box>
      )}
      renderOption={(option) => {
        if (option.heading) {
          //  do typogrophy or something here to fix this
          return (
            <Box value={option.description}>
              <Typography variant="body2">{option.heading}</Typography>
            </Box>
          );
        } else if (option.structured_formatting) {
          const matches =
            option.structured_formatting.main_text_matched_substrings;
          const parts = parse(
            option.structured_formatting.main_text,
            matches.map((match) => [match.offset, match.offset + match.length])
          );
          return (
            <Box value={option.description}>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{ fontWeight: part.highlight ? 700 : 400 }}
                >
                  {part.text}
                </span>
              ))}

              <Typography variant="body2" color="textSecondary">
                {/* some options will have the structured_formatting, some won't */}
                {option.structured_formatting.secondary_text.replace(
                  ", USA",
                  ""
                )}
              </Typography>
            </Box>
          );
        } else if (option.linkType === "showMore") {
          return (
            <Box>
              <Link
                href="#"
                // how to resond to clicks on the whole list item?  or shrink the list item around the link text.
                // this doesn't seem to work
                onClick={(event) => {
                  // does this prevent a page refresh
                  event.preventDefault();
                  setIsShowMore(true);
                }}
                variant="body2"
                underline="none"
                linktype={option.linkType}
              >
                {option.link}
              </Link>
            </Box>
          );
        } else if (option.linkType === "map") {
          return (
            <Box className={classes.popupOptionContainer}>
              <Box className={classes.popupOptionIconBox}>
                <MapIcon
                  className={`${classes.icon} ${classes.iconLink}`}
                  fontSize="small"
                  onClick={onUseMapClick}
                />
              </Box>
              <Box className={classes.popupOptionLabelBox}>
                <Link
                  href="#"
                  // this doesn't seem to work
                  onClick={onUseMapClick}
                  variant="body2"
                  underline="none"
                  linktype={option.linkType}
                >
                  {option.link}
                </Link>
              </Box>
            </Box>
          );
        } else if (!option.more || !!isShowMore) {
          // option.more is true on the showMore options - after the first five
          // this block is returned for the first five AND for the showMore options when isShowMore is true
          return (
            <Box className={classes.popupOptionContainer}>
              <Box className={classes.popupOptionIconBox}>
                <DriveEtaIcon className={classes.icon} fontSize="small" />
              </Box>
              <Box className={classes.popupOptionLabelBox}>
                <Typography variant="body1">{option.description}</Typography>
                {option.crowDistance > 0 && (
                  <Typography variant="body2" color="textSecondary">
                    {/* some options will have the structured_formatting, some won't */}
                    {option.crowDistance} mi
                  </Typography>
                )}
                {(!!option.transportFee || option.transportFee === 0) && (
                  // transportFee isn't undefined, 0 ok
                  <Typography variant="body2" color="textSecondary">
                    {/* some options will have the structured_formatting, some won't */}
                    {inputType === "customerDropoffLocation" ||
                    (option.transportFee > 0 &&
                      carLocations &&
                      !carLocations.includes(option.description))
                      ? // carLocations isn't undefined and it doesn't include the option or we're on the dropoff input
                        priceFormat(option.transportFee) + " transfer"
                      : "Free"}
                  </Typography>
                )}
              </Box>
              {multiple && (
                <Box className={classes.popupOptionCheckboxBox}>
                  <Checkbox
                    checked={locationValue.includes(option.description)}
                  />
                </Box>
              )}
            </Box>
          );
        }
      }}
      renderTags={(value, getCustomizedTagProps) => {
        return value.map((option, index) => (
          <Chip
            {...getCustomizedTagProps({ index })}
            size="small"
            label={option.description}
            value={option.description}
          />
        ));
      }}
      {...other}
    />
  );
}
