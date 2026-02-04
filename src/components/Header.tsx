import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials =
    user?.username?.trim().charAt(0).toUpperCase() ?? (user ? "U" : "G");

  const displayName = user?.username ?? "Guest";
  const displayTitle = user ? "Administrator" : "Visitor";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-[60px] items-center justify-between bg-white px-4 border-b border-[#EAEBEB]">
      <div />
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#575757] transition-colors duration-200 hover:bg-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#C4C4FD]"
          aria-label="Notifications"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.1424 12.8115C12.5398 12.646 13.9128 12.3163 15.2329 11.829C14.1149 10.5906 13.4972 8.98087 13.4996 7.3125V6.75C13.4996 5.55653 13.0255 4.41193 12.1816 3.56802C11.3377 2.72411 10.1931 2.25 8.99963 2.25C7.80615 2.25 6.66156 2.72411 5.81764 3.56802C4.97373 4.41193 4.49963 5.55653 4.49963 6.75V7.3125C4.50189 8.98097 3.88387 10.5907 2.76562 11.829C4.06538 12.309 5.43562 12.6428 6.85687 12.8115M11.1424 12.8115C9.71887 12.9804 8.28039 12.9804 6.85687 12.8115M11.1424 12.8115C11.2505 13.1489 11.2773 13.507 11.2208 13.8568C11.1643 14.2065 11.026 14.538 10.8172 14.8242C10.6083 15.1104 10.3349 15.3432 10.019 15.5037C9.70318 15.6642 9.35391 15.7479 8.99963 15.7479C8.64534 15.7479 8.29607 15.6642 7.98023 15.5037C7.6644 15.3432 7.39093 15.1104 7.18209 14.8242C6.97325 14.538 6.83495 14.2065 6.77843 13.8568C6.72192 13.507 6.7488 13.1489 6.85687 12.8115"
              stroke="#575757"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-xl p-1 pr-2.5 transition-colors duration-200 hover:bg-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#C4C4FD]"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1823F0] text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#141414]">
                {displayName}
              </p>
              <p className="text-xs text-[#8A8A8A]">{displayTitle}</p>
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-[10px] border border-[#EFF0F0] bg-white p-3 shadow-lg flex flex-col gap-[10px]">
              <div className="flex flex-col gap-2.5 border-b border-[#EFEFEF] pb-2.5">
                <p className="px-3 text-sm font-medium text-[#141414]">
                  Profile
                </p>
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-normal text-[#575757] transition-colors duration-200 hover:bg-[#F6F8FF]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#575757]"
                  >
                    <path
                      d="M6.896 2.62667C6.956 2.26533 7.26933 2 7.636 2H8.36467C8.73133 2 9.04467 2.26533 9.10467 2.62667L9.204 3.22267C9.25067 3.50533 9.46 3.732 9.724 3.84267C9.98933 3.952 10.294 3.93733 10.5273 3.77067L11.0187 3.41933C11.1632 3.31604 11.3396 3.26738 11.5167 3.28203C11.6937 3.29668 11.8598 3.37369 11.9853 3.49933L12.5007 4.01533C12.7607 4.27467 12.794 4.68333 12.5807 4.982L12.2293 5.47333C12.0627 5.70667 12.048 6.01067 12.158 6.276C12.268 6.54067 12.4947 6.74933 12.778 6.796L13.3733 6.896C13.7353 6.956 14 7.26867 14 7.63533V8.36467C14 8.73133 13.7353 9.04467 13.3733 9.10467L12.7773 9.204C12.4947 9.25067 12.268 9.45933 12.158 9.724C12.048 9.98933 12.0627 10.2933 12.2293 10.5267L12.5807 11.0187C12.794 11.3167 12.76 11.7253 12.5007 11.9853L11.9847 12.5007C11.8591 12.6261 11.6932 12.703 11.5163 12.7177C11.3395 12.7323 11.1631 12.6838 11.0187 12.5807L10.5267 12.2293C10.2933 12.0627 9.98933 12.048 9.72467 12.158C9.45933 12.268 9.25133 12.4947 9.204 12.7773L9.10467 13.3733C9.04467 13.7347 8.73133 14 8.36467 14H7.63533C7.26867 14 6.956 13.7347 6.89533 13.3733L6.79667 12.7773C6.74933 12.4947 6.54067 12.268 6.276 12.1573C6.01067 12.048 5.70667 12.0627 5.47333 12.2293L4.98133 12.5807C4.68333 12.794 4.27467 12.76 4.01467 12.5007L3.49933 11.9847C3.37369 11.8591 3.29668 11.693 3.28203 11.516C3.26738 11.339 3.31604 11.1625 3.41933 11.018L3.77067 10.5267C3.93733 10.2933 3.952 9.98933 3.84267 9.724C3.73267 9.45933 3.50533 9.25067 3.22267 9.204L2.62667 9.104C2.26533 9.044 2 8.73067 2 8.36467V7.63533C2 7.26867 2.26533 6.95533 2.62667 6.89533L3.22267 6.796C3.50533 6.74933 3.73267 6.54067 3.84267 6.276C3.95267 6.01067 3.938 5.70667 3.77067 5.47333L3.42 4.98133C3.3167 4.83683 3.26805 4.66035 3.2827 4.48333C3.29735 4.3063 3.37435 4.14022 3.5 4.01467L4.01533 3.49933C4.14089 3.37369 4.30697 3.29668 4.48399 3.28203C4.66102 3.26738 4.83749 3.31604 4.982 3.41933L5.47333 3.77067C5.70667 3.93733 6.01133 3.952 6.276 3.842C6.54067 3.732 6.74933 3.50533 6.796 3.22267L6.896 2.62667Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 8C10 8.53043 9.78929 9.03914 9.41421 9.41421C9.03914 9.78929 8.53043 10 8 10C7.46957 10 6.96086 9.78929 6.58579 9.41421C6.21071 9.03914 6 8.53043 6 8C6 7.46957 6.21071 6.96086 6.58579 6.58579C6.96086 6.21071 7.46957 6 8 6C8.53043 6 9.03914 6.21071 9.41421 6.58579C9.78929 6.96086 10 7.46957 10 8Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Settings
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-normal text-[#575757] transition-colors duration-200 hover:bg-[#F6F8FF]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#575757]"
                >
                  <path
                    d="M10.5 6V3.5C10.5 3.10218 10.342 2.72064 10.0607 2.43934C9.77936 2.15804 9.39782 2 9 2H5C4.60218 2 4.22064 2.15804 3.93934 2.43934C3.65804 2.72064 3.5 3.10218 3.5 3.5V12.5C3.5 12.8978 3.65804 13.2794 3.93934 13.5607C4.22064 13.842 4.60218 14 5 14H9C9.39782 14 9.77936 13.842 10.0607 13.5607C10.342 13.2794 10.5 12.8978 10.5 12.5V10M12.5 10L14.5 8M14.5 8L12.5 6M14.5 8H6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
