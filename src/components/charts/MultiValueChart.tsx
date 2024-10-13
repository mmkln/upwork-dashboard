import React, { memo } from "react";

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
    defaultColors = ["#3f88ff", "#5ac59f", "#f4bb29"], // Стандартні кольори
  }) => {
    return (
      <div className="w-full max-w-md">
        <ul className="flex flex-col gap-4">
          {data.map((item) => {
            // Вибираємо кольори для елементів, якщо немає, використовуємо стандартні
            const colors = item.colors ? item.colors : defaultColors;

            return (
              <li key={item.label} className="flex flex-col gap-1.5">
                <div className="bg-gray-500/10 rounded-full w-full h-3 relative mr-4">
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
                <div className="mx-2 flex items-center justify-between text-gray-800 text-sm font-medium">
                  <span>
                    {item.label}{" "}
                    {item.count && (
                      <span className="text-gray-500">({item.count})</span>
                    )}
                  </span>
                  <span className="text-gray-500">
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
