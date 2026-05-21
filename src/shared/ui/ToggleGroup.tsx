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
      xs: "h-control-mini px-control text-label",
      sm: "h-control-small px-control text-label",
      md: "h-target px-component text-ui",
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
        "inline-flex items-center gap-0 rounded-full bg-control p-micro",
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
              "flex items-center gap-item rounded-full text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary data-[state=on]:bg-control-selected data-[state=on]:text-text-primary",
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
