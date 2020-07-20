import React from "react";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Box from "@material-ui/core/Box";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { IconButton } from "@material-ui/core";

export default function IconMenu({ onChange, options, icon, ...other }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleOptionClickCurry = (value) => (event) => {
    // call the onChange item here
    onChange(event, value);
    handleClose();
  };

  return (
    <Box {...other}>
      <IconButton onClick={handleClick}>{icon}</IconButton>
      {/* <Button
        aria-controls="icon-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        Open Menu
      </Button> */}
      <Menu
        id="icon-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <MenuItem key={index} onClick={handleOptionClickCurry(option.value)}>
            {option.icon && <ListItemIcon>{option.icon}</ListItemIcon>}
            {option.name}
          </MenuItem>
        ))}
        {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem> */}
      </Menu>
    </Box>
  );
}
