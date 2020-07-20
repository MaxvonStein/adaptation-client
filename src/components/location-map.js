import React, { Component, Fragment } from "react";
import styled, { css } from "react-emotion";
import { size } from "polished";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { colors, unit } from "../styles";
import space from "../assets/images/space.jpg";
import Box from "@material-ui/core/Box";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import {
  GET_CARS,
  GET_CARFORM,
  GET_CUSTOMER,
  GET_SORT_CARS,
  GET_CARS_CUSTOMER,
  GET_CARS_VIEW_CUSTOMER,
  GET_CARS_LEASETOTAL,
  GET_SORT
} from "../pages/cars";
import { ADD_OR_REMOVE_FILTERS_CARS, SORT_CARS } from "./cars-forms";
import PlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng
} from "react-places-autocomplete";
// import { typeDefs } from "../resolvers";
import { coordinates } from "../constants";

const GET_LOCATIONFORM = gql`
  query GetLocationForm {
    pickupText @client
    dropoffText @client
    firstSuggestionAddress @client
    closestLocationCity @client
    closestLocationDistance @client
    secondClosestCity @client
    secondClosestDistance @client
  }
`;

export default function LoactionMap() {
  const client = useApolloClient();

  const getDistances = (addressLatitude, addressLongitude) => {
    const sortedDistances = Object.keys(coordinates)
      .map(city => {
        const coordinateSet = coordinates[city];
        const distance = Math.round(
          haversineDistance(
            coordinateSet.latitude,
            coordinateSet.longitude,
            addressLatitude,
            addressLongitude
          )
        );
        return { city, distance };
      })
      .sort((a, b) => a.distance - b.distance);
    return sortedDistances;
  };

  const handleSelect = async address => {
    const results = await geocodeByAddress(address);
    const addressLatLng = await getLatLng(results[0]);
    console.log(addressLatLng);
    // loop over each location in coordinates
    const sortedDistances = getDistances(addressLatLng.lat, addressLatLng.lng);
    console.log(sortedDistances);
    client.writeQuery({
      query: GET_LOCATIONFORM,
      data: {
        closestLocationCity: sortedDistances[0].city,
        closestLocationDistance: Math.round(sortedDistances[0].distance),
        secondClosestCity: sortedDistances[1].city,
        secondClosestDistance: Math.round(sortedDistances[1].distance)
      }
    });
  };

  const handleChange = text => {
    client.writeData({ data: { pickupText: text } });
    // find the top suggestion and search for the pickup locations that are within 50 mi
  };

  // calculate distance between two coordinates, source: https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api
  // this may be overly complex for two points in the same region
  function haversineDistance(
    latitudeOne,
    longitudeOne,
    latitudeTwo,
    longitudeTwo
  ) {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = latitudeOne * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = latitudeTwo * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (longitudeOne - longitudeTwo) * (Math.PI / 180); // Radian difference (longitudes)

    var d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2)
        )
      );
    return d;
  }

  const { data, loading, error } = useQuery(GET_LOCATIONFORM);
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  return (
    <Container>
      <WhiteBox>
        <PlacesAutocomplete
          value={data.pickupText}
          onChange={handleChange}
          onSelect={handleSelect}
          searchOptions={{
            componentRestrictions: { country: "us" },
            types: ["geocode"]
          }}
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading: autocompleteLoading
          }) => (
            <div>
              <input {...getInputProps()}></input>
              if (autocompleteLoading) return <p>loading...</p>
              <BlackParagraph>
                suggestions ({suggestions.length}):
              </BlackParagraph>
              {suggestions.map((suggestion, i) => {
                //   would need async functions here to call getGeoCodeByAddress and getLatLng
                // }
                if (i === 0) {
                  const firstSuggestionAddress = suggestion.description;

                  client.writeData({
                    data: { firstSuggestionAddress }
                  });

                  geocodeByAddress(firstSuggestionAddress)
                    .then(results => getLatLng(results[0]))
                    .then(({ lat, lng }) => {
                      console.log("Successfully got latitude and longitude", {
                        lat,
                        lng
                      });
                      const firstSuggestionDistances = getDistances(lat, lng);
                      client.writeData({
                        data: {
                          closestLocationCity: firstSuggestionDistances[0].city,
                          closestLocationDistance:
                            firstSuggestionDistances[0].distance,
                          secondClosestCity: firstSuggestionDistances[1].city,
                          secondClosestDistance:
                            firstSuggestionDistances[1].distance
                        }
                      });
                    });
                  // const geoCode = geocodeByAddress(suggestion.description);

                  return (
                    <Fragment>
                      <div {...getSuggestionItemProps(suggestion)}>
                        <BlackParagraph>
                          {suggestion.description}
                        </BlackParagraph>
                      </div>
                      <WhiteBox>
                        <DriveEtaIcon style={{ color: "black" }}></DriveEtaIcon>
                        <BlackSpan>
                          {data.closestLocationCity}{" "}
                          {data.closestLocationDistance} mi
                        </BlackSpan>
                      </WhiteBox>
                      <WhiteBox>
                        <DriveEtaIcon style={{ color: "black" }}></DriveEtaIcon>

                        <BlackSpan>
                          {data.secondClosestCity} {data.secondClosestDistance}{" "}
                          mi
                        </BlackSpan>
                      </WhiteBox>
                    </Fragment>
                  );
                } else {
                  return (
                    <div {...getSuggestionItemProps(suggestion)}>
                      <BlackParagraph>{suggestion.description}</BlackParagraph>
                    </div>
                  );
                }
              })}
              {suggestions.length === 0 && (
                <Fragment>
                  <BlackParagraph>{data.firstSuggestionAddress}</BlackParagraph>
                  <WhiteBox>
                    <DriveEtaIcon style={{ color: "black" }}></DriveEtaIcon>
                    <BlackSpan>
                      {data.closestLocationCity} {data.closestLocationDistance}{" "}
                      mi
                    </BlackSpan>
                  </WhiteBox>
                  <WhiteBox>
                    <DriveEtaIcon style={{ color: "black" }}></DriveEtaIcon>

                    <BlackSpan>
                      {data.secondClosestCity} {data.secondClosestDistance} mi
                    </BlackSpan>
                  </WhiteBox>
                </Fragment>
              )}
            </div>
          )}
        </PlacesAutocomplete>
        )
      </WhiteBox>
    </Container>
  );
}
/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flexGrow: 1,
  paddingBottom: unit * 6,
  color: "white",
  backgroundColor: colors.primary,
  backgroundImage: `url(${space})`,
  backgroundSize: "cover",
  backgroundPosition: "center"
});

const WhiteBox = styled(Box)({
  background: "white"
});

const BlackParagraph = styled("p")({
  color: "black"
});

const BlackSpan = styled("span")({
  color: "black"
});
