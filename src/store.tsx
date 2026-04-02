import React, { createContext, useContext, useState, useEffect } from 'react';

export type MathOperation = '+' | '-' | '*' | '/';

export type User = {
  id: string;
  name: string;
  avatar: string;
  mathLevel?: number; // legacy
  mathLevels: Record<MathOperation, number>;
  spellingLevel: number;
  age?: number;
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
};

const defaultUsers: User[] = [
  { id: '1', name: 'Boy 1', avatar: '👦🏻', mathLevels: { '+': 1, '-': 1, '*': 1, '/': 1 }, spellingLevel: 1 },
  { id: '2', name: 'Boy 2', avatar: '👦🏼', mathLevels: { '+': 1, '-': 1, '*': 1, '/': 1 }, spellingLevel: 1 },
  { id: '3', name: 'Boy 3', avatar: '👦🏽', mathLevels: { '+': 1, '-': 1, '*': 1, '/': 1 }, spellingLevel: 1 },
];

const migrateUser = (u: any): User => {
  if (!u.mathLevels) {
    const base = u.mathLevel || 1;
    u.mathLevels = { '+': base, '-': base, '*': base, '/': base };
  }
  return u;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('edu-users');
    return saved ? JSON.parse(saved).map(migrateUser) : defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const savedUserId = localStorage.getItem('edu-current-user');
      if (savedUserId) {
          const userArr = localStorage.getItem('edu-users');
          const parsedUsers = userArr ? JSON.parse(userArr).map(migrateUser) : defaultUsers;
          return parsedUsers.find((u: User) => u.id === savedUserId) || null;
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
    const baseLevel = Math.max(1, age - 4); // E.g., age 5 -> level 1, age 8 -> level 4
    
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name,
      avatar,
      age,
      mathLevels: { '+': baseLevel, '-': baseLevel, '*': baseLevel, '/': baseLevel },
      spellingLevel: baseLevel,
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
          setCurrentUser(updatedUser);
          return updatedUser;
        } else {
          // subject is MathOperation
          const currentSubjectLevel = u.mathLevels[subject];
          const newLevel = Math.max(1, currentSubjectLevel + delta);
          const updatedUser = {
            ...u,
            mathLevels: { ...u.mathLevels, [subject]: newLevel }
          };
          setCurrentUser(updatedUser);
          return updatedUser;
        }
      }
      return u;
    }));
  };

  return (
    <AppContext.Provider value={{ currentUser, users, login, logout, updateLevel, addUser, editUser, deleteUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
