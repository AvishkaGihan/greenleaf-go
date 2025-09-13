import React from "react";

const FormError = ({ error }) => {
  if (!error) return null;

  return <div className="text-red-500 text-sm mt-1">{error}</div>;
};

export default FormError;
