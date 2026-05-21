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
  primary: "rounded-full bg-primary text-primary-foreground hover:bg-primary-hover",
  ghost: "rounded-full text-text-secondary hover:bg-control-hover hover:text-text-primary",
  soft: "rounded-full bg-control text-text-secondary hover:bg-control-hover hover:text-text-primary",
};

const sizeClassName: Record<ButtonSize, string> = {
  xs: "min-h-control-mini px-control py-micro text-label",
  sm: "h-target px-component text-ui",
  md: "h-target px-card text-ui",
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
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
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
