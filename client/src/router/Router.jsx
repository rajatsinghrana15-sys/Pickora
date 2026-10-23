import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const RouterContext = createContext(null);
export function RouterProvider({ children }) {
  const readLocation = () => window.location.pathname + window.location.search;
  const [pathname, setPathname] = useState(readLocation);
  const firstRender = useRef(true);
  const navigation = useRef({ type: "initial" });
  const storageKey = (location) => `pickora:scroll:${location}`;

  useEffect(() => {
    if ("scrollRestoration" in window.history)
      window.history.scrollRestoration = "manual";
    const savePosition = () => {
      try {
        window.sessionStorage.setItem(
          storageKey(readLocation()),
          String(window.scrollY),
        );
      } catch {
        /* Storage may be unavailable. */
      }
    };
    const onPopState = () => {
      navigation.current = { type: "pop" };
      setPathname(readLocation());
    };
    window.addEventListener("scroll", savePosition, { passive: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      savePosition();
      window.removeEventListener("scroll", savePosition);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    const mode = navigation.current;
    const location = readLocation();
    if (mode.type === "preserve") {
      navigation.current = { type: "route" };
      return;
    }
    if (firstRender.current || mode.type === "pop") {
      let saved = 0;
      try {
        saved = Number(
          window.sessionStorage.getItem(storageKey(location)) || 0,
        );
      } catch {
        /* Storage may be unavailable. */
      }
      let attempts = 0;
      const restore = () => {
        const maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        if (saved <= maxScroll || attempts >= 20) {
          window.scrollTo({
            top: Math.min(saved, maxScroll),
            behavior: "auto",
          });
          if (firstRender.current) firstRender.current = false;
          return;
        }
        attempts += 1;
        window.setTimeout(() => requestAnimationFrame(restore), 100);
      };
      requestAnimationFrame(restore);
      navigation.current = { type: "route" };
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    navigation.current = { type: "route" };
  }, [pathname]);

  const navigate = (path, options = {}) => {
    const current = window.location.pathname + window.location.search;
    const currentWithHash = current + window.location.hash;
    const changed = path !== currentWithHash;
    if (changed) {
      try {
        window.sessionStorage.setItem(
          storageKey(current),
          String(window.scrollY),
        );
      } catch {
        /* Storage may be unavailable. */
      }
      window.history.pushState({}, "", path);
      navigation.current = {
        type: options.preserveScroll ? "preserve" : "push",
      };
      setPathname(readLocation());
    }
    const hash = new URL(path, window.location.origin).hash.slice(1);
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView(),
      );
  };
  const value = useMemo(() => ({ pathname, navigate }), [pathname]);
  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}
export const useRouter = () => useContext(RouterContext);
export function Link({
  to,
  onClick,
  preserveScroll = false,
  children,
  ...props
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        navigate(to, { preserveScroll });
      }}
    >
      {children}
    </a>
  );
}
