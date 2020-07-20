import React from "react";
import { unit } from "../styles";
import { cardClassName } from "./launch-tile";
import Box from "@material-ui/core/Box";
import DateRangeIcon from "@material-ui/icons/DateRange";
import format from "date-fns/format";
import Typography from "@material-ui/core/Typography";
import { dateFormat } from "../dates";

const DateDetail = ({ pickupDate, dropoffDate, customerLeaseMonths }) => {
  return (
    <Box>
      <DateRangeIcon />
      <Typography>Pickup {dateFormat(pickupDate)}</Typography>
      <Typography>Return {dateFormat(dropoffDate)}</Typography>
      <Typography>
        {Math.floor(customerLeaseMonths) +
          " months " +
          (customerLeaseMonths % 1 !== 0
            ? parseInt((customerLeaseMonths % 1) * 30) + " days"
            : "")}
      </Typography>
    </Box>
  );
};

export default DateDetail;
