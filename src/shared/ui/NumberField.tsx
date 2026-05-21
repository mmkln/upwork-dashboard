import React from "react";
import Input, { type InputProps } from "./Input";

type NumberFieldProps = Omit<InputProps, "type" | "value" | "onChange"> & {
  label: React.ReactNode;
  value: number | string;
  onValueChange: (value: number) => void;
};

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onValueChange,
  ...props
}) => (
  <label className="flex flex-col gap-item">
    <span className="text-label text-text-muted">{label}</span>
    <Input
      type="number"
      value={value}
      onChange={(event) =>
        onValueChange(
          event.target.value.trim() === ""
            ? Number.NaN
            : Number(event.target.value),
        )
      }
      {...props}
    />
  </label>
);

export default NumberField;
