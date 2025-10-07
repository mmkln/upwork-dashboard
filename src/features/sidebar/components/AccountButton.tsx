// AccountButton.tsx
import React from "react";

const AccountButton: React.FC = () => (
  <a
    href="#"
    className="flex items-center w-full px-2 py-2 mt-auto bg-[#002e82] hover:bg-[#023ca5] hover:text-gray-300 transition-colors duration-300 rounded"
  >
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center w-8 h-8">
        <svg
          className="w-6 h-6 stroke-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Account
      </span>
    </div>
  </a>
);

export default AccountButton;
