import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  // Ready flag fixes a race condition
  const [ready, setReady] = useState(false);

  useEffect(() => {
    axios
      .get('/api/v1/auth/profile')
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
