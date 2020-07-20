import React, { Fragment } from "react";
import { Router } from "@reach/router";

import Launch from "./launch";
import Launches from "./launches";
import Cars from "./cars";
import FlexLease from "./flex-lease";
import Lease from "./lease";
import Car from "./car";
import Details from "./details";
import Cart from "./cart";
import Profile from "./profile";
import Quote from "./quote";
import Reserve from "./reserve";
import ReserveDriver from "./reserve-driver";
import ReserveConfirm from "./reserve-confirm";
import {
  Footer,
  PageContainer,
  NavBar,
  UpdateBar,
  ReserveBar,
} from "../components";
import EstimateInsurance from "./estimate-insurance";
import TaxJurisdiction from "./tax-jurisdiction";
import DriverLicense from "./driver-license";

export default function Pages() {
  return (
    <Fragment>
      <Router primary={false} component={Fragment}>
        {/* change path or add another component  */}
        <NavBar default />
        <UpdateBar path="update/:pageName" />
        <ReserveBar path="reserve/:pageName" />
        <ReserveBar path="reserve/:pageName/*" />
      </Router>
      <PageContainer>
        {/* not sure why we need the PageContainer - just spacing? */}
        <Router primary={false} component={Fragment}>
          <Launches path="/" />
          <Cars path="cars/" />
          <Car path="car/:vin" />
          <FlexLease path="flex-lease/:vin" />
          <Lease path="lease" />
          {/* optional quoteId variable for reserve?  or lease?  or rethink this flow   */}
          {/* access with props["*"] */}
          {/* create a redirect or something here */}
          {/* <Reserve path="reserve/*" /> */}
          <ReserveDriver path="reserve/driver/*" />
          <ReserveConfirm path="reserve/reserve" />
          <Details path="details" />
          <Launch path="launch/:launchId" />
          <Cart path="cart" />
          <Profile path="profile" />
          <Quote path="quote" />
          {/* <Quote path="quote/:quoteId" /> */}
          <EstimateInsurance path="/update/estimate-insurance" />
          <EstimateInsurance path="/update/approximate-insurance" />
          <TaxJurisdiction path="/update/tax-jurisdiction" />
          {/* <CustomerState path="/update/state" /> */}
          <DriverLicense path="/update/driver-license" />
        </Router>
      </PageContainer>
      <Footer />
    </Fragment>
  );
}
