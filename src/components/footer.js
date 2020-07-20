import React from "react";
import styled from "react-emotion";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import MenuItem from "./menu-item";
import LogoutButton from "../containers/logout-button";
import { ReactComponent as HomeIcon } from "../assets/icons/home.svg";
import { ReactComponent as CartIcon } from "../assets/icons/cart.svg";
import { ReactComponent as ProfileIcon } from "../assets/icons/profile.svg";
import { colors, unit } from "../styles";
import { filtersInitial } from "../constants";
import { navigate } from "@reach/router";

export default function Footer() {
  const client = useApolloClient();
  const clearFiltersRedirect = toUrl => event => {
    event.preventDefault();
    client.writeData({ data: { filters: filtersInitial } });
    navigate(toUrl);
  };

  return (
    <Container>
      <InnerContainer>
        <MenuItem to="/">
          <HomeIcon />
          Home
        </MenuItem>
        <MenuItem to="/lease">
          <CartIcon />
          Cart
        </MenuItem>
        <MenuItem to="/cars" onClick={clearFiltersRedirect("/cars")}>
          <ProfileIcon />
          Cars
        </MenuItem>
        <MenuItem to="/quote" onClick={clearFiltersRedirect("/quote")}>
          <ProfileIcon />
          Quote
        </MenuItem>
      </InnerContainer>
    </Container>
  );
}

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

const Container = styled("footer")({
  flexShrink: 0,
  marginTop: "auto",
  backgroundColor: "white",
  color: colors.textSecondary,
  position: "sticky",
  bottom: 0
});

const InnerContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  maxWidth: 460,
  padding: unit * 2.5,
  margin: "0 auto"
});
