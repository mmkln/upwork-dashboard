import React, { useId } from "react";

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
      xs: "px-3 py-[4px] text-[10px]",
      sm: "h-7 px-3 text-xs",
      md: "h-9 px-4 text-sm",
    };

  return (
    <div
      role="radiogroup"
      className={`inline-flex items-center gap-0 rounded-[8px] bg-[#EFF0F7] p-[2px] ${className}`}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <label
            key={item.value}
            className={`flex cursor-pointer items-center gap-1 rounded-[6px] text-[#575757] transition-colors ${sizeClassName[size]} ${
              selected ? "bg-white" : "bg-transparent"
            }`}
            title={item.label}
          >
            <input
              type="radio"
              name={groupName}
              value={item.value}
              checked={selected}
              onChange={() => onChange(item.value)}
              className="sr-only"
            />
            {item.icon}
            <span className="sr-only">{item.label}</span>
          </label>
        );
      })}
    </div>
  );
};

export default ToggleGroup;
