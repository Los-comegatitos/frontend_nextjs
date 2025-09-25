'use client';

// import { obtainJwt, verifyJwt } from '@/app/actions/auth';
import { User } from '@/app/lib/definitions';
import { decrypt } from '@/app/lib/encrypting';
import { checkJwt, getJwt } from '@/app/lib/session';
import { JwtPayload } from 'jsonwebtoken';
import { redirect, usePathname } from 'next/navigation';
// import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AppContextType = {
  user: User | null;
  setUser: (user: User) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    async function obtain() {
      const truth = checkJwt()
      
      console.log(truth);
      
      if (!truth && !pathname.includes('authentication')) {
        console.log('ESTÁS AQUÍ')
        setUser(null)
        redirect('/authentication/login') 
      } else if (truth && user?.role != 'provider' && pathname.includes('event-types')) {
        redirect('/') 
      } else if (truth) {
        
        const data = await decrypt(getJwt()) as JwtPayload

        const newUser : User = {
          id: parseInt(data.sub!), 
          email: data['email'], 
          role: data['role'] 
        }

        if (data) {
          setUser(newUser)
        } else setUser(null)
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
  }
  }, [user]);

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
