import React, { createContext, useContext, useState, useEffect } from 'react';

export type MathOperation = '+' | '-' | '*' | '/';

// ─── Badge definitions ───
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  operation?: MathOperation;
}

export const BADGE_DEFS: Badge[] = [
  // Times table badges (multiplication)
  { id: 'mult-2', name: '×2 Star', icon: '⭐', description: 'Master the 2 times table', operation: '*' },
  { id: 'mult-3', name: '×3 Star', icon: '⭐', description: 'Master the 3 times table', operation: '*' },
  { id: 'mult-4', name: '×4 Star', icon: '⭐', description: 'Master the 4 times table', operation: '*' },
  { id: 'mult-5', name: '×5 Star', icon: '🌟', description: 'Master the 5 times table', operation: '*' },
  { id: 'mult-6', name: '×6 Star', icon: '🌟', description: 'Master the 6 times table', operation: '*' },
  { id: 'mult-7', name: '×7 Star', icon: '🌟', description: 'Master the 7 times table', operation: '*' },
  { id: 'mult-8', name: '×8 Star', icon: '💫', description: 'Master the 8 times table', operation: '*' },
  { id: 'mult-9', name: '×9 Star', icon: '💫', description: 'Master the 9 times table', operation: '*' },
  { id: 'mult-tables', name: 'Tables Master', icon: '🏆', description: 'Complete all times tables up to 10', operation: '*' },
  { id: 'mult-12', name: '×12 Champion', icon: '👑', description: 'Master up to 12 times table', operation: '*' },
  // Division badges
  { id: 'div-start', name: 'Division Explorer', icon: '🔍', description: 'Reach level 3 in division', operation: '/' },
  { id: 'div-5', name: 'Division Pro', icon: '🎯', description: 'Reach level 5 in division', operation: '/' },
  { id: 'div-master', name: 'Division Master', icon: '🏆', description: 'Reach level 9 in division', operation: '/' },
  // Addition badges
  { id: 'add-start', name: 'Adding Up', icon: '🧮', description: 'Reach level 3 in addition', operation: '+' },
  { id: 'add-pro', name: 'Addition Pro', icon: '⚡', description: 'Reach level 6 in addition', operation: '+' },
  { id: 'add-master', name: 'Addition Master', icon: '🏆', description: 'Reach level 10 in addition', operation: '+' },
  // Subtraction badges
  { id: 'sub-start', name: 'Take Away Taker', icon: '🎒', description: 'Reach level 3 in subtraction', operation: '-' },
  { id: 'sub-pro', name: 'Subtraction Pro', icon: '⚡', description: 'Reach level 6 in subtraction', operation: '-' },
  { id: 'sub-master', name: 'Subtraction Master', icon: '🏆', description: 'Reach level 10 in subtraction', operation: '-' },
  // Spelling badges
  { id: 'spell-3', name: 'First Words', icon: '📝', description: 'Reach level 3 in spelling' },
  { id: 'spell-5', name: 'Word Builder', icon: '📖', description: 'Reach level 5 in spelling' },
  { id: 'spell-8', name: 'Spelling Bee', icon: '🐝', description: 'Reach level 8 in spelling' },
  { id: 'spell-12', name: 'Word Wizard', icon: '🧙', description: 'Reach level 12 in spelling' },
  { id: 'spell-15', name: 'Lexicon Legend', icon: '📚', description: 'Reach level 15 in spelling' },
  { id: 'spell-20', name: 'Spelling Champion', icon: '👑', description: 'Reach level 20 — the ultimate!' },
  // General achievement badges
  { id: 'streak-5', name: 'On Fire', icon: '🔥', description: '5 correct answers in a row' },
  { id: 'streak-10', name: 'Unstoppable', icon: '💪', description: '10 correct answers in a row' },
  { id: 'streak-20', name: 'Legendary', icon: '🦸', description: '20 correct answers in a row' },
  { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', description: 'Answer 5 in a row under 3 seconds' },
  { id: 'century', name: 'Century', icon: '💯', description: 'Score 100 total points' },
  { id: 'five-hundred', name: 'High Scorer', icon: '🥇', description: 'Score 500 total points' },
  { id: 'thousand', name: 'Superstar', icon: '🌠', description: 'Score 1,000 total points' },
];

// Spelling-specific scoring (slightly more generous since words take longer)
export function calculateSpellingScore(timeTakenSeconds: number, streak: number, wordLength: number): { base: number; lengthBonus: number; speedBonus: number; streakMultiplier: number; total: number } {
  const base = 10;
  const lengthBonus = Math.max(0, wordLength - 3) * 2; // +2 per letter above 3
  let speedBonus = 0;
  if (timeTakenSeconds < 5) speedBonus = 30;
  else if (timeTakenSeconds < 10) speedBonus = 20;
  else if (timeTakenSeconds < 15) speedBonus = 10;
  else if (timeTakenSeconds < 25) speedBonus = 5;

  let streakMultiplier = 1;
  if (streak >= 10) streakMultiplier = 3;
  else if (streak >= 5) streakMultiplier = 2;
  else if (streak >= 3) streakMultiplier = 1.5;

  const total = Math.round((base + lengthBonus + speedBonus) * streakMultiplier);
  return { base, lengthBonus, speedBonus, streakMultiplier, total };
}

// ─── Scoring helpers ───
export function calculateScore(timeTakenSeconds: number, streak: number): { base: number; speedBonus: number; streakMultiplier: number; total: number } {
  const base = 10;
  let speedBonus = 0;
  if (timeTakenSeconds < 2) speedBonus = 40;
  else if (timeTakenSeconds < 4) speedBonus = 25;
  else if (timeTakenSeconds < 6) speedBonus = 15;
  else if (timeTakenSeconds < 10) speedBonus = 5;

  let streakMultiplier = 1;
  if (streak >= 10) streakMultiplier = 3;
  else if (streak >= 5) streakMultiplier = 2;
  else if (streak >= 3) streakMultiplier = 1.5;

  const total = Math.round((base + speedBonus) * streakMultiplier);
  return { base, speedBonus, streakMultiplier, total };
}

// ─── Level description helpers ───
export function getLevelDescription(level: number, op: MathOperation | 'Random'): string {
  if (op === '*') {
    if (level <= 8) return `×${level + 1} table`;
    if (level === 9) return 'Mixed ×2-×10';
    if (level <= 15) return `×${level + 1} table`;
    return `2-digit × 2-digit`;
  }
  if (op === '/') {
    if (level <= 8) return `÷${level + 1}`;
    if (level === 9) return 'Mixed ÷2-÷10';
    if (level <= 15) return `÷${level + 1}`;
    return `Larger divisions`;
  }
  if (op === '+') {
    if (level <= 2) return 'Single digits';
    if (level <= 4) return 'Double digits';
    if (level <= 6) return 'Larger numbers';
    return 'Big additions';
  }
  if (op === '-') {
    if (level <= 2) return 'Single digits';
    if (level <= 4) return 'Double digits';
    if (level <= 6) return 'Larger numbers';
    return 'Big subtractions';
  }
  return `Level ${level}`;
}

// ─── User type ───
export interface UserStats {
  scores: Record<MathOperation, number>;       // cumulative points per operation
  totalCorrect: Record<MathOperation, number>;  // total correct answers per operation
  bestStreak: Record<MathOperation, number>;    // best ever streak per operation
  spellingScore: number;
  spellingCorrect: number;
  spellingBestStreak: number;
  badges: string[];                              // earned badge IDs
}

const defaultStats: UserStats = {
  scores: { '+': 0, '-': 0, '*': 0, '/': 0 },
  totalCorrect: { '+': 0, '-': 0, '*': 0, '/': 0 },
  bestStreak: { '+': 0, '-': 0, '*': 0, '/': 0 },
  spellingScore: 0,
  spellingCorrect: 0,
  spellingBestStreak: 0,
  badges: [],
};

export type User = {
  id: string;
  name: string;
  avatar: string;
  mathLevel?: number; // legacy
  mathLevels: Record<MathOperation, number>;
  spellingLevel: number;
  age?: number;
  stats: UserStats;
};

type AppContextType = {
  currentUser: User | null;
  users: User[];
  login: (id: string) => void;
  logout: () => void;
  updateLevel: (subject: 'spelling' | MathOperation, delta: number) => void;
  addUser: (name: string, age: number, avatar?: string) => void;
  editUser: (id: string, name: string, age: number, avatar?: string) => void;
  deleteUser: (id: string) => void;
  recordAnswer: (op: MathOperation, correct: boolean, timeTaken: number, streak: number, fastStreak: number) => { points: number; newBadges: string[] };
  recordSpellingAnswer: (correct: boolean, timeTaken: number, streak: number, wordLength: number) => { points: number; newBadges: string[] };
};

const defaultUsers: User[] = [
  { id: '1', name: 'Boy 1', avatar: '👦🏻', mathLevels: { '+': 1, '-': 1, '*': 1, '/': 1 }, spellingLevel: 1, stats: { ...defaultStats, scores: { ...defaultStats.scores }, totalCorrect: { ...defaultStats.totalCorrect }, bestStreak: { ...defaultStats.bestStreak }, badges: [] } },
  { id: '2', name: 'Boy 2', avatar: '👦🏼', mathLevels: { '+': 1, '-': 1, '*': 1, '/': 1 }, spellingLevel: 1, stats: { ...defaultStats, scores: { ...defaultStats.scores }, totalCorrect: { ...defaultStats.totalCorrect }, bestStreak: { ...defaultStats.bestStreak }, badges: [] } },
  { id: '3', name: 'Boy 3', avatar: '👦🏽', mathLevels: { '+': 1, '-': 1, '*': 1, '/': 1 }, spellingLevel: 1, stats: { ...defaultStats, scores: { ...defaultStats.scores }, totalCorrect: { ...defaultStats.totalCorrect }, bestStreak: { ...defaultStats.bestStreak }, badges: [] } },
];

const migrateUser = (u: any): User => {
  if (!u.mathLevels) {
    const base = u.mathLevel || 1;
    u.mathLevels = { '+': base, '-': base, '*': base, '/': base };
  }
  if (!u.stats) {
    u.stats = {
      scores: { '+': 0, '-': 0, '*': 0, '/': 0 },
      totalCorrect: { '+': 0, '-': 0, '*': 0, '/': 0 },
      bestStreak: { '+': 0, '-': 0, '*': 0, '/': 0 },
      spellingScore: 0,
      spellingCorrect: 0,
      spellingBestStreak: 0,
      badges: [],
    };
  }
  // Ensure spelling stats exist for older users
  if (u.stats.spellingScore === undefined) u.stats.spellingScore = 0;
  if (u.stats.spellingCorrect === undefined) u.stats.spellingCorrect = 0;
  if (u.stats.spellingBestStreak === undefined) u.stats.spellingBestStreak = 0;
  return u;
};

// ─── Badge check logic ───
function checkNewBadges(user: User): string[] {
  const earned: string[] = [];
  const { mathLevels, stats } = user;

  // Multiplication level badges
  if (mathLevels['*'] >= 2 && !stats.badges.includes('mult-2')) earned.push('mult-2');
  if (mathLevels['*'] >= 3 && !stats.badges.includes('mult-3')) earned.push('mult-3');
  if (mathLevels['*'] >= 4 && !stats.badges.includes('mult-4')) earned.push('mult-4');
  if (mathLevels['*'] >= 5 && !stats.badges.includes('mult-5')) earned.push('mult-5');
  if (mathLevels['*'] >= 6 && !stats.badges.includes('mult-6')) earned.push('mult-6');
  if (mathLevels['*'] >= 7 && !stats.badges.includes('mult-7')) earned.push('mult-7');
  if (mathLevels['*'] >= 8 && !stats.badges.includes('mult-8')) earned.push('mult-8');
  if (mathLevels['*'] >= 9 && !stats.badges.includes('mult-9')) earned.push('mult-9');
  if (mathLevels['*'] >= 10 && !stats.badges.includes('mult-tables')) earned.push('mult-tables');
  if (mathLevels['*'] >= 12 && !stats.badges.includes('mult-12')) earned.push('mult-12');

  // Division level badges
  if (mathLevels['/'] >= 3 && !stats.badges.includes('div-start')) earned.push('div-start');
  if (mathLevels['/'] >= 5 && !stats.badges.includes('div-5')) earned.push('div-5');
  if (mathLevels['/'] >= 9 && !stats.badges.includes('div-master')) earned.push('div-master');

  // Addition level badges
  if (mathLevels['+'] >= 3 && !stats.badges.includes('add-start')) earned.push('add-start');
  if (mathLevels['+'] >= 6 && !stats.badges.includes('add-pro')) earned.push('add-pro');
  if (mathLevels['+'] >= 10 && !stats.badges.includes('add-master')) earned.push('add-master');

  // Subtraction level badges
  if (mathLevels['-'] >= 3 && !stats.badges.includes('sub-start')) earned.push('sub-start');
  if (mathLevels['-'] >= 6 && !stats.badges.includes('sub-pro')) earned.push('sub-pro');
  if (mathLevels['-'] >= 10 && !stats.badges.includes('sub-master')) earned.push('sub-master');

  // Spelling level badges
  const sl = user.spellingLevel;
  if (sl >= 3 && !stats.badges.includes('spell-3')) earned.push('spell-3');
  if (sl >= 5 && !stats.badges.includes('spell-5')) earned.push('spell-5');
  if (sl >= 8 && !stats.badges.includes('spell-8')) earned.push('spell-8');
  if (sl >= 12 && !stats.badges.includes('spell-12')) earned.push('spell-12');
  if (sl >= 15 && !stats.badges.includes('spell-15')) earned.push('spell-15');
  if (sl >= 20 && !stats.badges.includes('spell-20')) earned.push('spell-20');

  // Score badges (include spelling score)
  const totalScore = Object.values(stats.scores).reduce((a, b) => a + b, 0) + (stats.spellingScore || 0);
  if (totalScore >= 100 && !stats.badges.includes('century')) earned.push('century');
  if (totalScore >= 500 && !stats.badges.includes('five-hundred')) earned.push('five-hundred');
  if (totalScore >= 1000 && !stats.badges.includes('thousand')) earned.push('thousand');

  return earned;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('edu-users');
    return saved ? JSON.parse(saved).map(migrateUser) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const userArr = localStorage.getItem('edu-users');
      const parsedUsers = userArr ? JSON.parse(userArr).map(migrateUser) : defaultUsers;
      
      if (parsedUsers.length === 1) {
          return parsedUsers[0];
      }
      return null;
  });

  useEffect(() => {
    localStorage.setItem('edu-users', JSON.stringify(users));
    if (currentUser) {
        localStorage.setItem('edu-current-user', currentUser.id);
    } else {
        localStorage.removeItem('edu-current-user');
    }
  }, [users, currentUser]);

  const login = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (name: string, age: number, avatar: string = '👽') => {
    const baseLevel = Math.max(1, age - 4);
    
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name,
      avatar,
      age,
      mathLevels: { '+': baseLevel, '-': baseLevel, '*': baseLevel, '/': baseLevel },
      spellingLevel: baseLevel,
      stats: {
        scores: { '+': 0, '-': 0, '*': 0, '/': 0 },
        totalCorrect: { '+': 0, '-': 0, '*': 0, '/': 0 },
        bestStreak: { '+': 0, '-': 0, '*': 0, '/': 0 },
        spellingScore: 0,
        spellingCorrect: 0,
        spellingBestStreak: 0,
        badges: [],
      },
    };
    
    setUsers(prev => [...prev, newUser]);
  };

  const editUser = (id: string, name: string, age: number, avatar?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, name, age, avatar: avatar || u.avatar };
      }
      return u;
    }));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateLevel = (subject: 'spelling' | MathOperation, delta: number) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        if (subject === 'spelling') {
          const newLevel = Math.max(1, u.spellingLevel + delta);
          const updatedUser = { ...u, spellingLevel: newLevel };
          // Check for new spelling badges after level change
          const newBadges = checkNewBadges(updatedUser);
          if (newBadges.length > 0) {
            updatedUser.stats = { ...updatedUser.stats, badges: [...updatedUser.stats.badges, ...newBadges] };
          }
          setCurrentUser(updatedUser);
          return updatedUser;
        } else {
          const currentSubjectLevel = u.mathLevels[subject];
          const newLevel = Math.max(1, currentSubjectLevel + delta);
          const updatedUser = {
            ...u,
            mathLevels: { ...u.mathLevels, [subject]: newLevel }
          };
          // Check for new badges after level change
          const newBadges = checkNewBadges(updatedUser);
          if (newBadges.length > 0) {
            updatedUser.stats = { ...updatedUser.stats, badges: [...updatedUser.stats.badges, ...newBadges] };
          }
          setCurrentUser(updatedUser);
          return updatedUser;
        }
      }
      return u;
    }));
  };

  const recordAnswer = (op: MathOperation, correct: boolean, timeTaken: number, streak: number, fastStreak: number): { points: number; newBadges: string[] } => {
    if (!currentUser) return { points: 0, newBadges: [] };

    let points = 0;
    let newBadges: string[] = [];

    if (correct) {
      const scoreInfo = calculateScore(timeTaken, streak);
      points = scoreInfo.total;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updatedStats: UserStats = {
          scores: { ...u.stats.scores, [op]: u.stats.scores[op] + points },
          totalCorrect: { ...u.stats.totalCorrect, [op]: u.stats.totalCorrect[op] + (correct ? 1 : 0) },
          bestStreak: { ...u.stats.bestStreak, [op]: Math.max(u.stats.bestStreak[op], streak) },
          spellingScore: u.stats.spellingScore || 0,
          spellingCorrect: u.stats.spellingCorrect || 0,
          spellingBestStreak: u.stats.spellingBestStreak || 0,
          badges: [...u.stats.badges],
        };

        // Check streak badges
        if (streak >= 5 && !updatedStats.badges.includes('streak-5')) {
          updatedStats.badges.push('streak-5');
          newBadges.push('streak-5');
        }
        if (streak >= 10 && !updatedStats.badges.includes('streak-10')) {
          updatedStats.badges.push('streak-10');
          newBadges.push('streak-10');
        }
        if (streak >= 20 && !updatedStats.badges.includes('streak-20')) {
          updatedStats.badges.push('streak-20');
          newBadges.push('streak-20');
        }
        // Speed demon badge: 5 fast answers in a row
        if (fastStreak >= 5 && !updatedStats.badges.includes('speed-demon')) {
          updatedStats.badges.push('speed-demon');
          newBadges.push('speed-demon');
        }

        // Score badges
        const totalScore = Object.values(updatedStats.scores).reduce((a, b) => a + b, 0);
        if (totalScore >= 100 && !updatedStats.badges.includes('century')) {
          updatedStats.badges.push('century');
          newBadges.push('century');
        }
        if (totalScore >= 500 && !updatedStats.badges.includes('five-hundred')) {
          updatedStats.badges.push('five-hundred');
          newBadges.push('five-hundred');
        }
        if (totalScore >= 1000 && !updatedStats.badges.includes('thousand')) {
          updatedStats.badges.push('thousand');
          newBadges.push('thousand');
        }

        const updatedUser = { ...u, stats: updatedStats };
        setCurrentUser(updatedUser);
        return updatedUser;
      }
      return u;
    }));

    return { points, newBadges };
  };

  const recordSpellingAnswer = (correct: boolean, timeTaken: number, streak: number, wordLength: number): { points: number; newBadges: string[] } => {
    if (!currentUser) return { points: 0, newBadges: [] };

    let points = 0;
    let newBadges: string[] = [];

    if (correct) {
      const scoreInfo = calculateSpellingScore(timeTaken, streak, wordLength);
      points = scoreInfo.total;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updatedStats: UserStats = {
          ...u.stats,
          spellingScore: (u.stats.spellingScore || 0) + points,
          spellingCorrect: (u.stats.spellingCorrect || 0) + (correct ? 1 : 0),
          spellingBestStreak: Math.max(u.stats.spellingBestStreak || 0, streak),
          badges: [...u.stats.badges],
        };

        // Check streak badges
        if (streak >= 5 && !updatedStats.badges.includes('streak-5')) {
          updatedStats.badges.push('streak-5');
          newBadges.push('streak-5');
        }
        if (streak >= 10 && !updatedStats.badges.includes('streak-10')) {
          updatedStats.badges.push('streak-10');
          newBadges.push('streak-10');
        }
        if (streak >= 20 && !updatedStats.badges.includes('streak-20')) {
          updatedStats.badges.push('streak-20');
          newBadges.push('streak-20');
        }

        // Score badges (total includes maths + spelling)
        const totalScore = Object.values(updatedStats.scores).reduce((a, b) => a + b, 0) + updatedStats.spellingScore;
        if (totalScore >= 100 && !updatedStats.badges.includes('century')) {
          updatedStats.badges.push('century');
          newBadges.push('century');
        }
        if (totalScore >= 500 && !updatedStats.badges.includes('five-hundred')) {
          updatedStats.badges.push('five-hundred');
          newBadges.push('five-hundred');
        }
        if (totalScore >= 1000 && !updatedStats.badges.includes('thousand')) {
          updatedStats.badges.push('thousand');
          newBadges.push('thousand');
        }

        const updatedUser = { ...u, stats: updatedStats };
        setCurrentUser(updatedUser);
        return updatedUser;
      }
      return u;
    }));

    return { points, newBadges };
  };

  return (
    <AppContext.Provider value={{ currentUser, users, login, logout, updateLevel, addUser, editUser, deleteUser, recordAnswer, recordSpellingAnswer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
