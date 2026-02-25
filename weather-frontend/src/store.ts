import { createSlice } from "@reduxjs/toolkit";
import type { AddressResult } from "./App";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [] as AddressResult[],
    totalItems: 0,
  },
  reducers: {
    addToFavorite: (state, action) => {
      const address: AddressResult = action.payload;
      const existingItem = state.items.find(
        (item) => item.lon === address.lon && item.lat === address.lat,
      );

      if (!existingItem) {
        state.items.push({ ...address });
        state.totalItems += 1;
      }
    },
    removeFromFavorite: (state, action) => {
      const address: AddressResult = action.payload;
      const existingItem = state.items.find(
        (item) => item.lon === address.lon && item.lat === address.lat,
      );

      if (existingItem) {
        state.items = state.items.filter(
          (item) => item.lon === address.lon && item.lat === address.lat,
        );
      }
    },
  },
});

export const { addToFavorite, removeFromFavorite } = cartSlice.actions;
export default cartSlice.reducer;
