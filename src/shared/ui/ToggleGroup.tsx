import React, { useId } from "react";
import {
  ToggleGroup as ShadcnToggleGroup,
  ToggleGroupItem,
} from "components/shadcn/ui/toggle-group";
import { cn } from "lib/utils";

type ToggleItem<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

type ToggleGroupProps<T extends string> = {
  value: T;
  items: ToggleItem<T>[];
  onChange: (value: T) => void;
  className?: string;
  name?: string;
  size?: "xs" | "sm" | "md";
};

const ToggleGroup = <T extends string>({
  value,
  items,
  onChange,
  className = "",
  name,
  size = "sm",
}: ToggleGroupProps<T>) => {
  const generatedId = useId();
  const groupName = name ?? `toggle-${generatedId}`;
  const sizeClassName: Record<NonNullable<ToggleGroupProps<T>["size"]>, string> =
    {
      xs: "px-3 py-1 text-[10px]",
      sm: "h-7 px-3 text-xs",
      md: "h-9 px-4 text-sm",
    };

  return (
    <ShadcnToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue as T);
        }
      }}
      className={cn(
        "inline-flex items-center gap-0 rounded-[8px] bg-surface-muted p-1",
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            aria-label={item.label}
            className={cn(
              "flex h-auto items-center gap-2 rounded-[6px] text-text-secondary transition-colors hover:bg-surface/70 data-[state=on]:bg-surface data-[state=on]:text-text-secondary",
              sizeClassName[size],
            )}
            title={item.label}
          >
            <input type="hidden" name={groupName} value={selected ? item.value : ""} />
            {item.icon}
            <span className="sr-only">{item.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ShadcnToggleGroup>
  );
};

export default ToggleGroup;
