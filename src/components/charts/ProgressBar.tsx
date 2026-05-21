import React from "react";

interface ProgressBarSegment {
  color: string;
  value: number;
  label: string;
}

interface ProgressBarProps {
  segments: ProgressBarSegment[];
  total: number;
  size?: "lg" | "md" | "sm";
}

const getSizeStyles = (size: NonNullable<ProgressBarProps["size"]>) => {
  switch (size) {
    case "lg":
      return {
        barHeight: "h-6",
        dotSize: "h-5 w-5",
        textSize: "text-ui",
      };
    case "sm":
      return {
        barHeight: "h-2",
        dotSize: "h-2 w-2",
        textSize: "text-label",
      };
    case "md":
    default:
      return {
        barHeight: "h-3",
        dotSize: "h-3 w-3",
        textSize: "text-ui",
      };
  }
};

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(
  ({ segments, total, size = "md" }) => {
    const styles = getSizeStyles(size);

    return (
      <div className="flex w-full flex-col gap-component">
        <div
          className={`relative flex w-full overflow-hidden rounded bg-muted ${styles.barHeight}`}
        >
          {segments.map((segment, index) => (
            <div
              key={index}
              className="flex h-full items-center justify-center"
              style={{
                width: `${(segment.value / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>
        <div className={`flex justify-between text-text-secondary ${styles.textSize}`}>
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-micro">
              <div
                className={`${styles.dotSize} rounded-full`}
                style={{
                  backgroundColor: segment.color,
                }}
              />
              <span>{segment.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
