import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { cn } from "../lib/cn";
import Button from "./Button";

type DropdownProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  label,
  children,
  align = "right",
  className = "",
  buttonClassName = "",
  menuClassName = "",
}) => {
  return (
    <div className={cn("inline-flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-target rounded-full border border-control-border bg-control px-component text-ui text-text-secondary hover:bg-control-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring",
              buttonClassName,
            )}
          >
            {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align === "left" ? "start" : "end"}
          className={cn(
            "min-w-menu rounded-control border border-island-border bg-material-liquid p-item text-text-primary shadow-premium backdrop-blur-2xl",
            menuClassName,
          )}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Dropdown;
