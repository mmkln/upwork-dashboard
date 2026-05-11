import React from "react";
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "components/shadcn/ui/button";
import { cn } from "lib/utils";

type ButtonVariant = "primary" | "ghost" | "soft";
type ButtonSize = "xs" | "sm" | "md";

export type ButtonProps = Omit<ShadcnButtonProps, "variant" | "size"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantMap: Record<ButtonVariant, ShadcnButtonProps["variant"]> = {
  primary: "default",
  ghost: "ghost",
  soft: "secondary",
};

const sizeMap: Record<ButtonSize, ShadcnButtonProps["size"]> = {
  xs: "sm",
  sm: "sm",
  md: "default",
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "rounded-[10px] bg-primary text-primary-foreground hover:bg-primary-hover",
  ghost: "rounded-[10px] text-text-secondary hover:bg-accent hover:text-accent-foreground",
  soft: "rounded-[6px] bg-surface-muted text-text-secondary hover:bg-muted",
};

const sizeClassName: Record<ButtonSize, string> = {
  xs: "h-auto px-3 py-1.5 text-[10px] font-medium",
  sm: "h-9 px-4 py-2 text-xs",
  md: "h-auto px-6 py-3 text-sm",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) => (
    <ShadcnButton
      ref={ref}
      type={type}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      className={cn(
        "font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export default Button;
