import React from "react";
import { unit } from "../styles";
import { cardClassName } from "./launch-tile";
import Box from "@material-ui/core/Box";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import format from "date-fns/format";
import Typography from "@material-ui/core/Typography";
import { dateFormat } from "../dates";

const LocationDetail = ({ pickupLocation, dropoffLocation }) => {
  return (
    <Box>
      {/* how about a &$ kind of double locatoin paddle to indicate that the return is different */}
      <DriveEtaIcon />
      <Typography>Pickup in {pickupLocation}</Typography>
      <Typography>Return in {dropoffLocation}</Typography>
    </Box>
  );
};

export default LocationDetail;
