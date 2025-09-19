'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type User = { id: string; name: string } | null;

type AppContextType = {
  user: User;
  setUser: (user: User) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('no context found');
  }
  return context;
}
