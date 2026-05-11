import React from "react";
import { Card as ShadcnCard } from "components/shadcn/ui/card";
import { cn } from "lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <ShadcnCard
    className={cn(
      "rounded-[12px] border-border bg-card p-8 text-card-foreground shadow-none",
      className,
    )}
    {...props}
  >
    {children}
  </ShadcnCard>
);

export default Card;
