import React from "react";
import Card from "./Card";

type StatCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  meta,
  className,
}) => (
  <Card className={className ?? "p-card"}>
    <div className="flex h-full flex-col justify-between gap-component">
      <p className="text-label text-text-muted">{label}</p>
      <div>
        <p className="truncate text-data text-text-primary">{value}</p>
        {meta && <p className="mt-item text-body text-text-secondary">{meta}</p>}
      </div>
    </div>
  </Card>
);

export default StatCard;
