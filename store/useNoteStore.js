import { create } from "zustand";

export const useNoteStore = create((set) => ({
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (newNote) =>
    set((state) => ({
      notes: [newNote, ...state.notes],
    })),

  updateNote: (id, updatedData) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updatedData } : note
      ),
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),

  toggleNote: (id) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, is_completed: !note.is_completed } : note
      ),
    })),
}));