import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import grey from "@material-ui/core/colors/grey";

const useStyles = makeStyles((theme) => ({
  headerBox: {
    paddingBottom: 8,
  },
  pageHeader: {
    fontWeight: 500,
    color: grey[700],
  },
}));

export default function PageHeader({ subheading, children }) {
  const classes = useStyles();
  return (
    <Box className={classes.headerBox}>
      <Typography variant="h4" className={classes.pageHeader}>
        {children}
      </Typography>
      {subheading && <Typography variant="subtitle1">{subheading}</Typography>}
    </Box>
  );
}
