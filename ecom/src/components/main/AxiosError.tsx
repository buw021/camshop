import axios from "axios";
import { showToast } from "../../func/showToast";
import { setFieldErrors } from "../../func/setFieldError";
type FieldErrorMap = {
  [key: string]: string[];
};
export const handleAxiosError = (error: unknown): FieldErrorMap | null => {
  let fieldErrorMap: FieldErrorMap | null = null;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const statusCode = error.response.status;

      // Rate Limiting Error
      if (statusCode === 429 && error.response.data?.ratelimit) {
        showToast(error.response.data.ratelimit, "error");
        return null;
      }

      // Validation Errors
      if (statusCode === 400 && Array.isArray(error.response.data?.errors)) {
        fieldErrorMap = setFieldErrors({
          errorArray: error.response.data.errors,
        });
        return fieldErrorMap;
      }

      // Other Errors with Status Code
      showToast(
        `Error: ${statusCode} - ${error.response.data?.message || "Unknown error"}`,
        "error",
      );
    } else if (error.request) {
      // Network Error (No Response)
      showToast(
        "Error: No response from server. Please try again later.",
        "error",
      );
    } else {
      // Unexpected Axios Error
      showToast(`Unexpected error: ${error.message}`, "error");
    }
  } else {
    // Unknown Error Type
    showToast(`Unknown error occurred: ${String(error)}`, "error");
  }

  return null; // Default return value
};
