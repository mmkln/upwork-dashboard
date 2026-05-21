import React from "react";
import { Card as ShadcnCard } from "components/shadcn/ui/card";
import { cn } from "lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  elevation?: "flat" | "raised";
};

const Card: React.FC<CardProps> = ({
  children,
  className,
  elevation = "flat",
  ...props
}) => (
  <ShadcnCard
    className={cn(
      "rounded-block bg-block p-block text-card-foreground",
      elevation === "raised" ? "shadow-block" : "shadow-none",
      className,
    )}
    {...props}
  >
    {children}
  </ShadcnCard>
);

export default Card;
