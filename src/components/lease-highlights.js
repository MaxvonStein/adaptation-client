import React, { Fragment } from "react";
import { Link } from "@reach/router";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Collapse from "@material-ui/core/Collapse";
// import Link from "@material-ui/core/Link";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import Grey from "@material-ui/core/colors/grey";
import { priceFormat } from "../number-formats";
import { Typography, IconButton } from "@material-ui/core";
import format from "date-fns/format";
import add from "date-fns/add";
import { dateFormat, periodEndDate } from "../dates";
import InfoTooltip from "./info-tooltip";

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: "100%",
  },
  avatarBox: {
    width: 52,
    height: 52,
    overflow: "hidden",
  },
  highlightsContainer: {
    display: "flex",
    marginBottom: 16,
  },
  detailsBox: { flexGrow: 1, paddingLeft: 10 },
  detailsHeading: { fontWeight: 500, fontSize: "0.75rem", color: Grey[700] },
  detailsContent: { fontSize: "0.75rem", color: Grey[800] },
}));

export default function LeaseHighlights({ lease }) {
  const classes = useStyles();
  const grandTotal =
    lease.insuranceMonthly * lease.customerLeaseMonths + lease.leaseTotal;
  const firstMonthTotal =
    lease.leaseFirst + lease.firstMonthSalesTax + lease.firstMonthRentalTax;

  return (
    <Box className={classes.highlightsContainer}>
      <Box className={classes.avatarBox}>
        <img
          className={classes.avatar}
          src="https://skips-virginia.s3.amazonaws.com/insurance-Scan0001.jpg"
        />
      </Box>
      <Box className={classes.detailsBox}>
        <Typography className={classes.detailsHeading}>
          {lease.yearMakeModel}
        </Typography>
        <Typography className={classes.detailsContent}>
          {`Pickup ${dateFormat(lease.customerPickupDate)}
              `}
        </Typography>
        {/* <InfoTooltip message="Credit history is one factor insurance companies use to determine premiums." /> */}
        {/* <Typography></Typography> */}
        <Typography className={classes.detailsContent}>
          {`${priceFormat(grandTotal, true)} total for ${
            lease.customerLeaseMonths
          } months`}
        </Typography>
        {/* add note about accuracy */}
      </Box>
    </Box>
  );
}
