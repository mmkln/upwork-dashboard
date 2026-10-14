import React from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

const DEFAULT_BASE_PATH = "/upwork-dashboard";

function isHashRouting() {
  return process.env.REACT_APP_ROUTING_MODE === "hash";
}

function getAppBasename() {
  const configuredPath =
    process.env.REACT_APP_BASE_PATH || DEFAULT_BASE_PATH;

  if (configuredPath === "/") {
    return "";
  }

  return `/${configuredPath.replace(/^\/+|\/+$/g, "")}`;
}

type AppRouterProps = {
  children: React.ReactNode;
};

export function AppRouter({ children }: AppRouterProps) {
  if (isHashRouting()) {
    return <HashRouter>{children}</HashRouter>;
  }

  return (
    <BrowserRouter basename={getAppBasename() || undefined}>
      {children}
    </BrowserRouter>
  );
}
