import React from "react";
import Input, { type InputProps } from "./Input";

type FormFieldProps = Omit<InputProps, "value" | "onChange"> & {
  label: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onValueChange,
  ...props
}) => (
  <label className="flex flex-col gap-item">
    <span className="text-label text-text-muted">{label}</span>
    <Input
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      {...props}
    />
  </label>
);

export default FormField;
