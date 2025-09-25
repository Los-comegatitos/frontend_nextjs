'use client';

// import { obtainJwt, verifyJwt } from '@/app/actions/auth';
import { User } from '@/app/lib/definitions';
import { decrypt } from '@/app/lib/encypting';
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
      // const truth = await verifyJwt()
      const truth = checkJwt()
      
      // const truth = document.cookie.includes('username')
      console.log(truth);
      // const router = useRouter();
      // const { pathname } = router;
      
      if (!truth || (!truth && !pathname.includes('/authentication'))) {
        setUser(null)
        redirect('/authentication/login') 
      } else if (truth && user?.role != 'provider' && pathname.includes('/event-types')) {
        redirect('/') 
      } else {
        // console.log(`Este es el dato: ${getJwt()}`);
        
        const data = await decrypt(getJwt()) as JwtPayload
        // console.log('la data es');
        // console.log(data);
        // console.log(data['role']);

        const newUser : User = {
          id: parseInt(data.sub!), 
          email: data['email'], 
          role: data['role'] 
        }

        // console.log('nuevo');
        
        // console.log(newUser);
        
        
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
