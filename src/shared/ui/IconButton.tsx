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
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

const variantClassName: Record<IconButtonVariant, string> = {
  ghost: "border-transparent text-text-secondary hover:bg-accent hover:text-accent-foreground",
  outline: "border-input text-text-secondary hover:bg-accent hover:text-accent-foreground",
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
        "rounded-[10px] focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
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
