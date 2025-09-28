'use client';

// import { obtainJwt, verifyJwt } from '@/app/actions/auth';
import { User } from '@/app/lib/definitions';
import { decrypt } from '@/app/lib/encrypting';
import { checkJwt, getJwt } from '@/app/lib/session';
// import { JwtPayload } from 'jsonwebtoken';
import { redirect, usePathname } from 'next/navigation';
// import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AppContextType = {
  user: User | null;
  setUser: (user: User) => void;
  token: string | null;
  setToken: (token: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    async function obtain() {
      const truth = checkJwt()
      
      console.log(truth);
      
      if (!truth && !pathname.includes('authentication')) {
        console.log('ESTÁS AQUÍ')
        setUser(null)
        setToken(null)
        redirect('/authentication/login') 
      } else if (truth && user?.role != 'organizer' && pathname.includes('event-types')) {
        redirect('/') 
      } else if (truth) {
        
        const data = (await decrypt(getJwt())) as { sub: string, email: string, role: string }
        // as JwtPayload

        const newUser : User = {
          id: parseInt(data.sub!), 
          email: data['email'], 
          role: data['role'] 
        }

        const tokenString = (getJwt());

        if (data) {
          setToken(tokenString)
          setUser(newUser)
        } else {
          setUser(null)
          setToken(null)
        }
      }
    }
    obtain();
  }, [pathname]);

  useEffect(() => {
    if (user) {
      console.log(user);
      
    if (user.role !== 'provider') {
      console.log(`ERES UN ${user.role}`);
    }

    if (token) console.log(token)
  }
  }, [user, token]);

  return (
    <AppContext.Provider value={{ user, setUser, token, setToken }}>
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
