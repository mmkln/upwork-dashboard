import React from "react";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "sm" | "md";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClassName =
  "inline-flex items-center justify-center rounded-[10px] font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:pointer-events-none disabled:bg-[#C4C4FD]";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-[#1823F0] text-white hover:bg-[#131CC0] disabled:bg-[#C4C4FD]",
  ghost: "bg-transparent text-[#575757] hover:bg-[#F6F8FF]",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`${baseClassName} ${variantClassName[variant]} ${sizeClassName[size]} ${className}`}
    {...props}
  />
);

export default Button;
