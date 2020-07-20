import React, { useState } from "react";
import { Link } from "@reach/router";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
// import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import Grey from "@material-ui/core/colors/grey";

const useStyles = makeStyles({
  navList: {
    "& li, & div": {
      display: "inline-block",
    },
  },
  iconBox: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  stepOther: {
    fontWeight: 400,
  },
  stepCurrent: {
    fontWeight: 500,
  },
  stepArrow: {
    color: Grey[600],
    fontSize: "0.75rem",
  },
  colorPrimary: {
    backgroundColor: "#fff",
    color: Grey[900],
  },
  title: {
    flexGrow: 1,
  },
  subtleLink: {
    textDecoration: "none",
  },
});

function MobileReserveStepper({ pageName }) {
  if (pageName === "driver") return <Typography>Step 1/2</Typography>;
  if (pageName === "reserve") return <Typography>Step 2/2</Typography>;
  return null;
}

function ReserveStepper({ pageName }) {
  const classes = useStyles();
  return (
    <nav>
      <ol className={classes.navList}>
        <li>
          {pageName === "driver" ? (
            <span className={classes.stepCurrent}>1. Driver details</span>
          ) : (
            <Link
              to="/reserve/driver"
              // component="span"
              className={`${classes.stepOther} ${classes.subtleLink}`}
            >
              1. Driver details
            </Link>
          )}
        </li>
        <li>
          <Box className={classes.iconBox}>
            <ArrowForwardIosIcon className={classes.stepArrow} />
          </Box>
          <span
            className={
              pageName === "confirm" ? classes.stepCurrent : classes.stepOther
            }
          >
            2. Confirm and reserve
          </span>
        </li>
      </ol>
    </nav>
  );
}

export default function ReserveBar({ pageName, ...other }) {
  const classes = useStyles();
  const theme = useTheme();

  const smallMedia = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar
      position="static"
      classes={{ colorPrimary: classes.colorPrimary }}
      elevation={0}
    >
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          S..
        </Typography>
        {smallMedia ? (
          <MobileReserveStepper pageName={pageName} />
        ) : (
          <ReserveStepper pageName={pageName} />
        )}
        {/* <Typography variant="h6" className={classes.title}>
          {pageName}
        </Typography> */}
      </Toolbar>
    </AppBar>
  );
}
