import React from "react";

// utility hooks
export function useToggle(initial = false): [boolean, () => void] {
  const [state, setState] = React.useState(initial);
  const toggle = () => setState(s => !s);
  return [state, toggle];
}

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}
