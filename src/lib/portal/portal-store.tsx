import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface User {
  name: string;
  email: string;
  role: string;
}

interface PortalState {
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  hydrated: boolean;
  login: (email: string) => void;
  logout: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  recent: string[];
  pushRecent: (id: string) => void;
}

const PortalContext = createContext<PortalState | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function PortalProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTheme(read<Theme>("sap_theme", "dark"));
    setUser(read<User | null>("sap_user", null));
    setFavorites(read<string[]>("sap_favorites", ["gst-2a2b", "acc-bankconv", "it-ais"]));
    setRecent(read<string[]>("sap_recent", ["gst-reco", "tds-working", "aud-report"]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    localStorage.setItem("sap_theme", JSON.stringify(theme));
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const login = useCallback((email: string) => {
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Staff Member";
    const u: User = { name, email, role: "Senior Associate" };
    setUser(u);
    localStorage.setItem("sap_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("sap_user");
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("sap_favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const pushRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 8);
      localStorage.setItem("sap_recent", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, user, hydrated, login, logout, favorites, toggleFavorite, isFavorite, recent, pushRecent }),
    [theme, toggleTheme, user, hydrated, login, logout, favorites, toggleFavorite, isFavorite, recent, pushRecent],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}