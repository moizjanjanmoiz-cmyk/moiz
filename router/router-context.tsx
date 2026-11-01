import React, { createContext, useContext } from 'react';

const RouterContext = createContext({ pathname: typeof window !== 'undefined' ? window.location.pathname : '/' });

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = React.useState(typeof window !== 'undefined' ? window.location.pathname : '/');

  React.useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    const originalPush = window.history.pushState;
    window.history.pushState = (...args) => {
      originalPush.apply(window.history, args);
      update();
    };
    const originalReplace = window.history.replaceState;
    window.history.replaceState = (...args) => {
      originalReplace.apply(window.history, args);
      update();
    };
    return () => {
      window.removeEventListener('popstate', update);
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, []);

  return <RouterContext.Provider value={{ pathname }}>{children}</RouterContext.Provider>;
}

export function useRouterContext() {
  return useContext(RouterContext);
}
