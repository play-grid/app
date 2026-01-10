import type { Question } from '@guess-logo/five-seconds';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface CustomQuestionsState {
  customQuestions: Question[];
  addQuestions: (questions: Question[]) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  clearAll: () => void;
}

export const useCustomQuestionsStore = create<CustomQuestionsState>()(
  persist(
    immer(set => ({
      customQuestions: [],
      addQuestions: questions =>
        set((state) => {
          // Avoid duplicates by text
          const existingTexts = new Set(state.customQuestions.map(q => q.text));
          const newQuestions = questions.filter(q => !existingTexts.has(q.text));
          state.customQuestions.push(...newQuestions);
        }),
      updateQuestion: (id, updates) =>
        set((state) => {
          const index = state.customQuestions.findIndex(q => q.id === id);
          if (index !== -1) {
            state.customQuestions[index] = { ...state.customQuestions[index], ...updates, updatedAt: new Date() };
          }
        }),
      removeQuestion: id =>
        set((state) => {
          state.customQuestions = state.customQuestions.filter(q => q.id !== id);
        }),
      clearAll: () =>
        set((state) => {
          state.customQuestions = [];
        }),
    })),
    {
      name: 'custom-questions',
    },
  ),
);
