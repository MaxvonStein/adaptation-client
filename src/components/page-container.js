import React, { Fragment } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useTheme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
  PageContainer: {
    width: "100%",
    maxWidth: 960,
    margin: "0 auto",
    padding: theme.spacing(1) * 1.5,
  },
}));

export default function PageContainer(props) {
  const classes = useStyles();
  return (
    <Fragment>
      {/* <Bar /> */}
      <Box className={classes.PageContainer}>{props.children}</Box>
    </Fragment>
  );
}

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

// const Bar = styled("div")({
//   flexShrink: 0,
//   height: 12,
//   backgroundColor: colors.primary,
// });

// const Container = styled("div")({
//   // display: "flex",
//   // flexDirection: "column",
//   // flexGrow: 1,
//   width: "100%",
//   maxWidth: 960,
//   margin: "0 auto",
//   padding: theme.spacing(2),
//   paddingBottom: unit * 5,
// });
