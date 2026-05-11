import React from "react";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
}) => (
  <div className={`h-full w-full bg-surface-subtle p-10 ${className}`}>
    {children}
  </div>
);

export default PageContainer;
