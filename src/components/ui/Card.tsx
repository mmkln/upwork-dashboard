import React from "react";

interface CardProps {
  children: React.ReactNode;
  shadow?: boolean;
  isHighlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ children, shadow = false, isHighlighted = false }) => (
  <div
    className={`border rounded-md transition-shadow duration-200 ${
      shadow && "hover:shadow-xl"
    } ${isHighlighted ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}
  >
    {children}
  </div>
);

export default Card;
