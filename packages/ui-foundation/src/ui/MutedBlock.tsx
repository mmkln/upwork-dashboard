import React from "react";
import { cn } from "../lib/cn";

type MutedBlockProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const MutedBlock: React.FC<MutedBlockProps> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn(
      "rounded-control bg-block-subtle px-control py-item text-body text-text-muted",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default MutedBlock;
