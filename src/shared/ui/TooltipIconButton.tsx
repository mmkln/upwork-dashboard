import React from "react";
import { cn } from "lib/utils";
import IconButton, { type IconButtonProps } from "./IconButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

type TooltipIconButtonProps = IconButtonProps & {
  label: string;
  children: React.ReactNode;
  tooltipContent?: React.ReactNode;
};

const TooltipIconButton = React.forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(
  (
    {
      label,
      tooltipContent,
      children,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          ref={ref}
          type={type}
          aria-label={label}
          className={cn(className)}
          {...props}
        >
          {children}
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent ?? label}</TooltipContent>
    </Tooltip>
  ),
);

TooltipIconButton.displayName = "TooltipIconButton";

export default TooltipIconButton;
