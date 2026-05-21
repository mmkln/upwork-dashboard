import React from "react";
import { cn } from "../lib/cn";

type ContentToolbarProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const ContentToolbar: React.FC<ContentToolbarProps> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col gap-component rounded-block bg-block-subtle p-component",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default ContentToolbar;
