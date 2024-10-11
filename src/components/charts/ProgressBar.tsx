import React from "react";

interface ProgressBarSegment {
  color: string;
  value: number;
  label: string;
}

interface ProgressBarProps {
  segments: ProgressBarSegment[];
  total: number;
  size?: "lg" | "md" | "sm"; // Новий параметр для розміру
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(
  ({ segments, total, size = "md" }) => {
    // Визначаємо стилі залежно від розміру
    const getSizeStyles = (size: "lg" | "md" | "sm") => {
      switch (size) {
        case "lg":
          return {
            barHeight: "h-6", // Висота бару для великого розміру
            dotSize: "w-5 h-5", // Розмір точок для легенди
            textSize: "text-base", // Розмір тексту
          };
        case "sm":
          return {
            barHeight: "h-2", // Висота бару для маленького розміру
            dotSize: "w-2 h-2", // Розмір точок для легенди
            textSize: "text-xs", // Розмір тексту
          };
        case "md":
        default:
          return {
            barHeight: "h-3", // Висота бару для середнього розміру
            dotSize: "w-3 h-3", // Розмір точок для легенди
            textSize: "text-sm", // Розмір тексту
          };
      }
    };

    const styles = getSizeStyles(size);

    return (
      <div className="flex flex-col w-full gap-4">
        <div
          className={`relative w-full rounded-full bg-gray-300 flex overflow-hidden ${styles.barHeight}`}
        >
          {segments.map((segment, index) => (
            <div
              key={index}
              className="h-full flex items-center justify-center"
              style={{
                width: `${(segment.value / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            >
              {/* Лейбл всередині кожного сегмента */}
            </div>
          ))}
        </div>
        <div
          className={`flex justify-between mx-2 font-medium ${styles.textSize}`}
        >
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className={`${styles.dotSize} rounded`}
                style={{
                  backgroundColor: segment.color,
                }}
              ></div>
              <span>{segment.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

// export default React.memo(ProgressBar);
