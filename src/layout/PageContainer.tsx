import React from "react";
import { cn } from "lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
}) => (
  <div className={cn("h-full w-full bg-background p-app-gutter", className)}>
    {children}
  </div>
);

export default PageContainer;
