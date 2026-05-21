import React from "react";
import { chartColors } from "../../shared/theme";
import { hexToRgb } from "../../utils";

export interface CategoryValueItem {
  color?: string; // HEX-колір для кожного елемента
  count?: number;
  value: number;
  label: string;
}

interface ValueByCategoryChartProps {
  data: CategoryValueItem[];
  labelSuffix?: string;
  labelPostfix?: string;
  maxValue: number; // Максимальне значення для нормалізації
  minValue: number; // Мінімальне значення для нормалізації (в нашому випадку 0)
}

// Функція для створення градієнта на основі HEX-кольору
const generateGradient = (hexColor: string): string => {
  const { r, g, b } = hexToRgb(hexColor);
  return `linear-gradient(to right, rgba(${r},${g},${b},0.7), rgba(${r},${g},${b},1))`;
};

export const ValueByCategoryChart: React.FC<ValueByCategoryChartProps> = ({
  data,
  maxValue,
  minValue,
  labelSuffix,
  labelPostfix,
}) => {
  return (
    <div className="w-full max-w-md">
      <ul className="flex flex-col gap-component">
        {data.map((item) => (
            <li key={item.label} className="flex flex-col gap-item">
              <div className="relative mr-component h-3 w-full rounded bg-muted">
              <div
                className="absolute top-0 left-0 h-full rounded"
                style={{
                  background: generateGradient(item.color ?? chartColors.primary),
                  width: `${((item.value - minValue) / (maxValue - minValue)) * 100}%`,
                }}
              />
            </div>
              <div className="mx-item flex items-center justify-between text-ui text-text-primary">
              <span className="">
                {item.label}
                {item.count && (
                    <span className="text-text-muted"> ({item.count})</span>
                )}
              </span>

                <span className="text-text-muted">
                {labelSuffix}
                {item.value}
                {labelPostfix}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValueByCategoryChart;
