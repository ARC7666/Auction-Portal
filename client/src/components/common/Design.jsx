import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";


export const Title = ({ children, className }) => (
  <h3 className={classNames("text-lg font-semibold text-gray-800", className)}>
    {children}
  </h3>
);

  // NO real use in the WEBSITE . 
  //used it for  testing .


export const Caption = ({ children, className }) => (
  <p className={classNames("text-sm text-gray-500", className)}>
    {children}
  </p>
);


export const PrimaryButton = ({ children, className, ...props }) => (
  <button
    className={classNames(
      "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition rounded",
      className
    )}
    {...props}
  >
    {children}
  </button>
);


export const ProfileCard = ({ children, className }) => (
  <div
    className={classNames(
      "bg-white p-2 rounded-full flex items-center justify-center",
      className
    )}
  >
    {children}
  </div>
);

Title.propTypes = Caption.propTypes = ProfileCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};