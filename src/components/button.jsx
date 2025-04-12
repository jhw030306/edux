import PropTypes from "prop-types";
import React from "react";
import "./button.css";

export const Button = ({
  property1,
  text = "",
  size = "md",
  className = "",
  onClick,
}) => {
  const sizeClass = `button-${size}`;
  return (
    <button
      className={`button ${property1} ${sizeClass} ${className}`}
      onClick={onClick}
    >
      <div className="text-wrapper">{text}</div>
    </button>
  );
};

Button.propTypes = {
  property1: PropTypes.oneOf([
    "selected",
    "hover",
    "null",
    "default",
  ]),
  text: PropTypes.string,
};
