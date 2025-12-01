import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.us";

const Textinput = ({
  type = "text",
  label,
  placeholder = "",
  classLabel = "form-label",
  className = "",
  classGroup = "",
  register,
  name,
  readonly = false,
  error,
  icon,
  disabled = false,
  id,
  horizontal = false,
  validate,
  isMask = false,
  description,
  hasicon = false,
  onChange,
  options,
  onFocus,
  defaultValue,
  ...rest
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);

  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || ""; // Avoid "undefined" issue
  const validMessage = typeof validate === "string" ? validate : "";

  return (
    <div
      className={`textfiled-wrapper ${error ? "is-error" : ""} ${
        horizontal ? "flex" : ""
      } ${validate ? "is-valid" : ""}`}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${classLabel} ${
            horizontal
              ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words"
              : ""
          }`}
        >
          {label}
        </label>
      )}

      {/* Input Field */}
      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {/* Normal Input */}
        {!isMask && (
          <input
            type={type === "password" && open ? "text" : type}
            {...(register && name ? register(name) : {})}
            {...rest}
            className={`text-control py-[10px] ${error ? "is-error" : ""} ${className}`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            onChange={onChange}
            defaultValue={defaultValue}
          />
        )}

        {/* Masked Input */}
        {isMask && (
          <Cleave
            {...(register && name ? register(name) : {})}
            {...rest}
            placeholder={placeholder}
            options={options}
            className={`text-control py-[10px] ${error ? "is-error" : ""} ${className}`}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            onChange={onChange}
            defaultValue={defaultValue}
          />
        )}

        {/* Icons */}
        <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
          {/* Eye icon for password */}
          {hasicon && type === "password" && (
            <span
              className="cursor-pointer text-gray-400"
              onClick={handleOpen}
            >
              {open ? (
                <Icon icon="heroicons-outline:eye" />
              ) : (
                <Icon icon="heroicons-outline:eye-off" />
              )}
            </span>
          )}

          {/* Error icon */}
          {error && (
            <span className="text-red-500">
              <Icon icon="ph:info-fill" />
            </span>
          )}

          {/* Success icon */}
          {validate && (
            <span className="text-green-500">
              <Icon icon="ph:check-circle-fill" />
            </span>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-2 text-red-500 block text-sm">{errorMessage}</div>
      )}

      {/* Validation message */}
      {validMessage && (
        <div className="mt-2 text-green-500 block text-sm">{validMessage}</div>
      )}

      {/* Description */}
      {description && <span className="input-help">{description}</span>}
    </div>
  );
};

export default Textinput;
