import React from "react";
import PropTypes from "prop-types";
import StripeCheckout from "react-stripe-checkout";

const onToken = token => {
  console.log("Stripe Token", token);
};

const PurchaseButton = ({ price, title }) => (
  // temporary Stripe Checkout, use Elements later
  <StripeCheckout
    name="SKIP'S LLC"
    description={title}
    token={onToken}
    amount={price * 100}
    stripeKey={"pk_live_pL2771UAGcFLnTctAYxQwH0J00YzO3LfzV"}
  >
    <span>PLACE DEPOSIT</span>
  </StripeCheckout>
);

export default PurchaseButton;
