import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer, {
  type FavoritesState,
} from "../features/favorites/favoritesSlice";

// const loadFavoritesFromStorage = (): FavoritesState | undefined => {
//   try {
//     const data = localStorage.getItem("favorites");
//     return data ? JSON.parse(data) : undefined;
//   } catch (error) {
//     console.error("Ошибка чтения localStorage:", error);
//     return undefined;
//   }
// };

// const preloadedState = {
//   favorites: loadFavoritesFromStorage() || {
//     items: [],
//     totalItems: 0,
//   },
// };

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
  // preloadedState,
});

// store.subscribe(() => {
//   try {
//     const state = store.getState();
//     localStorage.setItem("favorites", JSON.stringify(state.favorites));
//   } catch (error) {
//     console.error("Ошибка сохранения localStorage:", error);
//   }
// });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
