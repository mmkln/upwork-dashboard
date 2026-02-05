import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement>;

const PlusIcon: React.FC<IconProps> = ({ className = "", ...props }) => (
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
    <path d="M8 3V13M13 8H3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default PlusIcon;
