import type { AddressResult } from "@/App";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface FavoritesState {
  items: AddressResult[];
  totalItems: number;
}

const loadFavoritesFromStorage = (): FavoritesState => {
  try {
    const data = localStorage.getItem("favorites");
    if (!data) return { items: [], totalItems: 0 };
    const parsed = JSON.parse(data);

    return {
      items: Array.isArray(parsed) ? parsed : [],
      totalItems: typeof parsed.totalItems === "number" ? parsed.totalItems : 0,
    };
  } catch {
    return { items: [], totalItems: 0 };
  }
};

const initialState: FavoritesState = loadFavoritesFromStorage();
console.log(initialState);

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorite: (state, action: PayloadAction<AddressResult>) => {
      const address = action.payload;
      const existingItem = state.items.find(
        (item) => item.lon === address.lon && item.lat === address.lat,
      );

      if (!existingItem) {
        state.items.push({ ...address });
        state.totalItems += 1;
      }
    },
    removeFromFavorite: (state, action: PayloadAction<AddressResult>) => {
      const address: AddressResult = action.payload;
      const existingItem = state.items.find(
        (item) => item.lon === address.lon && item.lat === address.lat,
      );

      if (existingItem) {
        state.items = state.items.filter(
          (item) => !(item.lon === address.lon && item.lat === address.lat),
        );
      }

      window.localStorage.setItem("favorites", JSON.stringify(state.items));
    },
  },
});

export const { addToFavorite, removeFromFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;
