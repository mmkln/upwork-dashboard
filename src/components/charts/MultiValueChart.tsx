import React, { memo } from "react";
import { chartColorSequence } from "../../shared/theme";

export interface CategoryValuesItem {
  values: number[]; // Масив значень
  colors?: string[]; // Масив кольорів для кожного значення
  count?: number; // Кількість для відображення поруч з label
  label: string;
}

interface MultiValueChartProps {
  data: CategoryValuesItem[];
  labelSuffix?: string; // Суфікс для значень (наприклад, $, %, тощо)
  labelPostfix?: string; // Постфікс для значень (наприклад, одиниці виміру)
  maxValue: number; // Максимальне значення для нормалізації
  minValue: number; // Мінімальне значення для нормалізації
  defaultColors?: string[]; // Масив кольорів за замовчуванням
}

const generateGradient = (hexColor: string): string => {
  const hexToRgb = (hex: string) => {
    let bigint = parseInt(hex.replace("#", ""), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
  };

  const { r, g, b } = hexToRgb(hexColor);
  return `linear-gradient(to right, rgba(${r},${g},${b},0.2), rgba(${r},${g},${b},1))`;
};

export const MultiValueChart: React.FC<MultiValueChartProps> = memo(
  ({
    data,
    maxValue,
    minValue,
    labelSuffix,
    labelPostfix,
    defaultColors = [...chartColorSequence],
  }) => {
    return (
      <div className="w-full max-w-md">
        <ul className="flex flex-col gap-component">
          {data.map((item) => {
            // Вибираємо кольори для елементів, якщо немає, використовуємо стандартні
            const colors = item.colors ? item.colors : defaultColors;

            return (
              <li key={item.label} className="flex flex-col gap-item">
                <div className="relative mr-component h-3 w-full rounded-full bg-muted">
                  {item.values
                    .sort((a, b) => a - b)
                    .map((value, index, arr) => {
                      const color = colors[index % colors.length];
                      return (
                        <div
                          key={index}
                          className="absolute top-0 left-0 h-full rounded-full"
                          style={{
                            background: generateGradient(color),
                            width: `${((value - minValue) / (maxValue - minValue)) * 100}%`,
                            zIndex: arr.length - index, // Встановлюємо порядок шарів для відображення
                          }}
                        />
                      );
                    })}
                </div>
                <div className="mx-item flex items-center justify-between text-ui text-text-primary">
                  <span>
                    {item.label}{" "}
                    {item.count && (
                      <span className="text-text-muted">({item.count})</span>
                    )}
                  </span>
                  <span className="text-text-muted">
                    {labelSuffix}
                    {item.values.map((value, index) => (
                      <span key={index}>
                        {value}
                        {index !== item.values.length - 1 && " - "}
                      </span>
                    ))}
                    {labelPostfix}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);

export default MultiValueChart;
