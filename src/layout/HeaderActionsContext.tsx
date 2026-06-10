import React from "react";

type HeaderActionsContextValue = {
  actions: React.ReactNode;
  setActions: React.Dispatch<React.SetStateAction<React.ReactNode>>;
};

const HeaderActionsContext =
  React.createContext<HeaderActionsContextValue | null>(null);

export const HeaderActionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [actions, setActions] = React.useState<React.ReactNode>(null);

  const value = React.useMemo(
    () => ({
      actions,
      setActions,
    }),
    [actions],
  );

  return (
    <HeaderActionsContext.Provider value={value}>
      {children}
    </HeaderActionsContext.Provider>
  );
};

export const useHeaderActions = (actions: React.ReactNode) => {
  const context = React.useContext(HeaderActionsContext);
  const setActions = context?.setActions;

  React.useEffect(() => {
    if (!setActions) return;

    setActions(actions);
  }, [actions, setActions]);

  React.useEffect(() => {
    if (!setActions) return undefined;

    return () => {
      setActions(null);
    };
  }, [setActions]);
};

export const useHeaderActionsContext = () => {
  const context = React.useContext(HeaderActionsContext);

  if (!context) {
    throw new Error(
      "useHeaderActionsContext must be used inside HeaderActionsProvider",
    );
  }

  return context;
};
