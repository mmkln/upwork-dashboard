import React from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../shared/ui";
import { useAuth } from "../../features/auth/AuthProvider";
import { LogoutIcon } from "../../shared/icons";
import { useTheme, type ThemeMode } from "../../shared/theme";

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: React.ElementType<{ className?: string }>;
}> = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

const AccountMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const initials =
    user?.username?.trim().charAt(0).toUpperCase() ?? (user ? "U" : "G");
  const displayName = user?.username ?? "Guest";
  const displayTitle = user ? "Administrator" : "Visitor";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-target w-full items-center gap-item overflow-hidden rounded-control border border-transparent bg-transparent px-item text-left text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`Open account menu for ${displayName}`}
        >
          <span className="flex h-control-small w-control-small shrink-0 items-center justify-center rounded-item bg-premium-blue text-ui text-primary-foreground">
            {initials}
          </span>
          <span className="min-w-0 whitespace-nowrap opacity-0 transition-opacity delay-0 duration-motion-fast ease-motion-standard group-hover/sidebar:delay-motion-label group-hover/sidebar:opacity-100">
            <span className="block truncate text-ui text-text-primary">
              {displayName}
            </span>
            <span className="block truncate text-label text-text-muted">
              {displayTitle}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-popover"
        side="right"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex flex-col gap-micro">
          <span className="text-ui text-text-primary">{displayName}</span>
          <span className="text-label text-text-muted">{displayTitle}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center justify-between gap-control">
          <span>Appearance</span>
          <span className="inline-flex min-h-control-mini items-center justify-center rounded-full bg-control px-item py-0 text-label leading-none text-text-secondary">
            {resolvedTheme}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as ThemeMode)}
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;

            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="h-4 w-4 text-text-secondary" />
                <span>{option.label}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-text-secondary focus:text-text-primary"
          onSelect={handleLogout}
        >
          <LogoutIcon className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
