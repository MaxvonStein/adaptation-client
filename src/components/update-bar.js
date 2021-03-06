import React from "react";
import { navigate } from "@reach/router";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles({
  // maybe apply mobile styles here
  tooltip: {
    fontSize: 14,
  },
});

export default function UpdateBar({ pageName, onBackClick }) {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          onClick={!!onBackClick ? onBackClick : () => window.history.back()}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          S..
        </Typography>
        <Typography variant="h6" className={classes.title}>
          {pageName}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
