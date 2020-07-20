// source: https://material-ui.com/components/text-fields/#integration-with-3rd-party-input-libraries
import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import PhotoCameraOutlinedIcon from "@material-ui/icons/PhotoCameraOutlined";
import { useTheme } from "@material-ui/core/styles";
import Grey from "@material-ui/core/colors/grey";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(3),
  },
  fileInput: {
    display: "none",
  },
  containedIconButton: {
    minWidth: "unset",
    padding: 10,
    borderRadius: "50%",
  },
  inputGroup: {
    marginTop: 9,
  },
  helperText: {
    marginTop: 8,
  },
  labelHeading: {
    color: Grey[800],
  },
}));

export default function FileInput({
  error,
  onChange,
  labelText,
  inputName,
  helperText,
  helperComponent,
  isLoading,
  isComplete,
  className,
  ...other
}) {
  const classes = useStyles();
  const theme = useTheme();

  const smallMedia = useMediaQuery(theme.breakpoints.down("sm"));

  // const handleChange = (event) => {
  //   setValue(event.target.value);
  //   // call the onChange prop
  //   onChange(event);
  // };

  return (
    <FormControl error={error}>
      <FormLabel className={classes.labelHeading}>{labelText}</FormLabel>
      <FormGroup className={classes.inputGroup}>
        <input
          // accept
          type="file"
          name={inputName}
          className={classes.fileInput}
          onChange={(event) => {
            // setIsChanged(true);
            onChange(event);
          }}
          id={`${inputName}-file`}
          {...other}
        />
        <label htmlFor={`${inputName}-file`} className={className}>
          {smallMedia ? (
            <Button
              variant="contained"
              disableElevation
              color="primary"
              className={classes.containedIconButton}
              component="span"
              aria-label={`upload ${inputName}`}
            >
              <PhotoCameraOutlinedIcon />
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              component="span"
              size="small"
            >
              {!isComplete && !isLoading
                ? "Choose File"
                : isComplete
                ? "Choose New File"
                : "Uploading..."}
            </Button>
          )}
        </label>
      </FormGroup>
      {/* <Typography>
                {!formData.licenseUri
                  ? "Upload a photo or copy of your driver license"
                  : "Upload a new driver license"}
              </Typography> */}
      {!isComplete && (
        <Fragment>
          {!!helperText && (
            <FormHelperText className={classes.helperText}>
              {helperText}
            </FormHelperText>
          )}
          {!!helperComponent && helperComponent}
        </Fragment>
      )}
    </FormControl>
  );
}
