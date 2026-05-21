import React from "react";
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "components/shadcn/ui/button";
import { cn } from "lib/utils";

type IconButtonVariant = "ghost" | "outline";
type IconButtonSize = "sm" | "md";

export type IconButtonProps = Omit<ShadcnButtonProps, "variant" | "size"> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

const variantMap: Record<IconButtonVariant, ShadcnButtonProps["variant"]> = {
  ghost: "ghost",
  outline: "outline",
};

const sizeClassName: Record<IconButtonSize, string> = {
  sm: "h-control-small w-control-small",
  md: "h-target w-target",
};

const variantClassName: Record<IconButtonVariant, string> = {
  ghost: "border-transparent text-text-secondary hover:bg-control-hover hover:text-text-primary",
  outline: "border-control-border bg-control text-text-secondary hover:bg-control-hover hover:text-text-primary",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = "ghost", size = "md", type = "button", ...props },
    ref,
  ) => (
    <ShadcnButton
      ref={ref}
      type={type}
      variant={variantMap[variant]}
      size="icon"
      className={cn(
        "rounded-full focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      {...props}
    />
  ),
);

IconButton.displayName = "IconButton";

export default IconButton;
