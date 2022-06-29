import { useState, useCallback } from "react";
import XLSX from "xlsx";

const VALUE = "value";
// const ERROR = "error";
const REQUIRED_FIELD_ERROR = "Field can't be empty";

function is_bool(value) {
  return typeof value === "boolean";
}

function is_object(value) {
  return typeof value === "object" && value !== null;
}

function is_required(value, field) {
  if (!value && field && field.required)
    return field.error || REQUIRED_FIELD_ERROR;
  return "";
}

function get_prop_values(stateSchema, prop) {
  return Object.keys(stateSchema).reduce((field, key) => {
    const schField = field;
    schField[key] = is_bool(prop) ? prop : stateSchema[key][prop];
    return schField;
  }, {});
}

function useFormValidations(
  stateSchema = {},
  stateValidatorSchema = {},
  submitFormCallback
) {
  const [state, setStateSchema] = useState(stateSchema);
  const [values, setValues] = useState(get_prop_values(state, VALUE));
  // const [errors, setErrors] = useState(get_prop_values(state, ERROR));
  const [dirty, setDirty] = useState(get_prop_values(state, false));
  const [disable, setDisable] = useState(false);
  // const [isDirty, setIsDirty] = useState(false);

  const setFieldValue = ({ name, value }) => {
    setValues((prevState) => ({ ...prevState, [name]: value }));
    setDirty((prevState) => ({ ...prevState, [name]: true }));
  };

  // Validate fields in forms
  const validateField = useCallback(
    (name, value) => {
      const validator = stateValidatorSchema;

      if (!validator[name]) return false;

      const field = validator[name];

      let error = "";
      error = is_required(value, field);

      if (is_object(field.validator) && error === "") {
        const validateFieldByCallback = field.validator;
        if (!validateFieldByCallback.func(value, values)) {
          error = validateFieldByCallback.error;
        }
      }

      return error;
    },
    [stateValidatorSchema, values]
  );

  const setInitialErrorState = () => {
    return Object.keys(values).reduce((accu, curr) => {
      const currField = accu;
      currField[curr] = validateField(curr, values[curr]);
      return currField;
    }, {});
  };

  const [errors, setErrors] = useState(setInitialErrorState());

  const setFieldError = ({ name, error }) =>
    setErrors((prevState) => ({ ...prevState, [name]: error }));

  const setSubmitErrorState = useCallback(() => {
    Object.keys(errors).map((name) => {
      setDirty((prevState) => ({ ...prevState, [name]: true }));
      return setFieldError({ name, error: validateField(name, values[name]) });
    });
  }, [errors, values, validateField]);

  const validateErrorState = useCallback(
    () => Object.values(errors).some((error) => error),
    [errors]
  );

  const handleOnSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setSubmitErrorState();
      if (!validateErrorState()) {
        submitFormCallback(values);
        setValues({});
      }
    },
    [validateErrorState, setSubmitErrorState, submitFormCallback, values]
  );

  const handleOnChange = useCallback(
    (event) => {
      // setIsDirty(true);
      const { name } = event.target;
      const { value } = event.target;
      const error = validateField(name, value);
      setFieldValue({ name, value });
      setFieldError({ name, error });
    },
    [validateField]
  );

  const getDataFromFile = (file) =>
    new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = ({ target: { result } }) => {
        const workbook = XLSX.read(result, { type: "array" });
        const items = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
        resolve(items);
      };
      fileReader.readAsArrayBuffer(file);
    });

  const handleFileUpload = async (event) => {
    const { name } = event.target;
    const file = event.target.files[0];
    const error = validateField(name, file);
    const value = !error ? await getDataFromFile(file) : "";
    setFieldValue({ name, value });
    setFieldError({ name, error });
    return null;
  };

  const handleOnChangeDate = useCallback(
    (value, name) => {
      const error = validateField(name, value);

      setFieldValue({ name, value });
      setFieldError({ name, error });
    },
    [validateField]
  );

  const triggerValidation = useCallback(() => {
    setSubmitErrorState();
    if (!validateErrorState()) {
      return true;
    }
    return false;
  }, [validateErrorState, setSubmitErrorState]);

  return {
    dirty,
    values,
    errors,
    disable,
    setStateSchema,
    setValues,
    setFieldValue,
    setFieldError,
    handleOnChange,
    handleOnChangeDate,
    handleOnSubmit,
    handleFileUpload,
    validateErrorState,
    triggerValidation,
    setDisable,
  };
}

export default useFormValidations;
