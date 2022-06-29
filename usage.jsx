/** @jsx jsx */
import {
  jsx,
  Box,
  Select,
  Label,
  Textarea,
  Input,
  Flex,
  Text,
  Spinner,
} from "theme-ui";
import React, { useState } from "react";
import { DefaultButton } from "office-ui-fabric-react";
import { useFetchSrcmApi } from "gatsby-plugin-hfn-profile/fetch-srcm-api";
import { buttonStyles, inputStyles } from "sites-common/utils/fabricStyles";
import PropTypes from "prop-types";
import { useAlert } from "gatsby-plugin-hfn-profile/alert";
import { get } from "lodash";
import { validateEmail } from "@heartfulnessinstitute/react-hfn-forms/dist/validations";
import useFormValidations from "../utils/useFormValidations";

const AddEmailTemplate = ({
  eventId,
  refreshTemplates = () => {},
  closeModal = () => {},
  initValue = {},
}) => {
  const formSchema = {
    id: { value: get(initValue, "id", null), error: "" },
    subject: { value: get(initValue, "subject", ""), error: "" },
    body_html: { value: get(initValue, "body_html", ""), error: "" },
    trigger_value: { value: get(initValue, "trigger_value", ""), error: "" },
    default_json: { value: get(initValue, "default_json", {}), error: "" },
    sender_email: { value: get(initValue, "sender_email", ""), error: "" }, // aims.test@srcm.org
    event: { value: eventId, error: "" },
    sender_email_name: {
      value: get(initValue, "sender_email_name", ""),
      error: "",
    },
    trigger_on_save: {
      value: get(initValue, "trigger_on_save", true),
      error: "",
    },
    at_header_level: {
      value: get(initValue, "at_header_level", true),
      error: "",
    },
    target_filter: {
      value: get(initValue, "target_filter", "default"),
      error: "",
    },
    status: {
      value: get(initValue, "status", "approved"),
      error: "",
    },
  };

  const formValidatorSchema = {
    sender_email: {
      required: true,
      error: "Sender email can't be empty",
      validator: {
        func: (value) => validateEmail(value),
        error: "Invalid email address",
      },
    },
    sender_email_name: { required: true, error: "Sender name can't be empty" },
    subject: { required: true, error: "Subject can't be empty" },
    body_html: { required: true, error: "Content can't be empty" },
  };

  const [updating, setUpdating] = useState(false);
  const { fetchSrcmApi } = useFetchSrcmApi();
  const { showAlert } = useAlert();

  const submitFormCallback = (data) => {
    const tempBody = data;
    setUpdating(true);
    const afterUpdate = () => {
      const alertInfo = {
        title: "Success",
        message: `Template has been successfully ${
          tempBody && tempBody.id ? "updated" : "created"
        }.`,
        confirm_text: "Okay",
        is_blocking: true,
      };
      refreshTemplates();
      closeModal();
      setUpdating(false);
      showAlert(alertInfo);
    };

    let apiUrl = `/api/v3/events/${eventId}/emails/`;
    if (tempBody && tempBody.id) {
      apiUrl = `/api/v3/events/${eventId}/emails/${tempBody.id}/`;
    } else {
      delete tempBody.id;
    }

    if (tempBody.body_html) {
      tempBody.body_html = btoa(tempBody.body_html);
    }

    if (tempBody.trigger_value === "") {
      tempBody.trigger_value = null;
    }

    if (tempBody.target_filter) {
      if (typeof tempBody.target_filter === "string") {
        // temp fix
        tempBody.target_filter = {};
        // tempBody.target_filter =  { stay_preference: tempBody.target_filter };
      } else {
        // temp fix

        tempBody.target_filter = {};
        // tempBody.target_filter = {
        //   stay_preference: tempBody.target_filter.stay_preference,
        // };
      }
    }

    fetchSrcmApi({
      api: apiUrl,
      method: tempBody && tempBody.id ? "PUT" : "POST",
      methodParams: tempBody,
      client: "eventsClient",
    })
      .then(() => {
        afterUpdate();
      })
      .catch(() => {
        const alertInfo = {
          title: "Error",
          message: `Sorry, Something went wrong. Please try again later.`,
          confirm_text: "Okay",
          is_blocking: true,
        };
        closeModal();
        setUpdating(false);
        showAlert(alertInfo);
      });
  };

  const { values, errors, dirty, disable, handleOnChange, handleOnSubmit } =
    useFormValidations(formSchema, formValidatorSchema, submitFormCallback);

  const {
    subject,
    body_html,
    sender_email,
    sender_email_name,
    trigger_value /* default_json */,
    trigger_on_save,
    at_header_level,
    target_filter,
    status,
  } = values;

  return (
    <React.Fragment>
      <Box>
        <Box mb={3}>
          <Label htmlFor="sender_email" mb={2}>
            Sender Email <span sx={inputStyles.required}>*</span>
          </Label>
          <Input
            sx={inputStyles.inputStyle}
            style={
              errors.sender_email && dirty.sender_email
                ? inputStyles.inputError
                : null
            }
            name="sender_email"
            id="sender_email"
            value={sender_email}
            onChange={handleOnChange}
          />
          {errors.sender_email && dirty.sender_email && (
            <Text sx={inputStyles.errorMessage}>{errors.sender_email}</Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="sender_email_name" mb={2}>
            Sender name <span sx={inputStyles.required}>*</span>
          </Label>
          <Input
            sx={inputStyles.inputStyle}
            style={
              errors.sender_email_name && dirty.sender_email_name
                ? inputStyles.inputError
                : null
            }
            name="sender_email_name"
            id="sender_email_name"
            value={sender_email_name}
            onChange={handleOnChange}
          />
          {errors.sender_email_name && dirty.sender_email_name && (
            <Text sx={inputStyles.errorMessage}>
              {errors.sender_email_name}
            </Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="subject" mb={2}>
            Subject <span sx={inputStyles.required}>*</span>
          </Label>
          <Input
            sx={inputStyles.inputStyle}
            style={
              errors.subject && dirty.subject ? inputStyles.inputError : null
            }
            name="subject"
            id="subject"
            value={subject}
            onChange={handleOnChange}
          />
          {errors.subject && dirty.subject && (
            <Text sx={inputStyles.errorMessage}>{errors.subject}</Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="body_html" mb={2}>
            Content <span sx={inputStyles.required}> *</span>
          </Label>
          <Textarea
            sx={inputStyles.inputStyle}
            style={
              errors.body_html && dirty.body_html
                ? inputStyles.inputError
                : null
            }
            name="body_html"
            id="body_html"
            rows={5}
            value={body_html}
            onChange={handleOnChange}
          />
          {errors.body_html && dirty.body_html && (
            <Text sx={inputStyles.errorMessage}>{errors.body_html}</Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="trigger_on_save" mb={2}>
            Trigger On Save
          </Label>
          <Select
            sx={inputStyles.inputStyle}
            style={
              errors.trigger_on_save && dirty.trigger_on_save
                ? inputStyles.inputError
                : null
            }
            name="trigger_on_save"
            id="trigger_on_save"
            value={trigger_on_save}
            onChange={handleOnChange}
          >
            <option value>Yes</option>
            <option value={false}>No</option>
          </Select>
          {errors.trigger_on_save && dirty.trigger_on_save && (
            <Text sx={inputStyles.errorMessage}>{errors.trigger_on_save}</Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="trigger_value" mb={2}>
            Trigger
          </Label>
          <Select
            sx={inputStyles.inputStyle}
            style={
              errors.trigger_value && dirty.trigger_value
                ? inputStyles.inputError
                : null
            }
            name="trigger_value"
            id="trigger_value"
            value={trigger_value}
            onChange={handleOnChange}
          >
            <option value="">Default</option>
            <option value="confirmed">Confirmed</option>
            <option value="approval pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          {errors.trigger_value && dirty.trigger_value && (
            <Text sx={inputStyles.errorMessage}>{errors.trigger_value}</Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="at_header_level" mb={2}>
            At Header Level
          </Label>
          <Select
            sx={inputStyles.inputStyle}
            style={
              errors.at_header_level && dirty.at_header_level
                ? inputStyles.inputError
                : null
            }
            name="at_header_level"
            id="at_header_level"
            value={at_header_level}
            onChange={handleOnChange}
          >
            <option value>Yes</option>
            <option value={false}>No</option>
          </Select>
          {errors.at_header_level && dirty.at_header_level && (
            <Text sx={inputStyles.errorMessage}>{errors.at_header_level}</Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="target_filter" mb={2}>
            Target Filter
          </Label>
          <Select
            sx={inputStyles.inputStyle}
            style={
              errors.target_filter && dirty.target_filter
                ? inputStyles.inputError
                : null
            }
            name="target_filter"
            id="target_filter"
            value={target_filter?.stay_preference || target_filter}
            onChange={handleOnChange}
          >
            <option value="default">Default</option>
            {/* <option value="online">Virtual</option>
            <option value="kanha">Stay at Kanha</option>
            <option value="outside">Own accommodation</option> */}
          </Select>
          {errors.target_filter && dirty.target_filter && (
            <Text sx={inputStyles.errorMessage}>{errors.target_filter}</Text>
          )}
        </Box>
        <Box mb={3}>
          <Label htmlFor="status" mb={2}>
            Status
          </Label>
          <Select
            sx={inputStyles.inputStyle}
            style={
              errors.status && dirty.status ? inputStyles.inputError : null
            }
            name="status"
            id="status"
            value={status}
            onChange={handleOnChange}
          >
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          {errors.status && dirty.status && (
            <Text sx={inputStyles.errorMessage}>{errors.status}</Text>
          )}
        </Box>
        {/* <Box mb={4}>
          <Label htmlFor="default_json" mb={2}>
            Default JSON
          </Label>
          <Textarea
            sx={inputStyles.inputStyle}
            style={
              errors.default_json && dirty.default_json
                ? inputStyles.inputError
                : null
            }
            name="default_json"
            id="default_json"
            rows={5}
            value={
              typeof default_json === "object"
                ? JSON.stringify(default_json)
                : default_json
            }
            onChange={handleOnChange}
          />
          {errors.default_json && dirty.default_json && (
            <Text sx={inputStyles.errorMessage}>{errors.default_json}</Text>
          )}
        </Box> */}

        <Flex sx={{ gap: 3, float: "right", pb: 3 }}>
          {updating && <Spinner size={35} />}
          <DefaultButton
            disabled={disable || updating}
            styles={buttonStyles.default}
            onClick={closeModal}
          >
            Cancel
          </DefaultButton>
          <DefaultButton
            disabled={disable || updating}
            styles={buttonStyles.blueLight}
            onClick={handleOnSubmit}
          >
            Submit
          </DefaultButton>
        </Flex>
      </Box>
    </React.Fragment>
  );
};

AddEmailTemplate.defaultProps = {
  initValue: {},
};

AddEmailTemplate.propTypes = {
  eventId: PropTypes.string.isRequired,
  refreshTemplates: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  initValue: PropTypes.objectOf(PropTypes.any),
};

export default React.memo(AddEmailTemplate);
