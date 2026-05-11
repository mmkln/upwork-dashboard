import React from "react";
import { Button } from "components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "components/shadcn/ui/dropdown-menu";
import { cn } from "lib/utils";

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
            variant="outline"
            className={cn(
              "h-auto rounded-[10px] border-input bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
              buttonClassName,
            )}
          >
            {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align === "left" ? "start" : "end"}
          className={cn(
            "min-w-[160px] rounded-[10px] border-input bg-popover p-2 text-popover-foreground shadow-lg",
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
