import React from "react";
import SvgIcon from "@material-ui/core/SvgIcon";

function LocationDotIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        id="inner"
        d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"
      />
      <path d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z" />
    </SvgIcon>
  );
}

export default LocationDotIcon;
