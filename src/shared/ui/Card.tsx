import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`rounded-[12px] border border-[#EFEFEF] bg-white p-5 ${className}`}
  >
    {children}
  </div>
);

export default Card;
