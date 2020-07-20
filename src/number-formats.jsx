export const numberFormat = value =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);

export const priceFormat = (value, cents = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
    maximumFractionDigits: !!cents ? 2 : 0,
    minimumFractionDigits: !!cents ? 2 : 0
  }).format(value);
