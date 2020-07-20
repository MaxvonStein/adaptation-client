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
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

export const INSERT_LEASEQUOTE = gql`
  mutation insertLeaseQuote($lease: LeaseInput) {
    insertLeaseQuote(lease: $lease) {
      yearMakeModel
      _id
    }
  }
`;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function InsuranceQuoteDialog({
  open,
  // car,
  lease,
  quoteId,
  closeDialog,
  initialEmail,
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
          messageText: `insurance email text..<br>${lease.vin}<br>${lease.yearMakeModel}<br>http://localhost:3000/reserve/${quoteId}`,
        },
      })
    );

    // setFormEmailAddress(emailAddress);
    closeDialog();
  };

  console.log("initialEmail", initialEmail);
  // console.log("emailAddress", emailAddress);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      // onClose={() => {closeDialog()})}
      fullWidth
      // fullScreen
      PaperProps={{ style: { height: "calc(100% - 64px)", maxWidth: null } }}
      // maxWidth={"xl"}
    >
      <DialogTitle id="alert-dialog-slide-title">
        {"Use Google's location service?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            closeDialog();
          }}
          color="primary"
        >
          Disagree
        </Button>
        <Button
          onClick={() => {
            closeDialog();
          }}
          color="primary"
        >
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
}
