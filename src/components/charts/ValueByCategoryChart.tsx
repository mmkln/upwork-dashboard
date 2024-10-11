import React from "react";
import { hexToRgb } from "../../utils";

export interface CategoryValueItem {
  color?: string; // HEX-колір для кожного елемента
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
  return `linear-gradient(to right, rgba(${r},${g},${b},0.2), rgba(${r},${g},${b},1))`;
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
      <ul className="flex flex-col gap-4">
        {data.map((item) => {
          const gradientStyle = item.color
            ? { background: generateGradient(item.color) }
            : {
                background:
                  "linear-gradient(to right, rgba(29, 78, 216, 0.2), rgba(29, 78, 216, 1))",
              }; // Синій градієнт за замовчуванням

          return (
            <li key={item.label} className="flex flex-col gap-1.5">
              <div className="bg-gray-500/10 rounded-full w-full h-3 relative mr-4">
                <div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    ...gradientStyle,
                    width: `${((item.value - minValue) / (maxValue - minValue)) * 100}%`,
                  }}
                />
              </div>
              <div className="mx-2 flex items-center justify-between text-gray-800 text-sm font-medium">
                <span className="">{item.label}</span>

                <span className="text-gray-500">
                  {labelSuffix}
                  {item.value}
                  {labelPostfix}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ValueByCategoryChart;
