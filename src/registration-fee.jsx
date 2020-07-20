export const estRegistrationFee = (state, carType) => {
  // return estimate registration fee
  let registrationFee;
  switch (state) {
    case "New York":
      switch (carType) {
        case "SUV":
        case "Pickup":
        case "Van":
          registrationFee = 250;
          break;
        default:
          registrationFee = 200;
      }
      break;
    case "New Jersey":
      registrationFee = 200;
      break;
    default:
      registrationFee = 0;
  }
  return registrationFee;
};
