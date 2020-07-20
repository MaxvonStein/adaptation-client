// should this file be called lease-price-utils?
export const calculateLease = (
  firstMonthPrice,
  monthlyPrice,
  months,
  customerState,
  customerTaxRate,
  transportCost,
  dropoffLegFee
  // work transportCost in later.  add only for pickup that's not where the car's originating
) => {
  // return lease total
  let firstMonthSalesTax = null;
  let firstMonthRentalTax = null;
  let monthlySalesTax = null;
  let monthlyRentalTax = null;
  let dropoffLegSalesTax = null;
  let dropoffLegRentalTax = null;
  let leaseTotal = null;
  let proration = null;
  let dropoffCharge = null;
  let paymentsTotal = null;
  const rentalTaxRate = 12;
  const rocklandTaxRate = 8.375;

  switch (customerState) {
    case "New York":
      // is it a short term or long term lease?
      if (months >= 3) {
        // 12 month lease, no rental tax, charge sales tax on 12 months of payments up front
        firstMonthSalesTax =
          ((firstMonthPrice +
            transportCost +
            dropoffLegFee +
            11 * monthlyPrice) *
            customerTaxRate) /
          100;
        firstMonthRentalTax = 0;
        monthlySalesTax = 0;
        monthlyRentalTax = 0;
      } else {
        // short-term, charge rental tax and use Rockland tax rate (where car is delivered)
        firstMonthSalesTax =
          ((firstMonthPrice + transportCost) * rocklandTaxRate) / 100;
        firstMonthRentalTax =
          ((firstMonthPrice + transportCost) * rentalTaxRate) / 100;
        monthlySalesTax = (monthlyPrice * rocklandTaxRate) / 100;
        monthlyRentalTax = (monthlyPrice * rentalTaxRate) / 100;
        dropoffLegSalesTax = (dropoffLegFee * rocklandTaxRate) / 100;
        dropoffLegRentalTax = (dropoffLegFee * rentalTaxRate) / 100;
      }
      break;
    case "New Jersey":
      firstMonthSalesTax =
        ((firstMonthPrice + transportCost) * customerTaxRate) / 100;
      firstMonthRentalTax = 0;
      monthlySalesTax = (monthlyPrice * customerTaxRate) / 100;
      monthlyRentalTax = 0;
      dropoffLegSalesTax = (dropoffLegFee * customerTaxRate) / 100;
      dropoffLegRentalTax = 0;
      break;
    default:
  }

  leaseTotal =
    firstMonthPrice +
    transportCost +
    firstMonthRentalTax +
    firstMonthSalesTax +
    (months > 1 &&
      (months - 1) * (monthlyPrice + monthlyRentalTax + monthlySalesTax)) +
    (dropoffLegFee + dropoffLegRentalTax + dropoffLegSalesTax);

  // keep the proration and the dropoffLegFee seperate so it's easier to display an itemization
  // consider doing the same for transportCost, secondLegFee, dropoffLegFee
  proration =
    months > 1 && months % 1 !== 0
      ? (1 - (months % 1)) * (monthlyPrice + monthlyRentalTax + monthlySalesTax)
      : 0;

  paymentsTotal = leaseTotal + proration;

  return {
    firstMonthSalesTax,
    firstMonthRentalTax,
    monthlySalesTax,
    monthlyRentalTax,
    leaseTotal,
    proration,
    dropoffLegFee,
    dropoffLegSalesTax,
    dropoffLegRentalTax,
    paymentsTotal,
  };
};
