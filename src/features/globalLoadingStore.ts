type Listener = (activeRequests: number) => void;

let activeRequests = 0;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener(activeRequests));
};

export const incrementRequestLoaders = () => {
  activeRequests += 1;
  notify();
};

export const decrementRequestLoaders = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  notify();
};

export const subscribeToRequestLoaders = (listener: Listener) => {
  listeners.add(listener);
  listener(activeRequests);
  return () => {
    listeners.delete(listener);
  };
};

export const getActiveRequestCount = () => activeRequests;
