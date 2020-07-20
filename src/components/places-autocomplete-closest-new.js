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
import styled from "styled-components";

// let showMore = false;

// function loadScript(src, position, id) {
//   if (!position) {
//     return;
//   }

//   const script = document.createElement("script");
//   script.setAttribute("async", "");
//   script.setAttribute("id", id);
//   script.src = src;
//   position.appendChild(script);
// }

// sets the .MuiInputBase-root div height to match the height of a multiple autocomplete with chips inside
// the style tag added here renders with .kQuxFm div.Autocom... - why is this other class added, it's throwing off the selector
// may have to create classes within the Autocomplete component as suggested here: https://github.com/styled-components/styled-components/issues/1302
// or just add the styles some other way
// $ {(props) =>
//   props.multiple && "overflow-x: scroll; white-space: nowrap;"}
// $ {(props) =>
//   props.multiple && "&::-webkit-scrollbar: { display: none };"}
const StyledAutocomplete = styled(Autocomplete)`
  // .MuiInputBase-root {
  //   min-height: 39px;
  // }
  // both InputBase.. divs are taller so both have the non-shrunk label translated down more - to 32px
  // .MuiInputLabel-formControl {
  //   transform: translate(0, 32px) scale(1);
  // }
  // only the multiple label needs to translate all the way up once shrunk, the other is translating to a position 8px lower
  // .MuiInputLabel-shrink {
  //   transform: $ {(props) =>
  //     props.multiple
  //       ? "translate(0, 1.5px) scale(0.75)"
  //       : "translate(0, 9.5px) scale(0.75)"};
  // }
  // keep the inputAdornment absolute fixed to the border-bottom where you type - matches the default at 39px height
  // .MuiAutocomplete-endAdornment {
  //   bottom: 6px;
  //   top: unset;
  // }
  // // this isn't working for whatever reason
  // .MuiAutocomplete-option[aria-selected="true"] {
  //   background-color: unset !important;
  // }
`;

const useStyles = makeStyles((theme) => ({
  autocompleteClosest: {
    "& .MuiInputBase-root": {
      minHeight: 39,
    },
    "& .MuiInputLabel-formControl": {
      transform: "translate(0, 32px) scale(1)",
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(0, 9.5px) scale(0.75)",
    },
    "& .MuiAutocomplete-endAdornment": {
      bottom: 6,
      top: "unset",
    },
    "& .MuiAutocomplete-option[aria-selected='true']": {
      backgroundColor: "unset",
    },
  },
  ".MuiAutocomplete-option[aria-selected='true']": {
    backgroundColor: theme.palette.background.default,
  },
  autocompleteClosestMultiple: {
    "& .MuiInputLabel-shrink": {
      transform: "translate(0, 1.5px) scale(0.75)",
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

function haversineDistance(
  latitudeOne,
  longitudeOne,
  latitudeTwo,
  longitudeTwo
) {
  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 = latitudeOne * (Math.PI / 180); // Convert degrees to radians
  var rlat2 = latitudeTwo * (Math.PI / 180); // Convert degrees to radians
  var difflat = rlat2 - rlat1; // Radian difference (latitudes)
  var difflon = (longitudeOne - longitudeTwo) * (Math.PI / 180); // Radian difference (longitudes)

  var d =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2)
      )
    );

  return d;
}

const getDistances = (addressLatitude, addressLongitude) => {
  const sortedDistances = Object.keys(locations)
    .map((city) => {
      // is there a better way to map across all the values without having to make a second call to locations here
      const location = locations[city];
      const crowDistance = Math.round(
        haversineDistance(
          location.latitude,
          location.longitude,
          addressLatitude,
          addressLongitude
        )
      );
      return {
        description: city,
        crowDistance,
        transportFee: location.transportFee,
      };
    })
    .sort((a, b) => a.crowDistance - b.crowDistance);
  return sortedDistances;
};

// the 5 closest to homebase
// const homebaseDropoffOptions = getDistances(
//   locations["West Nyack, NY"].latitude,
//   locations["West Nyack, NY"].longitude
// ).slice(0, 5);

// the 5 least expensive dropoff locations sorted alphabetically

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

// const defaultDropoffOptions = [
//   { heading: "Low cost drop-off locations" },
//   locations["West Nyack, NY"],
//   ...lowestDropoffLocations
// ];

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
  // initialLocationValue,
  handleChange,
  // handleType,
  // handleInputChange,
  handleUseMapClick,
  filterOptions,
  multiple,
  inputLabel,
  inputPlaceholder,
  carLocations,
  inputType,
  writeCustomerCoordinates,
  autocompleteClassName,
  ...other
}) {
  const classes = useStyles();
  const theme = useTheme();
  // const [inputValue, setInputValue] = React.useState("");
  // text in the textfield
  const [inputValue, setInputValue] = React.useState(initialInputValue || "");
  const [inputChoice, setInputChoice] = React.useState(initialInputValue || "");
  // add the initial defaults in later
  // const [locationValue, setLocationValue] = React.useState(
  //   initialLocationValue ? initialLocationValue : multiple ? [] : ""
  // );
  const [isShowMore, setIsShowMore] = React.useState(false);
  const [options, setOptions] = React.useState(
    inputType === "customerPickupLocations" ? [] : defaultDropoffOptions
  );
  const loaded = React.useRef(false);

  // trouble getting this working, keep tag in index.html for now
  // if (typeof window !== "undefined" && !loaded.current) {
  //   // check for inputType - we only wnat to load this one time
  //   if (
  //     !document.querySelector("#google-maps") &&
  //     inputType === "pickupLocations"
  //   ) {
  //     loadScript(
  //       `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`,
  //       document.querySelector("head"),
  //       "google-maps"
  //     );
  //   }

  //   loaded.current = true;
  // }

  const handleType = (event) => {
    // this no longer applies once you set value because the component becomes controlled (?)
    setInputValue(event.target.value);
  };

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
      throttle((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 400),
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
        // don't set the options here, or maybe create a seperate list for clickable options or suboptions
        // if (active) {
        //   setOptions(results || []);
        // }
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

  const handleInputChange = (event, value, reason) => {
    // fired when textinput changes
    if (reason === "clear") {
      // client.writeData({ data: { pickupText: "" } });
      // clear inputValue if the "x" is clicked
      setInputValue("");
      return;
    }
    if (reason === "reset") return;

    setInputValue(event.target.value);
  };

  const handleAutocompleteChange = (event, value, reason) => {
    // fired when autocomplete changes - selection
    // debug
    // is it safe to return early on the pickupLocations field?
    if (reason === "clear" || value === null) {
      return;
    }
    let locations;
    if (multiple) {
      const valueStrings = value.map((option) => option.description);
      // change these names - more generic
      locations = [];
      valueStrings.map((string) => {
        const index = locations.indexOf(string);
        if (index > -1) {
          locations.splice(index, 1);
        } else {
          locations.push(string);
        }
      });
    } else {
      locations = value.description;
      setInputValue(locations);
      if (!multiple) {
        setInputChoice(locations);
      }
    }
    // setLocationValue(locations);
    // console.log("handleChange(locations)");
    // console.log(locations);
    handleChange(locations);
  };

  return (
    <StyledAutocomplete
      // inputValue={multiple ? inputValue : null}
      // open={true}
      // inputValue={
      //   inputValue === "" && locationValue === "West Nyack, NY"
      //     ? "West Nyack, NY"
      //     : inputValue
      // }
      // inputValue={
      //   inputValue === "" && locationValue === "West Nyack, NY"
      //     ? "West Nyack, NY"
      //     : inputValue
      // }
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
      // values selected
      className={
        multiple
          ? `${classes.autocompleteClosest} ${classes.autocompleteClosestMultiple}`
          : classes.autocompleteClosest + " " + autocompleteClassName
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
      onInputChange={handleInputChange}
      // fired when textinput value changes - event, value, reason
      renderInput={(params) => (
        // can we use a default value here?
        <Box>
          <TextField
            {...params}
            label={inputLabel}
            // variant="outlined"
            fullWidth
            // don't knwo if we need this
            // onChange={handleType}
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
            // <Grid container alignItems="center" value={option.description}>
            //   <Grid item xs>
            //     <span style={{ fontWeight: 400, fontSize: 14 }}>
            //       {option.heading}
            //     </span>
            //   </Grid>
            // </Grid>
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
                  onClick={handleUseMapClick}
                />
              </Box>
              <Box className={classes.popupOptionLabelBox}>
                <Link
                  href="#"
                  // this doesn't seem to work
                  onClick={handleUseMapClick}
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
                    {option.transportFee > 0 &&
                    // carLocations isn't undefined and it doesn't include the option
                    carLocations &&
                    !carLocations.includes(option.description)
                      ? priceFormat(option.transportFee) + " transfer"
                      : "Free"}
                  </Typography>
                )}
              </Box>
              {multiple && (
                <Box className={classes.popupOptionCheckboxBox}>
                  <Checkbox
                    // style={{ marginRight: 8 }}
                    checked={locationValue.includes(option.description)}
                  />
                </Box>
              )}
            </Box>
          );
          // return (
          //   <Grid container alignItems="center">
          //     <Grid item>
          //       <DriveEtaIcon className={classes.icon} />
          //     </Grid>
          //     <Grid item style={{ flexGrow: 1 }}>
          //       {option.description}
          //       {option.crowDistance > 0 && (
          //         <Typography variant="body2" color="textSecondary">
          //           {/* some options will have the structured_formatting, some won't */}
          //           {option.crowDistance} mi
          //         </Typography>
          //       )}
          //       {(!!option.transportFee || option.transportFee === 0) && (
          //         // transportFee isn't undefined, 0 ok
          //         <Typography variant="body2" color="textSecondary">
          //           {/* some options will have the structured_formatting, some won't */}
          //           {option.transportFee > 0 &&
          //           // carLocations isn't undefined and it doesn't include the option
          //           carLocations &&
          //           !carLocations.includes(option.description)
          //             ? priceFormat(option.transportFee) + " transfer"
          //             : "Free"}
          //         </Typography>
          //       )}
          //     </Grid>
          //     {multiple && (
          //       <Grid item>
          //         <Checkbox
          //           // style={{ marginRight: 8 }}
          //           checked={locationValue.includes(option.description)}
          //         />
          //       </Grid>
          //     )}
          //   </Grid>
          // );
        }
      }}
      renderTags={(value, getCustomizedTagProps) => {
        return (
          // <Box className={classes.chipScrollBox}>
          value.map((option, index) => (
            <Chip
              {...getCustomizedTagProps({ index })}
              // onDelete={}
              // variant="outlined"
              size="small"
              label={option.description}
              value={option.description}
            />
          ))
          // </Box>
        );
      }}
      {...other}
    />
  );
}
