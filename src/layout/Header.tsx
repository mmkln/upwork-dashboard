import React from "react";
import { useLocation } from "react-router-dom";
import { useHeaderActionsContext } from "./HeaderActionsContext";

const PAGE_TITLES: Array<{ path: string; title: string }> = [
  {
    path: "/upwork-dashboard/market-signals",
    title: "Market Signals",
  },
  {
    path: "/upwork-dashboard/jobs",
    title: "Jobs",
  },
  {
    path: "/upwork-dashboard/radar",
    title: "Opportunity Radar",
  },
  {
    path: "/upwork-dashboard",
    title: "Dashboard",
  },
];

const Header: React.FC = () => {
  const location = useLocation();
  const { actions } = useHeaderActionsContext();
  const page =
    PAGE_TITLES.find(({ path }) => location.pathname === path) ??
    PAGE_TITLES[0];

  return (
    <header className="flex h-control-xl shrink-0 items-center justify-between gap-component bg-surface px-panel">
      <div className="min-w-0">
        <h1 className="truncate text-heading text-text-primary">
          {page.title}
        </h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-item">{actions}</div>
      ) : null}
    </header>
  );
};

export default Header;
