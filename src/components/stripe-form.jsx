// source: https://github.com/tmarek-stripe/demo-react-stripe-js/blob/master/components/CheckoutForm.jsx
import React, { useState, Fragment } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import gql from "graphql-tag";

import {
  useApolloClient,
  useQuery,
  writeData,
  useMutation,
} from "@apollo/react-hooks";

// replace styled later, don't forget to uninstall too unless it's in use someplace else
// import styled from "@emotion/styled";
import axios from "axios";

// import Row from "./prebuilt/Row";
import Box from "@material-ui/core/Box";
import { Typography, Button } from "@material-ui/core";
// import BillingDetailsFields from "./prebuilt/BillingDetailsFields";
// import SubmitButton from "./prebuilt/SubmitButton";
// import CheckoutError from "./prebuilt/CheckoutError";

// const CardElementContainer = styled.div`
//   height: 40px;
//   display: flex;
//   align-items: center;
//   & .StripeElement {
//     width: 100%;
//     padding: 15px;
//   }
// `;

export const CREATE_PAYMENT_INTENT = gql`
  mutation createPaymentIntent($amount: Int!) {
    createPaymentIntent(amount: $amount) {
      amount
      amount_received
      id
      client_secret
    }
  }
`;

const StripeForm = ({ price, onSuccessfulCheckout }) => {
  // should this be broken into another component?
  const [
    createPaymentIntent,
    { loading: paymentIntentLoading, error: paymentIntentError },
  ] = useMutation(CREATE_PAYMENT_INTENT);

  const [isProcessing, setProcessingTo] = useState(false);
  const [checkoutError, setCheckoutError] = useState();

  const stripe = useStripe();
  const elements = useElements();

  // TIP
  // use the cardElements onChange prop to add a handler
  // for setting any errors:

  const handleCardDetailsChange = (ev) => {
    ev.error ? setCheckoutError(ev.error.message) : setCheckoutError();
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    // maybe just the zip?
    // const billingDetails = {
    //   address: {
    //     city: ev.target.city.value,
    //     line1: ev.target.address.value,
    //     state: ev.target.state.value,
    //     postal_code: ev.target.zip.value,
    //   },
    // };

    setProcessingTo(true);

    const cardElement = elements.getElement("card");

    try {
      const {
        data: { createPaymentIntent: paymentIntent },
      } = await createPaymentIntent({
        variables: { amount: price * 100 },
      });

      console.log("paymentIntent ", paymentIntent);

      const clientSecret = paymentIntent.client_secret;

      const paymentMethodReq = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        // billing_details: billingDetails,
      });

      console.log("paymentMethodReq ", paymentMethodReq);

      if (paymentMethodReq.error) {
        setCheckoutError(paymentMethodReq.error.message);
        setProcessingTo(false);
        return;
      }

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodReq.paymentMethod.id,
      });

      if (error) {
        setCheckoutError(error.message);
        setProcessingTo(false);
        return;
      }

      onSuccessfulCheckout();
    } catch (err) {
      setCheckoutError(err);
    }
  };

  // Learning
  // A common ask/bug that users run into is:
  // How do you change the color of the card element input text?
  // How do you change the font-size of the card element input text?
  // How do you change the placeholder color?
  // The answer to all of the above is to use the `style` option.
  // It's common to hear users confused why the card element appears impervious
  // to all their styles. No matter what classes they add to the parent element
  // nothing within the card element seems to change. The reason for this is that
  // the card element is housed within an iframe and:
  // > styles do not cascade from a parent window down into its iframes

  const iframeStyles = {
    base: {
      color: "#fff",
      fontSize: "16px",
      iconColor: "#fff",
      "::placeholder": {
        color: "#87bbfd",
      },
    },
    invalid: {
      iconColor: "#FFC7EE",
      color: "#FFC7EE",
    },
    complete: {
      iconColor: "#cbf4c9",
    },
  };

  const cardElementOpts = {
    iconStyle: "solid",
    style: iframeStyles,
    // hidePostalCode: true,
  };

  return (
      {/* <Box>
        <BillingDetailsFields />
      </Box> */}
      <Fragment>
        <Box>
        <CardElement
          options={cardElementOpts}
          onChange={handleCardDetailsChange}
        />
      </Box>
      {checkoutError ? (
        <Typography>
          {"error: " + checkoutError.message + " stack: " + checkoutError.stack}
        </Typography>
      ) : null}
      <Box>
        {/* TIP always disable your submit button while processing payments */}
        <Button disabled={isProcessing || !stripe} onClick={handlePaymentSubmit}>
          {isProcessing ? "Processing..." : `Pay $${price}`}
        </Button>
      </Box>
      </Fragment>
  );
};

export default StripeForm;
