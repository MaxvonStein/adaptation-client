import React from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { SEND_EMAIL } from "./reserve-form";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

export const INSERT_LEASEQUOTE = gql`
  mutation insertLeaseQuote($lease: LeaseInput) {
    insertLeaseQuote(lease: $lease) {
      yearMakeModel
      _id
    }
  }
`;

export default function InsuranceEmailDialog({
  open,
  // car,
  lease,
  quoteId,
  closeDialog,
  initialEmail,
  setFormEmailAddress,
}) {
  const [emailAddress, setEmailAddress] = React.useState(
    !!initialEmail ? initialEmail : ""
  );

  // should more of this logic be on the resolver?  to prevent tampering.  just a sendInsuranceEmail mutation.
  const [sendEmail, { loading: emailLoading, error: emailError }] = useMutation(
    SEND_EMAIL
  );

  const [
    insertLeaseQuote,
    { loading: insertLoading, error: insertError },
  ] = useMutation(INSERT_LEASEQUOTE);

  // should more of this logic be in the resolver?  that would prevent
  const handleEmailSubmit = async (event) => {
    debugger;
    const leaseInput = lease;
    delete leaseInput.__typename;
    const insertQuoteResponse = await insertLeaseQuote({
      // plug in the whole lease?  should the lease have the car vin too?  or some other car details?
      variables: {
        lease: leaseInput,
      },
    });

    console.log("insertQuoteResponse");
    console.log(insertQuoteResponse);
    // address:
    // The recipient address <mevonstein@gmail.> is not a valid RFC-5321
    // 553 5.1.3 address. l2sm1071332qtc.80 - gsmtp
    console.log(
      await sendEmail({
        variables: {
          recipient: emailAddress,
          // should the quoteId be the id from insertQuoteResponse?
          messageText: `insurance email text..<br>${lease.vin}<br>${lease.yearMakeModel}<br>http://localhost:3000/reserve/${quoteId}`,
        },
      })
    );

    setFormEmailAddress(emailAddress);
    closeDialog();
  };

  console.log("initialEmail", initialEmail);
  // console.log("emailAddress", emailAddress);

  return (
    <Dialog open={open}>
      <FormControl>
        <Typography>
          Get information on the car and the coverage requirements. We'll email
          you all the details and a link to this page so you can continue
          anytime.
        </Typography>
        <TextField
          label="Email"
          value={emailAddress}
          onChange={(event) => {
            setEmailAddress(event.target.value);
          }}
        />
      </FormControl>
      <DialogActions>
        <Button onClick={(event) => closeDialog()} color="primary">
          CANCEL
        </Button>
        <Button
          variant="contained"
          onClick={handleEmailSubmit}
          color="primary"
          autoFocus
        >
          EMAIL ME
        </Button>
      </DialogActions>
    </Dialog>
  );
}
