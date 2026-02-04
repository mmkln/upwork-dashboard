import React from "react";

type IconButtonVariant = "ghost" | "outline";
type IconButtonSize = "sm" | "md";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

const baseClassName =
  "inline-flex items-center justify-center rounded-[10px] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C4C4FD] disabled:cursor-not-allowed disabled:pointer-events-none disabled:bg-[#C4C4FD]";

const variantClassName: Record<IconButtonVariant, string> = {
  ghost: "text-[#575757] hover:bg-[#F6F8FF]",
  outline: "border border-[#EFF0F0] text-[#575757] hover:bg-[#F6F8FF]",
};

const sizeClassName: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

const IconButton: React.FC<IconButtonProps> = ({
  className = "",
  variant = "ghost",
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

export default IconButton;
