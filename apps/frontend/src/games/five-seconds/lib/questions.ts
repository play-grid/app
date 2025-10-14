import type { Category, Difficulty } from '../types';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
}

// Sample questions database
export const QUESTIONS: Question[] = [
  // Movies - Easy
  { id: 'm1', category: 'Movies', difficulty: 'Easy', question: 'Name 3 Disney princesses' },
  { id: 'm2', category: 'Movies', difficulty: 'Easy', question: 'Name 3 Marvel superheroes' },
  { id: 'm3', category: 'Movies', difficulty: 'Easy', question: 'Name 3 animated movies' },

  // Movies - Medium
  { id: 'm4', category: 'Movies', difficulty: 'Medium', question: 'Name 3 Christopher Nolan films' },
  { id: 'm5', category: 'Movies', difficulty: 'Medium', question: 'Name 3 Oscar-winning actors' },

  // Movies - Hard
  { id: 'm6', category: 'Movies', difficulty: 'Hard', question: 'Name 3 films that won Best Picture in the 1990s' },

  // Music - Easy
  { id: 'mu1', category: 'Music', difficulty: 'Easy', question: 'Name 3 musical instruments' },
  { id: 'mu2', category: 'Music', difficulty: 'Easy', question: 'Name 3 famous singers' },
  { id: 'mu3', category: 'Music', difficulty: 'Easy', question: 'Name 3 music genres' },

  // Music - Medium
  { id: 'mu4', category: 'Music', difficulty: 'Medium', question: 'Name 3 Beatles songs' },
  { id: 'mu5', category: 'Music', difficulty: 'Medium', question: 'Name 3 Grammy-winning artists' },

  // Music - Hard
  { id: 'mu6', category: 'Music', difficulty: 'Hard', question: 'Name 3 classical composers from the Baroque period' },

  // History - Easy
  { id: 'h1', category: 'History', difficulty: 'Easy', question: 'Name 3 US presidents' },
  { id: 'h2', category: 'History', difficulty: 'Easy', question: 'Name 3 countries in Europe' },
  { id: 'h3', category: 'History', difficulty: 'Easy', question: 'Name 3 ancient civilizations' },

  // History - Medium
  { id: 'h4', category: 'History', difficulty: 'Medium', question: 'Name 3 battles from World War II' },
  { id: 'h5', category: 'History', difficulty: 'Medium', question: 'Name 3 Egyptian pharaohs' },

  // History - Hard
  { id: 'h6', category: 'History', difficulty: 'Hard', question: 'Name 3 treaties that ended major wars' },

  // Science - Easy
  { id: 's1', category: 'Science', difficulty: 'Easy', question: 'Name 3 planets in our solar system' },
  { id: 's2', category: 'Science', difficulty: 'Easy', question: 'Name 3 types of animals' },
  { id: 's3', category: 'Science', difficulty: 'Easy', question: 'Name 3 parts of the human body' },

  // Science - Medium
  { id: 's4', category: 'Science', difficulty: 'Medium', question: 'Name 3 elements from the periodic table' },
  { id: 's5', category: 'Science', difficulty: 'Medium', question: 'Name 3 famous scientists' },

  // Science - Hard
  { id: 's6', category: 'Science', difficulty: 'Hard', question: 'Name 3 subatomic particles' },

  // General Knowledge - Easy
  { id: 'g1', category: 'General Knowledge', difficulty: 'Easy', question: 'Name 3 colors of the rainbow' },
  { id: 'g2', category: 'General Knowledge', difficulty: 'Easy', question: 'Name 3 days of the week' },
  { id: 'g3', category: 'General Knowledge', difficulty: 'Easy', question: 'Name 3 types of weather' },

  // General Knowledge - Medium
  { id: 'g4', category: 'General Knowledge', difficulty: 'Medium', question: 'Name 3 capital cities' },
  { id: 'g5', category: 'General Knowledge', difficulty: 'Medium', question: 'Name 3 programming languages' },

  // General Knowledge - Hard
  { id: 'g6', category: 'General Knowledge', difficulty: 'Hard', question: 'Name 3 Nobel Prize categories' },
];

export function getRandomQuestion(categories: Category[], difficulty: Difficulty): Question {
  const filtered = QUESTIONS.filter(q => categories.includes(q.category) && q.difficulty === difficulty);

  if (filtered.length === 0) {
    return QUESTIONS[0]; // Fallback
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}
