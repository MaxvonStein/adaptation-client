import React, { Fragment } from "react";
import {
  useApolloClient,
  useMutation,
  useQuery,
  useLazyQuery,
} from "@apollo/react-hooks";
import gql from "graphql-tag";
import EstimateInsuranceForm from "../components/estimate-insurance-form";

import { Loading } from "../components";
import { priceFormat } from "../number-formats";
import Box from "@material-ui/core/Box";
import { Typography } from "@material-ui/core";

const SINGLE_UPLOAD = gql`
  mutation($file: Upload!) {
    singleUpload(file: $file) {
      filename
      mimetype
      encoding
      url
    }
  }
`;

const UPLOAD_AVATAR = gql`
  mutation($file: Upload!) {
    uploadAvatar(file: $file) {
      filename
      mimetype
      encoding
      uri
    }
  }
`;

export default function DriverLicense() {
  const [mutate, { loading, error }] = useMutation(UPLOAD_AVATAR);
  const onChange = ({
    target: {
      validity,
      files: [file],
    },
  }) => {
    debugger;
    validity.valid && mutate({ variables: { file } });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{JSON.stringify(error, null, 2)}</div>;

  return (
    <React.Fragment>
      <input type="file" required onChange={onChange} />
    </React.Fragment>
  );
}
