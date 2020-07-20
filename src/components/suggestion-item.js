import React from "react";
import { useQuery } from "@apollo/react-hooks";
import styled from "react-emotion";
import Checkbox from "@material-ui/core/Checkbox";
import DonutSmall from "@material-ui/icons/DonutSmall";
import FontDownload from "@material-ui/icons/FontDownload";

export default function SuggestionItem({
  name,
  value,
  label,
  checked,
  handleClick,
  searchString
}) {
  // should this be defined outside the component
  const matchCaseReplaceBold = (string, substring) => {
    // typedval = oAcF._sTypedChars.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    var reg = new RegExp(
      "(" +
        substring.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
        ")",
      "i"
    );
    var stringParts = string.split(reg);
    // var result = string.replace(reg, "<b>$1</b>");
    return (
      <span>
        {stringParts.map(part =>
          part.match(reg) ? (
            <span style={{ fontWeight: 600 }}>{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };
  return (
    <li name={name} value={value} onClick={handleClick}>
      {name == "make" && <DonutSmall></DonutSmall>}
      {name == "makeModel" && <FontDownload></FontDownload>}
      {matchCaseReplaceBold(label, searchString)}
      <Checkbox name={name} checked={checked} value={value}></Checkbox>
      {/* <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange=""
        onClick={handleClick}
      ></input> */}
    </li>
  );
}
