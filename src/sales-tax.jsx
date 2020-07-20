export const findTaxRate = state => {
  // return taxRate or array with minimum and maximum if there's not enough information
  // add other states, county-level or local-level sales taxes like in New York are common
  let taxRate;
  switch (state) {
    case "New York":
      taxRate = [7, 8.875];
      break;
    case "New Jersey":
      taxRate = [6.625];
      break;
    case "Massachusetts":
      taxRate = [6.25];
    default:
      taxRate = [0, 9.47];
  }
  return taxRate;
};
