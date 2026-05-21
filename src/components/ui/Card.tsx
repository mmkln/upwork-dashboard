import React from "react";
import { Card as SharedCard } from "../../shared/ui";
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
  <SharedCard
    className={cn(
      "transition-shadow duration-motion-fast ease-motion-standard",
      shadow && "hover:shadow-block",
      isHighlighted && "ring-4 ring-action/20",
      className,
    )}
    {...props}
  >
    {children}
  </SharedCard>
);

export default Card;
