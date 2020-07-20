import React from "react";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  // maybe apply mobile styles here
  tooltip: {
    fontSize: 14
  }
});

export default function InfoTooltip({ message, ...other }) {
  const classes = useStyles();
  // const [anchorEl, setAnchorEl] = React.useState(null);

  // const handleClick = event => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };
  // const handleOptionClickCurry = value => event => {
  //   // call the onChange item here
  //   onChange(event, value);
  //   handleClose();
  // };

  return (
    <Tooltip
      title={message}
      style={{ marginLeft: 8 }}
      classes={classes}
      placement="top"
      {...other}
    >
      <InfoOutlinedIcon fontSize="small" />
    </Tooltip>
  );
}
