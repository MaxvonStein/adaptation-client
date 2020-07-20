import { locations } from "./constants";
const R = 3958.8; // Radius of the Earth in miles

export const haversineDistance = (
  latitudeOne,
  longitudeOne,
  latitudeTwo,
  longitudeTwo
) => {
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
};

export const pythagoreanDistance = (
  latitudeOne,
  longitudeOne,
  latitudeTwo,
  longitudeTwo
) =>
  Math.sqrt(
    Math.pow(latitudeOne - latitudeTwo, 2) +
      Math.pow(longitudeOne - longitudeTwo, 2)
  ) * 69;

export const getDistances = (addressLatitude, addressLongitude) =>
  Object.values(locations)
    .map((location) => {
      const crowDistance = Math.round(
        haversineDistance(
          location.latitude,
          location.longitude,
          addressLatitude,
          addressLongitude
        )
      );
      return {
        description: location.description,
        crowDistance,
        transportFee: location.transportFee,
      };
    })
    .sort((a, b) => a.crowDistance - b.crowDistance);
