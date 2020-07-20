// source: https://material-ui.com/components/text-fields/#integration-with-3rd-party-input-libraries
import React from "react";
import PropTypes from "prop-types";
import MaskedInput from "react-text-mask";
import TextField from "@material-ui/core/TextField";

import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
// import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Box from "@material-ui/core/Box";

function TextMaskCustom(props) {
  // not sure we still need this
  const { inputRef, ...other } = props;
  // go to a custom mask maybe?  this one has the cursor all over the place
  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        "(",
        /\d/,
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        " ",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ]}
      placeholderChar={"\u2000"}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

export default function PhoneTextField({
  onChange,
  initialValue,
  name,
  labelText,
  required,
  ...other
}) {
  const [inputValue, setInputValue] = React.useState(initialValue || "");

  const handleChange = (event) => {
    const keyedValue = event.target.value;
    const integers = keyedValue.replace(/[^0-9]/g, "");
    // allow for parrens and other non-letters
    let formatedValue = "";
    if (integers.length >= 1) {
      formatedValue = "(" + integers;
    }
    if (integers.length >= 4) {
      // consider waiting to add the space
      formatedValue = formatedValue.slice(0, 4) + ") " + formatedValue.slice(4);
    }
    if (integers.length >= 7) {
      formatedValue = formatedValue.slice(0, 9) + " " + formatedValue.slice(9);
    }
    const trimmedValue = formatedValue.slice(0, 14);
    setInputValue(trimmedValue);

    // call the onChange prop
    onChange(trimmedValue);
  };

  return (
    <Box>
      <FormControl>
        <TextField
          value={inputValue}
          onChange={handleChange}
          name={name}
          id="formatted-text-mask-input"
          required={true}
          label={"Your phone number"}
          InputLabelProps={{ required: false }}
          {...other}
        />
      </FormControl>
    </Box>
  );
}
