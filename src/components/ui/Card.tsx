import React from "react";

interface CardProps {
  children: React.ReactNode;
  shadow?: boolean;
}

const Card: React.FC<CardProps> = ({ children, shadow = false }) => (
  <div
    className={`bg-white border border-gray-200 rounded-md transition-shadow duration-200 ${
      shadow && "hover:shadow-xl"
    }`}
  >
    {children}
  </div>
);

export default Card;
