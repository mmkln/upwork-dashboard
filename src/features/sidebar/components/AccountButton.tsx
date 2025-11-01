// AccountButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const AccountButton: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials =
    user?.username?.trim().charAt(0).toUpperCase() ?? (user ? "U" : "A");

  const handleClick = () => {
    if (user) {
      logout();
      navigate("/login", { replace: true });
    } else {
      navigate("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group mt-auto flex w-full items-center rounded bg-[#002e82] px-2 py-2 text-gray-200 transition-colors duration-300 hover:bg-[#023ca5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#001844] focus:ring-blue-500"
      title={user ? `Signed in as ${user.username}` : "Sign in"}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#023ca5] text-sm font-semibold text-white">
        {initials}
      </div>
      <div className="ml-3 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        <p className="text-xs uppercase tracking-wide text-gray-300">
          {user ? user.username : "Guest"}
        </p>
        <p className="text-sm font-semibold text-gray-100">
          {user ? "Sign out" : "Sign in"}
        </p>
      </div>
    </button>
  );
};

export default AccountButton;
