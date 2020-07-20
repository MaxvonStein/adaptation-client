import React, { Component, Fragment } from "react";
import GoogleMapReact from "google-map-react";
import { priceFormat } from "../number-formats";
import { makeStyles } from "@material-ui/core/styles";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import FiberManualRecordTwoToneIcon from "@material-ui/icons/FiberManualRecordTwoTone";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import LocationOnOutlinedIcon from "@material-ui/icons/LocationOnOutlined";
import LocationOnTwoToneIcon from "@material-ui/icons/LocationOnTwoTone";
import { green, yellow, orange, red, blue } from "@material-ui/core/colors";
import LocationDotIcon from "../assets/icons/LocationDotIcon";
import OpenLocationDotIcon from "../assets/icons/OpenLocationDotIcon";

const markerStyle = {
  // position marker so bottom center places on the coordinate, source: https://github.com/google-map-react/google-map-react/issues/523
  // fix this with new dot icon
  position: "absolute",
  top: "100%",
  left: "50%",
  transform: "translate(-50%, -100%)",
  cursor: "pointer",
};

const mediumGreen = green[400];
const lightGreen = green[200];
const mediumYellow = yellow[400];
const mediumOrange = orange[400];
const mediumRed = red[400];

const useStyles = makeStyles({
  // locationsMap: {
  //   height: "100%",
  //   width: "100%",
  //   position: "fixed",
  //   top: 0,
  //   left: 0,
  //   zIndex: 1,
  // },
  root: {
    minWidth: 125,
  },
  callout: {
    fontWeight: 700,
    fontSize: 15,
  },
  locationFlag: {
    position: "absolute",
    zIndex: 1,
    transform: "translateY(-100%) translateY(-5px) translateX(5px)",
    minWidth: 112,
    cursor: "pointer",
  },
  locationFlagContent: {
    padding: "5px 8px !important",
  },
  marker: {
    position: "absolute",
    // top: "100%",
    // left: "50%",
    transform: "translate(-50%, -50%)",
    cursor: "pointer",
  },
  checkedMarker: {
    fontSize: "3rem",
  },
  none: { display: "none" },
  controlCard: {
    position: "absolute",
    zIndex: 1,
    margin: 10,
    top: 0,
    left: 0,
    minWidth: 300,
  },
  blue: {
    color: blue[800],
  },
  greenCheckbox: {
    "&.Mui-checked": {
      color: mediumGreen,
    },
  },
  lightGreenCheckbox: {
    "&.Mui-checked": {
      color: lightGreen,
    },
  },
  yellowCheckbox: {
    "&.Mui-checked": {
      color: mediumYellow,
    },
  },
  orangeCheckbox: {
    "&.Mui-checked": {
      color: mediumOrange,
    },
  },
  redCheckbox: {
    "&.Mui-checked": {
      color: mediumRed,
    },
  },
  greenDot: {
    color: "white",
    "& #inner": {
      color: mediumGreen,
    },
  },
  lightGreenDot: {
    color: "white",
    "& #inner": {
      color: lightGreen,
    },
  },
  yellowDot: {
    color: "white",
    "& #inner": {
      color: mediumYellow,
    },
  },
  orangeDot: {
    color: "white",
    "& #inner": {
      color: mediumOrange,
    },
  },
  redDot: {
    color: "white",
    "& #inner": {
      color: mediumRed,
    },
  },
});

const PriceControlCard = ({
  showDots,
  showLabels,
  onDotChange,
  onLabelChange,
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.controlCard} elevation={4}>
      <CardContent>
        <FormLabel>Markers</FormLabel>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDots.includes(0)}
                onChange={onDotChange}
                className={classes.greenCheckbox}
                value={0}
              ></Checkbox>
            }
            label="free"
          ></FormControlLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDots.includes(50)}
                onChange={onDotChange}
                className={classes.lightGreenCheckbox}
                value={50}
              ></Checkbox>
            }
            label="$50"
          ></FormControlLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDots.includes(200)}
                onChange={onDotChange}
                className={classes.yellowCheckbox}
                value={200}
              ></Checkbox>
            }
            label="$200"
          ></FormControlLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDots.includes(350)}
                onChange={onDotChange}
                className={classes.orangeCheckbox}
                value={350}
              ></Checkbox>
            }
            label="$350"
          ></FormControlLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDots.includes(450)}
                onChange={onDotChange}
                className={classes.redCheckbox}
                value={450}
              ></Checkbox>
            }
            label="$450+"
          ></FormControlLabel>
        </FormGroup>
        <FormGroup>
          <FormLabel>Labels</FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={showLabels}
                onChange={onLabelChange}
                className={classes.greenCheckbox}
              ></Checkbox>
            }
            label="free"
          ></FormControlLabel>
        </FormGroup>
      </CardContent>
    </Card>
  );
};

const BasicLocationMarker = ({
  lat,
  lng,
  description,
  netTransportFee,
  checked,
  // why is this here?
  // $hover,
  visible = true,
}) => {
  const classes = useStyles();
  // this isn't going to work for fees between these steps, $250 for example
  const colorClass =
    netTransportFee === 0
      ? classes.greenDot
      : netTransportFee === 50
      ? classes.lightGreenDot
      : netTransportFee === 200
      ? classes.yellowDot
      : netTransportFee === 350
      ? classes.orangeDot
      : classes.redDot;
  return (
    // mess with an OpenDotIcon later
    <LocationDotIcon
      fontSize="large"
      className={
        !visible && !checked
          ? classes.none
          : `${classes.marker} ${colorClass} ${
              checked ? classes.checkedMarker : undefined
            }`
      }
    />
  );
};

const CardLocationFlag = ({
  description,
  transportFee,
  checked,
  onClick,
  visible = true,
}) => {
  const classes = useStyles();
  return (
    <Card
      className={visible || checked ? classes.locationFlag : classes.none}
      elevation={0}
      onClick={onClick}
    >
      <CardContent className={classes.locationFlagContent}>
        {description && (
          <Typography
            variant="body2"
            className={checked ? classes.callout + " " + classes.blue : null}
          >
            {description.substring(0, description.indexOf(","))}
          </Typography>
        )}
        <Typography
          variant="body2"
          className={classes.callout}
          color="textSecondary"
        >
          {transportFee === 0 ? "Free" : priceFormat(transportFee)}
        </Typography>
      </CardContent>
    </Card>
  );
};

const CardLocationMarker = ({
  lat,
  lng,
  description,
  transportFee,
  checked,
  $hover,
}) => {
  const classes = useStyles();
  return (
    <Fragment>
      {checked ? (
        <LocationOnIcon
          style={{ ...markerStyle, color: "blue" }}
          fontSize="large"
        />
      ) : $hover ? (
        <LocationOnTwoToneIcon
          style={{ ...markerStyle, color: "rgba(121, 121, 121, 1)" }}
          fontSize="large"
        />
      ) : (
        <LocationOnOutlinedIcon
          style={{ ...markerStyle, color: "rgba(121, 121, 121, 1)" }}
          fontSize="large"
        />
      )}
      <Card className={classes.root} variant="outlined">
        <CardContent>
          {description && (
            <Typography variant="body2">
              {description.substring(0, description.indexOf(","))}
            </Typography>
          )}
          <Typography
            variant="body2"
            className={classes.callout}
            color="textSecondary"
          >
            {transportFee === 0 ? "Free" : priceFormat(transportFee)}
          </Typography>
          {/* <span
          style={{
            fontSize: 14,
            position: "absolute",
            bottom: "50%",
            transform: "translate(0,-50%)",
            left: 12
          }}
        >
          {transportFee === 0 ? "Free" : priceFormat(transportFee)}
        </span> */}
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default function LocationsMap({
  customerLatitude,
  customerLongitude,
  locations,
  value,
  mapType,
  multiple,
  onMarkerClick,
  carLocations = [],
  customerCoordinates,
  boxClasses,
}) {
  const classes = useStyles();
  // referenced from
  const [showDots, setShowDots] = React.useState([0, 50, 200, 350, 450]);
  const [showLabels, setShowLabels] = React.useState(true);

  const handleDotChange = (event) => {
    const value = parseInt(event.target.value);
    setShowDots(
      event.target.checked
        ? [...showDots, value]
        : showDots.filter((fee) => fee !== value)
    );
    if (value === 0 && !event.target.checked) {
      setShowLabels(false);
    }
  };

  const showLocations = Object.values(locations).filter(
    (location) =>
      // may need to limit the includes(location.description) logic - otherwise we're doing pickups in Las Vegas for free
      showDots.includes(location.transportFee) ||
      (showDots.includes(450) && location.transportFee >= 450) ||
      (showDots.includes(0) && carLocations.includes(location.description))
  );

  const locationsNet = Object.values(locations).map((location) => ({
    ...location,
    netTransportFee: carLocations.includes(location.description)
      ? 0
      : location.transportFee,
  }));

  const showLocationsNet = Object.values(locations)
    .map((location) => ({
      ...location,
      netTransportFee: carLocations.includes(location.description)
        ? 0
        : location.transportFee,
    }))
    .filter(
      (location) =>
        // may need to limit the includes(location.description) logic - otherwise we're doing pickups in Las Vegas for free
        showDots.includes(location.netTransportFee) ||
        (showDots.includes(450) && location.netTransportFee >= 450)
    );

  const showLocationsFree = showLocationsNet.filter(
    (location) => location.netTransportFee === 0
  );

  console.log(value);

  return (
    <Box className={boxClasses} style={{ position: "relative" }}>
      {/* // Important! Always set the container height explicitly */}
      <PriceControlCard
        showDots={showDots}
        showLabels={showLabels}
        onDotChange={handleDotChange}
        onLabelChange={(event) => setShowLabels(event.target.checked)}
      />
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
        defaultCenter={{
          // using West Nyack as the center was preventing clicks to that marker from working
          lat: locations["West Nyack, NY"].latitude + 0.002,
          lng: locations["West Nyack, NY"].longitude + 0.002,
        }}
        defaultZoom={8}
        onChildClick={onMarkerClick}
      >
        {/* {customerCoordinates && (
          <MyLocationIcon
            lat={customerCoordinates.lat}
            lng={customerCoordinates.lng}
          />
        )} */}
        {locationsNet.map((location, index) => {
          return (
            <BasicLocationMarker
              // consider using lat and lng for locations and everything else to simplify
              lat={location.latitude}
              lng={location.longitude}
              description={location.description}
              checked={
                multiple
                  ? value.includes(location.description)
                  : value === location.description
              }
              visible={showDots.includes(location.netTransportFee)}
              netTransportFee={location.netTransportFee}
              key={index}
            />
          );
        })}
        {/* making CardLocationFlag independant helps with positioning and allows for keys as apposed to conditionally rendering two different sets of components */}
        {/* also the big thing is the clicks work */}
        {/* might be faster to make the free locatoins a constant */}
        {[
          ...showLocationsNet.filter((location) =>
            mapType === "pickupLocationsMap"
              ? value.includes(location.description)
              : value === location.description
          ),
          ...showLocationsFree,
        ].map((location, index) => (
          <CardLocationFlag
            lat={location.latitude}
            lng={location.longitude}
            description={location.description}
            transportFee={location.transportFee}
            checked={
              multiple
                ? value.includes(location.description)
                : value === location.description
            }
            visible={showLabels}
            key={`f${index}`}
          />
        ))}
      </GoogleMapReact>
    </Box>
  );
}
