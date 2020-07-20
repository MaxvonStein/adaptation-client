import React, { Fragment } from "react";
import { Link } from "@reach/router";

export default function RegistrationDetail({ customerState, stateAccuracy }) {
  // const client = useApolloClient();
  // const { data, loading, error } = useQuery(GET_CAR_DETAILS, {
  //   variables: { vin },
  // });

  // if (loading) return <Loading />;
  // if (error) return <p>ERROR: {error.message}</p>;

  if (stateAccuracy === "positive") {
    return (
      <p>
        registered in <Link to="/update/tax-jurisdiction">{customerState}</Link>
      </p>
    );
  } else {
    return (
      <Fragment>
        <p>registered in {customerState}</p>
        <Link to="update/state">Choose state</Link>
      </Fragment>
    );
  }
}
