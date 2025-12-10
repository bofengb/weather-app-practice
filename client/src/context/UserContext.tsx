import axios from 'axios';
import { createContext, useEffect, useState, ReactNode } from 'react';
import type { JWTPayload, UserContextType } from '@/types';

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  // Ready flag fixes a race condition
  const [ready, setReady] = useState(false);

  useEffect(() => {
    axios
      .get<JWTPayload | null>('/api/v1/auth/profile')
      .then(({ data }) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
