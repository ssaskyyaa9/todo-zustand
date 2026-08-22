import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  // State awal: false berarti Light Mode secara default
  isDarkMode: false,

  // Fungsi untuk beralih antara Light Mode dan Dark Mode
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));