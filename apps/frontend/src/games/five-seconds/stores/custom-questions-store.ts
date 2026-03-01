import type { Question } from '@playgrid/five-seconds';
import { ENABLE_CUSTOM_QUESTIONS_FEATURE } from '@playgrid/five-seconds';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createIndexedDBStorage } from '@/lib/zustand-indexeddb';
import { logger } from '@/utils/logger';

// Clear IndexedDB data when feature is disabled
if (!ENABLE_CUSTOM_QUESTIONS_FEATURE && typeof window !== 'undefined') {
  try {
    const request = indexedDB.deleteDatabase('custom-questions');
    // request.onsuccess = () => {
    //   // logger.info('Custom questions IndexedDB cleared (feature disabled)');
    // };
    request.onerror = (event) => {
      logger.warn({ event }, 'Failed to clear custom questions IndexedDB');
    };
  }
  catch (error) {
    logger.warn({ error }, 'Failed to clear custom questions IndexedDB');
  }
}

interface CustomQuestionsState {
  customQuestions: Question[];
  customCategories: string[];
  addQuestions: (questions: Question[]) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  addCustomCategory: (category: string) => void;
  removeCustomCategory: (category: string) => void;
  clearAll: () => void;
}

// When feature is disabled, completely disable the store functionality
const disabledStore: CustomQuestionsState = {
  customQuestions: [],
  customCategories: [],
  addQuestions: () => {},
  updateQuestion: () => {},
  removeQuestion: () => {},
  addCustomCategory: () => {},
  removeCustomCategory: () => {},
  clearAll: () => {},
};

export const useCustomQuestionsStore = ENABLE_CUSTOM_QUESTIONS_FEATURE
  ? create<CustomQuestionsState>()(
      persist(
        immer(set => ({
          customQuestions: [],
          customCategories: [],
          addQuestions: questions =>
            set((state) => {
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
          addCustomCategory: category =>
            set((state) => {
              if (!state.customCategories.includes(category.trim())) {
                state.customCategories.push(category.trim());
              }
            }),
          removeCustomCategory: category =>
            set((state) => {
              state.customCategories = state.customCategories.filter(c => c !== category);
            }),
          clearAll: () =>
            set((state) => {
              state.customQuestions = [];
              state.customCategories = [];
            }),
        })),
        {
          name: 'custom-questions',
          storage: createIndexedDBStorage('custom-questions', 'refs'),
          partialize: state => ({
            customQuestions: state.customQuestions,
            customCategories: state.customCategories,
          }),
        },
      ),
    )
  : () => disabledStore;
