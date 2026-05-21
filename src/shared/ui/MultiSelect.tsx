import React, { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "lib/utils";
import Button from "./Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./Command";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export type MultiSelectOption<T extends string | number = string> = {
  value: T;
  label: string;
};

type MultiSelectProps<T extends string | number = string> = {
  options: MultiSelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  size?: "default" | "compact";
  className?: string;
  popoverClassName?: string;
  onTriggerClick?: React.MouseEventHandler<HTMLButtonElement>;
  onContentClick?: React.MouseEventHandler<HTMLDivElement>;
};

const MultiSelect = <T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  disabled = false,
  size = "default",
  className,
  popoverClassName,
  onTriggerClick,
  onContentClick,
}: MultiSelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => value.includes(option.value))
        .map((option) => option.label),
    [options, value],
  );

  const toggleValue = (nextValue: T) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((currentValue) => currentValue !== nextValue));
      return;
    }

    onChange([...value, nextValue]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={onTriggerClick}
          className={cn(
            "w-full justify-between rounded-control border border-control-border bg-control text-left text-ui text-text-primary shadow-none hover:bg-control-hover",
            size === "compact"
              ? "h-control-small px-item py-tag text-label"
              : "h-target px-component py-item",
            className,
          )}
        >
          <span className="truncate">
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          <ChevronsUpDown className="ml-item h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          "w-popover max-w-viewport-safe p-0",
          popoverClassName,
        )}
        onClick={onContentClick}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const selected = value.includes(option.value);
                return (
                  <CommandItem
                    key={String(option.value)}
                    value={option.label}
                    onSelect={() => toggleValue(option.value)}
                  >
                    <span
                      className={cn(
                        "mr-item flex h-4 w-4 items-center justify-center rounded-sm border border-action",
                        selected
                          ? "bg-premium-blue text-primary-foreground"
                          : "border-separator text-text-quaternary [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
