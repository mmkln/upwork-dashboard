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
  className?: string;
};

const MultiSelect = <T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  disabled = false,
  className,
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
          className={cn(
            "h-10 w-full justify-between rounded-[10px] border border-input bg-surface px-4 py-2 text-left text-sm font-normal text-text-primary shadow-none hover:bg-accent",
            className,
          )}
        >
          <span className="truncate">
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
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
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
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
