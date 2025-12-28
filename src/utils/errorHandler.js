// Extract user-friendly error message from API error response
export const handleApiError = (error) => {
  if (error.response) {
    // Backend returned an error response
    const message = error.response.data?.message || 'An error occurred';
    return message;
  } else if (error.request) {
    // Request was made but no response received
    return 'Unable to connect to server. Please check your internet connection.';
  } else {
    // Something else happened while setting up the request
    return error.message || 'An unexpected error occurred';
  }
};

// Format validation errors (if backend returns array of errors)
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map((err) => err.message || err).join(', ');
  }
  return errors;
};
