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
    <header className="flex h-20 items-center justify-between border-b border-border-subtle bg-surface px-10">
      <div />
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Notifications"
        >
          <NotificationIcon className="w-[18px] h-[18px]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl p-1 pr-3 transition-colors duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">
                {displayName}
              </p>
              <p className="text-xs text-text-muted">{displayTitle}</p>
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 flex w-48 flex-col gap-2 rounded-[10px] border border-input bg-popover p-3 shadow-lg">
              <div className="flex flex-col gap-2 border-b border-border pb-3">
                <p className="px-3 text-sm font-medium text-text-primary">
                  Profile
                </p>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-normal text-text-secondary transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-normal text-text-secondary transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                <LogoutIcon className="w-4 h-4" />
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
