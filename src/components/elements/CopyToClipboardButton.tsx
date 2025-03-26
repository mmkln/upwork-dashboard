import React from "react";

interface CopyToClipboardButtonProps {
  data: string;
  name?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  data,
  name,
}) => {
  const handleClick = () => {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        alert(`${name} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Error ", err);
        alert(`Could not copy ${name} to clipboard`);
      });
  };

  return (
    <button
      className="p-2 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
      title={`Copy ${name} to clipboard`}
      onClick={handleClick}
    >
      <svg
        className="w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
        />
      </svg>
    </button>
  );
};

export default CopyToClipboardButton;
