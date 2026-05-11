import React from "react";
import { Card as ShadcnCard } from "components/shadcn/ui/card";
import { cn } from "lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  shadow?: boolean;
  isHighlighted?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  shadow = false,
  isHighlighted = false,
  className,
  ...props
}) => (
  <ShadcnCard
    className={cn(
      "rounded-[10px] border-border bg-card text-card-foreground shadow-none transition-shadow duration-200",
      shadow && "hover:shadow-lg",
      isHighlighted && "ring-4 ring-tertiary-300",
      className,
    )}
    {...props}
  >
    {children}
  </ShadcnCard>
);

export default Card;
