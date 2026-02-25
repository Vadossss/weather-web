import type { AddressResult } from "@/App";
import {
  type FC,
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface FavoritesContextType {
  favorites: AddressResult[];
  toggleFavorites: (favorites: AddressResult[]) => void;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}

export const FavoritesProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<AddressResult[]>(() => {
    const fav = window.localStorage.getItem("favorites");
    if (!fav) return [];
    try {
      return JSON.parse(fav) as AddressResult[];
    } catch {
      return [];
    }
  });

  const toggleFavorites = (favorites: AddressResult[]) => {
    setFavorites(favorites);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
