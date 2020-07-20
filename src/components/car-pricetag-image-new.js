import React, { Component } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import defaultImage from "../assets/images/space.jpg";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  aspectBoxContainer: {
    paddingTop: 12,
    paddingRight: 18,
  },
  aspectBox: {
    width: "100%",
    height: 0,
    overflow: "hidden",
    paddingTop: "75%",
    position: "relative",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    top: "50%",
    transform: "translateY(-50%)",
    position: "absolute",
    left: 0,
  },
  carPricetagContainer: { position: "relative" },
  priceTag: {
    top: 0,
    right: 0,
    width: 48,
    height: 48,
    textAlign: "center",
    backgroundColor: theme.palette.primary.light,
    borderRadius: "50%",
    position: "absolute",
  },
  priceContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  hasSubheading: {
    height: "unset",
    // bigger margins help make up for the small lineHeight
    marginTop: 6,
    // marginBottom: 2
  },
  // small lineHeight creates the right effect on the
  price: { display: "inline", fontSize: 22, color: "#fff", lineHeight: "0.9" },
  priceSuperscript: { fontSize: 13, verticalAlign: "top" },
  subheading: {
    color: "#fff",
  },
}));

export default function CarPricetagImage({ car, price, subheading }) {
  const classes = useStyles();
  // const addressString =
  //   "../assets/images/cars/" +
  //   car.make.replace(" ", "-").toLowerCase() +
  //   "-" +
  //   car.model.replace(" ", "-").toLowerCase() +
  //   "-" +
  //   car.vin.slice(8, 16).toLowerCase() +
  //   "/image-0.jpg";
  const carDirectory = `${car.make
    .replace(" ", "-")
    .toLowerCase()}-${car.model
    .replace(" ", "-")
    .toLowerCase()}-${car.vin.slice(9, 17).toLowerCase()}`;
  const fileName = carDirectory + "-lead";
  let leadImage = "";
  try {
    leadImage = require("../assets/images/cars/" + fileName + ".jpg");
  } catch (error) {
    leadImage = defaultImage;
  }

  const addDefaultSrc = (e) => {
    e.target.src = { defaultImage };
    e.target.onerror = null;
  };

  return (
    <Box className={classes.carPricetagContainer}>
      <Box className={classes.priceTag}></Box>
      <Box className={classes.aspectBoxContainer}>
        <Box className={classes.aspectBox}>
          <Box className={classes.imageContainer}>
            <img
              onError={addDefaultSrc}
              src={leadImage}
              className={classes.image}
              alt={car.model}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.priceTag}>
        <Box
          className={`${classes.priceContainer} ${
            !!subheading && classes.hasSubheading
          }`}
        >
          <Typography variant="h6" className={classes.price}>
            {<span className={classes.priceSuperscript}>$</span>}
            {price.replace("$", "")}
          </Typography>
        </Box>
        {subheading && (
          <Typography variant="caption text" className={classes.subheading}>
            {subheading}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
