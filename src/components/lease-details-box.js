import React, { Fragment } from "react";
import { Link } from "@reach/router";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Collapse from "@material-ui/core/Collapse";
// import Link from "@material-ui/core/Link";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { priceFormat } from "../number-formats";
import { Typography, IconButton } from "@material-ui/core";
import format from "date-fns/format";
import add from "date-fns/add";
import { dateFormat } from "../dates";
import InfoTooltip from "./info-tooltip";

function TaxExplainer({
  taxAmount,
  customerTaxRate,
  taxRateAccuracy,
  customerState,
  isRentalCarTax,
}) {
  return taxRateAccuracy === "positive" ? (
    <p>
      Includes {priceFormat(taxAmount, true)}{" "}
      <Link to="/update/tax-jurisdiction">{customerState}</Link>
      {isRentalCarTax ? " rental car and sales tax " : " sales tax "}
    </p>
  ) : (
    <p>Based on {customerTaxRate.toFixed(2)}% sales tax</p>
  );
}

export default function LeaseDetailsBox({
  leaseTotal,
  customerLeaseMonths,
  insuranceMonthly,
  insuranceAccuracy,
  leaseFirst,
  firstMonthSalesTax,
  firstMonthRentalTax,
  leaseMonthly,
  monthlyCharges,
  monthlySalesTax,
  monthlyRentalTax,
  customerPickupDate,
  dropoffLegFee,
  dropoffLegSalesTax,
  dropoffLegRentalTax,
  proration,
  transportCost,
  paymentsTotal,
  customerState,
  stateAccuracy,
  taxRateAccuracy,
  customerTaxRate,
}) {
  // maybe this should be a ListItem?  not a box
  const firstMonthTotal = leaseFirst + firstMonthSalesTax + firstMonthRentalTax;
  const grandTotal = insuranceMonthly * customerLeaseMonths + leaseTotal;
  const [expanded, setExpanded] = React.useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  console.log(proration);
  return (
    <Box>
      <List>
        <ListItem>
          <ListItemText>
            <span>Details</span>{" "}
            <IconButton onClick={handleExpandClick}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ListItemText>
        </ListItem>
        <Collapse in={expanded}>
          <List dense>
            <ListItem>
              <ListItemText>
                <p>
                  {taxRateAccuracy === "positive"
                    ? "First Month Payment"
                    : "Est. First Month Payment"}
                </p>
                <p>Due on pickup</p>
                {TaxExplainer({
                  taxAmount: firstMonthSalesTax + firstMonthRentalTax,
                  customerTaxRate,
                  taxRateAccuracy,
                  customerState,
                  isRentalCarTax: firstMonthRentalTax !== 0,
                })}
                {/* {taxRateAccuracy === "positive" ? (
                  <p>
                    Includes{" "}
                    {priceFormat(
                      firstMonthSalesTax + firstMonthRentalTax,
                      true
                    )}{" "}
                    <Link to="/tax-jurisdiction">{customerState}</Link>
                    {firstMonthRentalTax !== 0
                      ? " rental car and sales tax "
                      : " sales tax "}
                  </p>
                ) : (
                  <p>Based on {customerTaxRate.toFixed(2)}% sales tax</p>
                )} */}

                {/* check for the short-term leases that are tax jurisdiction-independant, where we charge Rockland rates no matter where the customer is */}
                {taxRateAccuracy === "guess" && (
                  // should Choose state be here or up near the car by registered in New Jersey?
                  // we're only dealing with sales tax jurisdictions in New York for now
                  <Link to="/update/tax-jurisdiction">
                    Choose sales tax jurisdiction
                  </Link>
                )}
              </ListItemText>
              <ListItemSecondaryAction>
                <ListItemText>
                  <p>
                    {taxRateAccuracy === "positive"
                      ? priceFormat(firstMonthTotal, true)
                      : "about " + priceFormat(firstMonthTotal)}
                  </p>
                </ListItemText>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText>
                <p>
                  Monthly Payments (
                  {priceFormat(
                    leaseMonthly + monthlySalesTax + monthlyRentalTax,
                    true
                  ) +
                    " per month x " +
                    Math.ceil(customerLeaseMonths - 1) +
                    " months"}
                  )
                </p>
                {!!(monthlySalesTax + monthlyRentalTax) &&
                  TaxExplainer({
                    taxAmount:
                      (monthlySalesTax + monthlyRentalTax) *
                      Math.ceil(customerLeaseMonths - 1),
                    customerTaxRate,
                    taxRateAccuracy,
                    customerState,
                    isRentalCarTax: firstMonthRentalTax !== 0,
                  })}
                <p>
                  Charged on the {format(new Date(customerPickupDate), "do")} of
                  the month starting{" "}
                  {format(
                    add(new Date(customerPickupDate), { months: 1 }),
                    "MMMM do"
                  )}
                </p>
              </ListItemText>
              <ListItemSecondaryAction>
                <ListItemText>
                  {priceFormat(
                    Math.ceil(customerLeaseMonths - 1) *
                      (leaseMonthly + monthlySalesTax + monthlyRentalTax),
                    true
                  )}
                </ListItemText>
              </ListItemSecondaryAction>
            </ListItem>
            {!!proration && (
              <ListItem>
                <ListItemText>
                  <p>Final monthly payment prorated refund</p>
                  <p>
                    {"Refund for the unused portion of the " +
                      format(
                        add(new Date(customerPickupDate), {
                          months: Math.floor(customerLeaseMonths),
                        }),
                        "MMM do"
                      ) +
                      " monthly payment"}
                  </p>
                </ListItemText>
                <ListItemSecondaryAction>
                  <ListItemText>({priceFormat(proration, true)})</ListItemText>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </List>
        </Collapse>
        <ListItem>
          <ListItemText
            secondary={
              !expanded ? (
                <Link to="/update/tax-jurisdiction">
                  Choose sales tax jurisdiction
                </Link>
              ) : null
            }
          >
            <span>
              {taxRateAccuracy === "positive"
                ? "Lease total"
                : "Est. lease total"}
            </span>
          </ListItemText>
          <ListItemSecondaryAction>
            <ListItemText
              primary={
                (taxRateAccuracy === "positive" ? "" : "about ") +
                priceFormat(leaseTotal, taxRateAccuracy === "positive")
              }
              secondary={
                priceFormat(leaseTotal / customerLeaseMonths / 30) + " /day"
              }
            />
          </ListItemSecondaryAction>
        </ListItem>

        <ListItem>
          <ListItemText
            // primary={
            //   "Est. insurance total (" +
            //   (insuranceAccuracy !== "guess" ? (
            //     <Link to="/estimate-insurance">
            //       {priceFormat(insuranceMonthly)}
            //     </Link>
            //   ) : (
            //     priceFormat(insuranceMonthly) +
            //     " per month x " +
            //     +customerLeaseMonths.toFixed(2) +
            //     " months)"
            //   ))
            // }
            secondary={
              insuranceAccuracy === "guess" ? (
                <Link to="/update/estimate-insurance">Estimate insurance</Link>
              ) : null
            }
          >
            {insuranceAccuracy !== "guess" ? (
              <span>
                Est. insurance (
                <Link to="/update/estimate-insurance">
                  {priceFormat(insuranceMonthly)} per month
                </Link>{" "}
                x {+customerLeaseMonths.toFixed(2)} months)
              </span>
            ) : (
              <span>
                {insuranceAccuracy === "quote"
                  ? "Insurance "
                  : "Est. insurance "}
                ({priceFormat(insuranceMonthly)} per month x{" "}
                {+customerLeaseMonths.toFixed(2)} months)
              </span>
            )}
          </ListItemText>
          <ListItemSecondaryAction>
            <ListItemText
              primary={priceFormat(
                insuranceMonthly * customerLeaseMonths,
                insuranceAccuracy === "quote"
              )}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              taxRateAccuracy === "positive" && insuranceAccuracy === "quote"
                ? "Total"
                : "Est. total"
            }
          ></ListItemText>
          <ListItemSecondaryAction>
            <ListItemText
              primary={
                taxRateAccuracy === "positive" && insuranceAccuracy === "quote"
                  ? priceFormat(grandTotal, true)
                  : "about " + priceFormat(grandTotal)
              }
              secondary={
                priceFormat(grandTotal / customerLeaseMonths / 30) + " /day"
              }
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <Collapse in={expanded}></Collapse>
    </Box>
  );
}
