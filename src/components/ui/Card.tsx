import React from "react";

interface CardProps {
  children: React.ReactNode;
  shadow?: boolean;
  isHighlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ children, shadow = false, isHighlighted = false }) => (
  <div
    className={`rounded-[10px] border border-[#EFEFEF] bg-white transition-shadow duration-200 ${
      shadow ? "hover:shadow-lg" : ""
    } ${isHighlighted ? "ring-4 ring-tertiary-300" : ""}`}
  >
    {children}
  </div>
);

export default Card;
