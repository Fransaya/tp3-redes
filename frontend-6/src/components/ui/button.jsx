import React from "react";

export const Button = ({
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center rounded-md text-sm font-medium 
    transition-colors focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 
    disabled:pointer-events-none ring-offset-background
  `;

  const defaultStyles = `
    bg-blue-600 text-white hover:bg-blue-700 
    h-10 py-2 px-4
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${defaultStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
