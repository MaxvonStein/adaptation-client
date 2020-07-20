import React, { Fragment } from "react";
import {
  useApolloClient,
  useQuery,
  writeData,
  useMutation,
} from "@apollo/react-hooks";
import gql from "graphql-tag";
import { InsuranceEmailDialog, StripeForm, FileInput } from "../components";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import FormLabel from "@material-ui/core/FormLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PhoneTextField from "./phone-textfield";
import Checkbox from "@material-ui/core/Checkbox";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import ButtonBase from "@material-ui/core/ButtonBase";
import { FormGroup, FormHelperText } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import IconButton from "@material-ui/core/IconButton";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import Input from "@material-ui/core/Input";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(3),
  },
  fileInput: {
    display: "none",
  },
  choiceCard: {
    margin: 10,
    flex: "1 1 200px",
  },
  choiceCardCard: {
    width: "100%",
  },
  choiceCardHeader: {
    padding: 12,
  },
  choiceCardContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
}));

const price = 50;

const imageExtensionRegex = /\.[jpgen]{3,4}$/gi;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const UPLOAD_FILE = gql`
  mutation($file: Upload!, $label: String!) {
    uploadFile(file: $file, label: $label) {
      filename
      mimetype
      encoding
      uri
    }
  }
`;

export const SEND_EMAIL = gql`
  mutation sendEmail($recipient: String!, $messageText: String) {
    sendEmail(recipient: $recipient, messageText: $messageText) {
      success
      message
    }
  }
`;

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

function ChoiceCard({ value, onClick, selected, name, header, description }) {
  const classes = useStyles();

  return (
    <ButtonBase
      className={classes.choiceCard}
      onClick={onClick}
      value={value}
      name={name}
    >
      <Card className={classes.choiceCardCard}>
        <CardHeader
          avatar={<Radio checked={selected} />}
          title={header}
          className={classes.choiceCardHeader}
        ></CardHeader>
        <CardContent>
          <Typography>{description}</Typography>
        </CardContent>
      </Card>
    </ButtonBase>
  );
}

export default function ReserveForm({ car, lease, quoteId }) {
  // const client = useApolloClient();
  const classes = useStyles();

  const stripe = useStripe();
  const elements = useElements();

  const theme = useTheme();

  const iframeStyles = {
    base: {
      color: theme.grey,
      fontSize: "16px",
      iconColor: theme.placeholderGrey,
      "::placeholder": {
        color: theme.placeholderGrey,
      },
    },
    invalid: {
      iconColor: theme.red,
      color: theme.red,
    },
    complete: {
      iconColor: theme.green,
    },
  };

  const cardElementOpts = {
    iconStyle: "solid",
    style: iframeStyles,
    // hidePostalCode: true,
  };

  const initialFormData = {
    reserveMethod: null,
    licenseUri: "",
    licenseFilename: "",
    isLicenseLoading: false,
    insuranceUri: "",
    insuranceFilename: "",
    isInsuranceLoading: false,
    phoneNumber: "",
    emailAddress: "",
    isPermissionChecked: false,
    isCardComplete: false,
    cardError: "",
  };

  const [isPaymentSuccessful, setIsPaymentSuccessful] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState("");
  const [isEmailDialog, setIsEmailDialog] = React.useState(false);
  const [isSubmitAttempted, setIsSubmitAttempted] = React.useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(false);

  const [formData, setFormData] = React.useState(initialFormData);

  // uploadLoading is true for both when you're only uploading a license for example.  maybe have an isInsuranceLoading state property?
  const [upload, { loading: uploadLoading, error: uploadError }] = useMutation(
    UPLOAD_FILE
  );

  const [sendEmail, { loading: emailLoading, error: emailError }] = useMutation(
    SEND_EMAIL
  );

  const [
    createPaymentIntent,
    { loading: paymentIntentLoading, error: paymentIntentError },
  ] = useMutation(CREATE_PAYMENT_INTENT);

  const handleFileChange = async ({
    target: {
      validity,
      files: [file],
      name,
    },
  }) => {
    // or set some kind of error state
    if (!validity.valid) return;
    setFormData({
      ...formData,
      [`is${name.charAt(0).toUpperCase() + name.slice(1)}Loading`]: true,
    });
    const { data } = await upload({
      variables: {
        file,
        label: name,
      },
    });
    if (name === "license") {
      setFormData({
        ...formData,
        licenseUri: data.uploadFile.uri,
        licenseFilename: file.name,
        isLicenseLoading: false,
      });
    }
    if (name === "insurance") {
      setFormData({
        ...formData,
        insuranceUri: data.uploadFile.uri,
        insuranceFilename: file.name,
        isInsuranceLoading: false,
      });
    }
  };

  const checkFormValidity = () => {
    return (
      !!formData.licenseUri &&
      formData.phoneNumber.replace(/[^0-9]/g, "").length === 10 &&
      formData.isPermissionChecked &&
      !!formData.reserveMethod &&
      ((formData.reserveMethod === "insurance" && !!formData.insuranceUri) ||
        (formData.reserveMethod === "deposit" && !!formData.isCardComplete))
    );
  };

  const getPaymentIntentResponse = async ({ reserveMethod }) => {
    // one async function that gets the ..IntentResponse id if necessary
    if (reserveMethod === "deposit") {
      const paymentIntentResponse = await submitStripe();
      return paymentIntentResponse;
    } else {
      return { id: null };
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitAttempted(true);
    setSubmitStatus("attempted");
    // first check that the form's complete and valid
    if (!checkFormValidity()) return;
    const paymentIntentResponse = await getPaymentIntentResponse({
      reserveMethod: formData.reserveMethod,
    });
    const internalNoticeResponse = await sendInternalNotice({
      paymentId: paymentIntentResponse.id,
    });
    if (internalNoticeResponse.data.sendEmail.success) {
      const orderConfirmationResponse = await sendOrderConfirmation();
      setIsSubmitSuccessful(orderConfirmationResponse.data.sendEmail.success);
      setSubmitStatus(
        orderConfirmationResponse.data.sendEmail.success ? "success" : "error"
      );
    } else {
      // internal notice failed
      setSubmitStatus("error");
    }
  };

  const handleCardChange = (event) => {
    console.log("event.error", event.error);
    setFormData({
      ...formData,
      isCardComplete: event.complete,
      cardError: !!event.error
        ? event.error.message.replace(".", "")
        : !event.complete
        ? "Please complete card details"
        : "",
    });
    // wrap the stripe card element in the material control and display this data
    // implement the submit handling logic with isCardComplete
  };

  const handleMethodClick = (event) => {
    debugger;
    setFormData({
      ...formData,
      reserveMethod: event.currentTarget.value,
    });
  };

  const submitStripe = async () => {
    // source: https://github.com/tmarek-stripe/demo-react-stripe-js/blob/master/components/CheckoutForm.jsx

    setIsProcessingPayment(true);

    const cardElement = elements.getElement("card");

    try {
      const {
        data: { createPaymentIntent: paymentIntent },
      } = await createPaymentIntent({
        variables: { amount: price * 100 },
      });

      const clientSecret = paymentIntent.client_secret;

      const paymentMethodReq = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        // billing_details: billingDetails,
      });

      if (paymentMethodReq.error) {
        setPaymentError(paymentMethodReq.error.message);
        setIsProcessingPayment(false);
        return;
      }

      const {
        paymentIntent: paymentIntentResponse,
        error,
      } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodReq.paymentMethod.id,
      });

      if (error) {
        setPaymentError(error.message);
        setIsProcessingPayment(false);
        return;
      }

      if (paymentIntentResponse.status === "succeeded") {
        return paymentIntentResponse;
      }
    } catch (error) {
      setPaymentError(error);
    }
  };

  // shorten these somehow?
  const sendInternalNotice = async ({ paymentId = null } = {}) => {
    let messageText = "New Lease Order<br>";
    messageText += new Date();
    messageText += `License:<br>${formData.licenseUri}<br>`;
    messageText += `Phone:<br>${formData.phoneNumber}<br>`;
    if (formData.reserveMethod === "insurance")
      messageText += `Insurance:<br>${formData.insuranceUri}<br>`;
    if (formData.reserveMethod === "deposit")
      messageText += `Deposit:<br>https://dashboard.stripe.com/test/payments/${paymentId}<br>`;
    return await sendEmail({
      variables: {
        recipient: "max@driveskips.com",
        messageText,
      },
    });
  };

  const sendOrderConfirmation = async () => {
    let messageText = "Skip's Flex Lease Reservation<br>";
    messageText += `${lease.yearMakeModel}<br>`;
    messageText += `pickup: ${lease.pickupLocation}<br>`;
    messageText += `dropoff: ${lease.dropoffLocation}<br>`;
    messageText += `total: ${lease.total}<br>`;
    messageText +=
      "Questions or changes? Please call or text us at (347) 754 7794 or respond to this email.<br>";
    messageText += "Thank you for working with us!<br>";
    messageText += "Skip's Team";
    return await sendEmail({
      variables: {
        recipient: formData.emailAddress,
        messageText,
      },
    });
  };

  if (uploadError) return <p>Error: {uploadError.message}</p>;

  return (
    <Fragment>
      {submitStatus === "error" || submitStatus === "success" ? (
        submitStatus === "error" ? (
          <Typography>
            Error processing reservation, please contact us to reserve your
            lease. Call or text us at (347) 754 7794. Thank you and we
            appologize for the inconvenience.
            {paymentError && "Error: " + paymentError}
          </Typography>
        ) : (
          // redirect to another page instead?
          <Typography>
            Thank you. We've received your reservation request and will call you
            to confirm soon.
          </Typography>
        )
      ) : (
        <form>
          <Fragment>
            <Typography>Your driver license</Typography>
            {/* work out how to display the filename and update instead of the initial input */}
            {formData.licenseUri && (
              <Fragment>
                <img
                  style={{ height: 300, width: "100%", objectFit: "cover" }}
                  src={formData.licenseUri}
                  alt="license"
                />
                <Typography>{formData.licenseFilename}</Typography>
              </Fragment>
            )}
            {
              <FileInput
                error={!formData.licenseUri && submitStatus === "attempted"}
                onChange={handleFileChange}
                inputName="license"
                labelText="Driver License"
                helperText="Please upload a photo or copy of your driver license"
                isComplete={!!formData.licenseUri}
                isLoading={formData.isLicenseLoading}
                required={true}
                multiple
              />
            }
            {/* // phone number input */}
            <Typography>Your phone number</Typography>
            <PhoneTextField
              onChange={(event) =>
                setFormData({ ...formData, phoneNumber: event.target.value })
              }
              // required
              label="Your phone number"
              error={
                formData.phoneNumber.replace(/[^0-9]/g, "").length !== 10 &&
                submitStatus === "attempted"
              }
            />
            <Typography>Your email address</Typography>
            <TextField
              onChange={(event) =>
                setFormData({ ...formData, emailAddress: event.target.value })
              }
              label="Your email address"
              error={
                !emailRegex.test(formData.emailAddress) &&
                submitStatus === "attempted"
              }
            />
            {/* style the label */}
            <FormControl
              error={
                !formData.isPermissionChecked && submitStatus === "attempted"
              }
            >
              <FormLabel>Permission to call/text</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(event) => {
                        debugger;
                        setFormData({
                          ...formData,
                          isPermissionChecked: event.target.checked,
                        });
                      }}
                    />
                  }
                  label="Yes, I give Skip's my permission to call and/or send text messages regarding my interest in Skip's Flex. I understand that checking this box constitutes my signature. I further understand that my information will be used as described here and in the Skip's Privacy Policy. Message and data rates may apply. You can always text STOP to (347) 754 7794 to opt-out."
                />
              </FormGroup>
              {!formData.isPermissionChecked &&
                submitStatus === "attempted" && (
                  <FormHelperText>Please check the box above</FormHelperText>
                )}
            </FormControl>
            {/* do we need component="fieldset"? */}
            <Box className={classes.choiceCardContainer}>
              <ChoiceCard
                selected={formData.reserveMethod === "deposit"}
                onClick={handleMethodClick}
                value="deposit"
                name="reserveMethod"
                header="Deposit"
                description=""
              />
              <ChoiceCard
                selected={formData.reserveMethod === "insurance"}
                onClick={handleMethodClick}
                value="insurance"
                name="reserveMethod"
                header="Insurance"
                description=""
              />
            </Box>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">
                How would you like to reserve this lease?
              </FormLabel>

              <RadioGroup
                aria-label="Reserve Method"
                name="reserve method"
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    reserveMethod: event.target.value,
                  });
                }}
                // required
              >
                <FormControlLabel
                  value="deposit"
                  control={<Radio />}
                  label="Deposit"
                />
                <FormControlLabel
                  value="insurance"
                  control={<Radio />}
                  label="Proof of Insurance"
                />
              </RadioGroup>
            </FormControl>
          </Fragment>
          {/* // set up state to show this only when radio is selected // add an email
      insurance button */}
          {formData.reserveMethod === "insurance" && (
            // create a component for the label here or maybe the whole thing
            <Fragment>
              <Typography>Your Proof of Insurance document</Typography>
              {!!formData.insuranceUri ? (
                <Fragment>
                  {imageExtensionRegex.test(formData.insuranceUri) ? (
                    <img
                      // change the style, theis is cropping top/bottom on portrait
                      style={{ height: 300, width: "100%", objectFit: "cover" }}
                      src={formData.insuranceUri}
                      alt="insurance file"
                    />
                  ) : (
                    // icon instead?
                    <Box style={{ border: "1px solid black" }}>
                      Insurance Binder PDF
                    </Box>
                  )}
                  <Typography>{formData.insuranceFilename}</Typography>
                </Fragment>
              ) : null}
              <FileInput
                error={
                  formData.reserveMethod === "insurance" &&
                  !formData.insuranceUri &&
                  submitStatus === "attempted"
                }
                onChange={handleFileChange}
                inputName="insurance"
                labelText="Proof of Insurance"
                helperText="Please upload your proof of insurance document"
                isComplete={!!formData.insuranceUri}
                isLoading={formData.isInsuranceLoading}
                required={formData.reserveMethod === "insurance"}
                multiple
              />
              {/* use a dummy generic insurance binder image here if there's an formData.insuranceUri */}
              <p>Email me insurance requirements and details.</p>
              <Button
                color="primary"
                onClick={(event) => {
                  setIsEmailDialog(true);
                }}
              >
                EMAIL ME
              </Button>
              {/* show a confirmation that the email was sent - checkmark?  or EMAIL ME AGAIN */}
              {/* initialEmail isn't updating because this isn't rerendering when that's typed */}
              <InsuranceEmailDialog
                open={isEmailDialog}
                car={car}
                lease={lease}
                quoteId={quoteId}
                closeDialog={(event) => setIsEmailDialog(false)}
                initialEmail={formData.emailAddress}
                setFormEmailAddress={(emailAddress) =>
                  setFormData({ ...formData, emailAddress })
                }
              />
              {/* // Email Me or similar */}
            </Fragment>
          )}
          {/* should this card element just be hidden so the customer's data doesn't dissapear when they click to Proof of Insurance and then back */}
          {formData.reserveMethod === "deposit" &&
            (!isPaymentSuccessful ? (
              <Fragment>
                <CardElement
                  options={cardElementOpts}
                  onChange={handleCardChange}
                />
                {!formData.isCardComplete && (
                  <FormHelperText error={submitStatus === "attempted"}>
                    {!formData.cardError
                      ? "Please enter card details"
                      : formData.cardError}
                  </FormHelperText>
                )}
              </Fragment>
            ) : (
              <Typography>Payment received, thank you!</Typography>
            ))}
          <Button
            variant="contained"
            type="submit"
            color="primary"
            onClick={handleFormSubmit}
            disabled={
              !formData.reserveMethod || isProcessingPayment || uploadLoading
            }
          >
            {isProcessingPayment ? "Processing payment..." : "Submit"}
          </Button>
        </form>
      )}
    </Fragment>
  );
}
