import React, { Fragment } from "react";
import {
  useApolloClient,
  useQuery,
  writeData,
  useMutation,
} from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useNavigate } from "@reach/router";
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
  fileSectionContainer: {
    display: "flex",
    alignItems: "flex-start",
  },
  reviewImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "left",
    marginTop: 9,
  },
  reviewImageBox: {
    // width: 140,
    // height: 140,
    flexGrow: "2",
    flexShrink: "2",
    // smaller flex-basis helps the .fileInputBox maintain enough width
    flexBasis: 180,
  },
  fileInputComponent: {
    marginRight: 14,
  },
  fileInputBox: {
    flexShrink: "1",
    flexBasis: "content",
  },
  formElement: theme.formElement,
  formSubmit: {
    marginTop: 32,
  },
}));

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

export default function DriverReserveForm({
  car,
  lease,
  quoteId,
  initialCustomerEmail,
  initialCustomerPhone,
  initialCustomerLicenseUri,
}) {
  const client = useApolloClient();
  const navigate = useNavigate();

  const classes = useStyles();
  const theme = useTheme();

  const initialFormData = {
    // reserveMethod: null,
    licenseUri: initialCustomerLicenseUri || "",
    licenseFilename: "",
    isLicenseLoading: false,
    // insuranceUri: "",
    // insuranceFilename: "",
    // isInsuranceLoading: false,
    phoneNumber: initialCustomerPhone || "",
    emailAddress: initialCustomerEmail || "",
    // isPermissionChecked: false,
    // isCardComplete: false,
    // cardError: "",
  };

  // const [isPaymentSuccessful, setIsPaymentSuccessful] = React.useState(false);
  // const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  // // const [paymentError, setPaymentError] = React.useState("");
  // const [isEmailDialog, setIsEmailDialog] = React.useState(false);
  // const [isSubmitSuccessful, setIsSubmitSuccessful] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(false);
  const [formData, setFormData] = React.useState(initialFormData);

  // uploadLoading is true for both when you're only uploading a license for example.  maybe have an isInsuranceLoading state property?
  const [upload, { loading: uploadLoading, error: uploadError }] = useMutation(
    UPLOAD_FILE
  );

  // const [sendEmail, { loading: emailLoading, error: emailError }] = useMutation(
  //   SEND_EMAIL
  // );

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
      emailRegex.test(formData.emailAddress)
    );
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus("attempted");
    // first check that the form's complete and valid
    if (!checkFormValidity()) return;
    client.writeData({
      data: {
        customerEmail: formData.emailAddress,
        customerPhone: formData.phoneNumber,
        customerLicenseUri: formData.licenseUri,
      },
    });
    // form is valid, data is written, navigate to next page
    navigate("/reserve/reserve");
  };

  if (uploadError || submitStatus === "error")
    return (
      <Typography>
        Error processing reservation, please contact us to reserve your lease.
        Call or text us at (347) 754 7794. Thank you and we appologize for the
        inconvenience.
        {uploadError.message}
      </Typography>
    );
  // no error
  return (
    <form>
      <Fragment>
        {/* work out how to display the filename and update instead of the initial input */}
        {
          <Box className={classes.formElement}>
            <FormLabel
              error={!formData.licenseUri && submitStatus === "attempted"}
              className={classes.labelHeading}
            >
              Driver License
            </FormLabel>
            <Box className={classes.fileSectionContainer}>
              <Box className={classes.fileInputBox}>
                <FileInput
                  error={!formData.licenseUri && submitStatus === "attempted"}
                  onChange={handleFileChange}
                  inputName="license"
                  // labelText="Driver License"
                  helperText="Please upload a photo or copy of your driver license"
                  isComplete={!!formData.licenseUri}
                  isLoading={formData.isLicenseLoading}
                  required={true}
                  multiple
                  className={classes.fileInputComponent}
                />
              </Box>
              {formData.licenseUri && (
                <Box className={classes.reviewImageBox}>
                  <img
                    className={classes.reviewImage}
                    src={formData.licenseUri}
                    alt="license"
                  />
                  <Typography>{formData.licenseFilename}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        }
        {/* // phone number input */}
        <Box className={classes.formElement}>
          <PhoneTextField
            onChange={(value) =>
              setFormData({ ...formData, phoneNumber: value })
            }
            initialValue={initialCustomerPhone}
            // required
            label="Phone number"
            error={
              formData.phoneNumber.replace(/[^0-9]/g, "").length !== 10 &&
              submitStatus === "attempted"
            }
            variant="filled"
          />
        </Box>
        <Box className={classes.formElement}>
          <TextField
            onChange={(event) =>
              setFormData({ ...formData, emailAddress: event.target.value })
            }
            defaultValue={initialCustomerEmail}
            label="Email address"
            error={
              !emailRegex.test(formData.emailAddress) &&
              submitStatus === "attempted"
            }
            variant="filled"
          />
        </Box>
        {/* style the label */}
        {/* <FormControl
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
            {!formData.isPermissionChecked && submitStatus === "attempted" && (
              <FormHelperText>Please check the box above</FormHelperText>
            )}
          </FormControl> */}
        {/* do we need component="fieldset"? */}
      </Fragment>
      {/* // set up state to show this only when radio is selected // add an email
      insurance button */}

      {/* should this card element just be hidden so the customer's data doesn't dissapear when they click to Proof of Insurance and then back */}
      {/* {formData.reserveMethod === "deposit" &&
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
          ))} */}
      <Box className={classes.formSubmit}>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          onClick={handleFormSubmit}
          disabled={formData.isLicenseLoading}
        >
          {formData.isLicenseLoading ? "Uploading..." : "Continue"}
        </Button>
      </Box>
    </form>
  );
}
