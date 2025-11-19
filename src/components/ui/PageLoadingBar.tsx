import React from "react";

interface PageLoadingBarProps {
  loading: boolean;
}

const PageLoadingBar: React.FC<PageLoadingBarProps> = ({ loading }) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-1 transition-opacity duration-300 ${
        loading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="page-loading-bar h-full w-full" />
    </div>
  );
};

export default PageLoadingBar;
