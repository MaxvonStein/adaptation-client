import React from "react";
import Slider from "@material-ui/core/Slider";

import { MAXPRICE } from "../constants";

const ksLabelFormat = index => {
  return `$${index / 1000}k`;
};

export default function PriceSlider({
  attributeName,
  attributeValue,
  onChange,
  thousands
}) {
  return (
    <Slider
      min={0}
      max={MAXPRICE}
      defaultValue={MAXPRICE}
      step={1000}
      valueLabelFormat={thousands && ksLabelFormat}
      aria-label="Price"
      name={attributeName}
      valueLabelDisplay="auto"
      onChangeCommitted={onChange}
    />
  );
}
