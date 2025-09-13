import React from "react";
import FormError from "./FormError";

const FormField = ({
  label,
  type = "text",
  register,
  name,
  errors,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        {...register(name)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      <FormError error={errors[name]?.message} />
    </div>
  );
};

export default FormField;
