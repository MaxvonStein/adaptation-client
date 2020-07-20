import React, { Fragment } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { GET_CAR_DETAILS } from "../pages/car";
import { Loading, Header, CarDetail, CarImage } from "../components";
import { GET_CART } from "../pages/details";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

export const EMAIL_INSURANCE = gql`
  mutation emailInsurance($recipient: String!, $messageText: String) {
    emailInsurance(recipient: $recipient, messageText: $messageText)
  }
`;

export default function DriverForm() {
  const client = useApolloClient();
  const { data, loading, error } = useQuery(GET_CART);

  const [
    emailInsurance,
    { loading: emailLoading, error: emailError }
  ] = useMutation(EMAIL_INSURANCE);

  const handleEmailType = event => {
    const target = event.target;
    const emailText = target.value;
    client.writeData({ data: { customerEmail: emailText } });
  };

  const handleEmailClick = async event => {
    const email = await data.customerEmail;
    console.log("email button click");
    debugger;
    emailInsurance({
      variables: {
        recipient: email,
        messageText: `Insurance policy for ${data.cartVin}`
      }
    });
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
    const email = await data.customerEmail;
    console.log("email button click");
    debugger;
    emailInsurance({ variables: { recipient: email } });
  };

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  return (
    <Fragment>
      <p>Insurance</p>
      <p>VIN: {data.cartVin}</p>
      <form>
        <TextField label="Email" onChange={handleEmailType} />
        <Button onClick={handleEmailClick}>EMAIL ME</Button>
      </form>
    </Fragment>
  );
}
