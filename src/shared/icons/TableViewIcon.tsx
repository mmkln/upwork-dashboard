import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement>;

const TableViewIcon: React.FC<IconProps> = ({ className = "", ...props }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M2.5 8H13.5M2.5 10.5H13.5M2.5 13H13.5M3.75 3H12.25C12.5815 3 12.8995 3.1317 13.1339 3.36612C13.3683 3.60054 13.5 3.91848 13.5 4.25C13.5 4.58152 13.3683 4.89946 13.1339 5.13388C12.8995 5.3683 12.5815 5.5 12.25 5.5H3.75C3.41848 5.5 3.10054 5.3683 2.86612 5.13388C2.6317 4.89946 2.5 4.58152 2.5 4.25C2.5 3.91848 2.6317 3.60054 2.86612 3.36612C3.10054 3.1317 3.41848 3 3.75 3Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TableViewIcon;
