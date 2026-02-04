import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import {
  LogoutIcon,
  NotificationIcon,
  SettingsIcon,
} from "../shared/icons";

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
          <NotificationIcon className="w-[18px] h-[18px]" />
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
                  <SettingsIcon className="w-4 h-4 text-[#575757]" />
                  Settings
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-xs font-normal text-[#575757] transition-colors duration-200 hover:bg-[#F6F8FF]"
              >
                <LogoutIcon className="w-4 h-4 text-[#575757]" />
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
