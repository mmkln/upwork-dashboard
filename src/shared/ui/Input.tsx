import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`block w-full rounded-[10px] border border-[#EFF0F0] h-10 px-4 text-sm text-[#141414] placeholder:text-sm placeholder:font-normal placeholder:text-[#C8C8C8] focus:border-[#1823F0] focus:outline-none focus:ring-2 focus:ring-[#C4C4FD] ${className}`}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export default Input;
