// AccountButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/ui";
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
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      className="group/account mt-auto flex h-target w-full items-center overflow-hidden rounded-full bg-control px-control text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
      title={user ? `Signed in as ${user.username}` : "Sign in"}
    >
      <div className="flex h-control-small w-control-small items-center justify-center">
        <div className="flex h-control-small w-control-small items-center justify-center rounded-full bg-premium-blue text-ui text-primary-foreground">
          {initials}
        </div>
      </div>
      <div className="ml-control whitespace-nowrap text-ui opacity-0 transition-opacity duration-motion-fast ease-motion-standard group-hover/account:opacity-100">
        <p className="text-label text-text-muted">
          {user ? user.username : "Guest"}
        </p>
        <p className="text-ui text-text-primary">
          {user ? "Sign out" : "Sign in"}
        </p>
      </div>
    </Button>
  );
};

export default AccountButton;
