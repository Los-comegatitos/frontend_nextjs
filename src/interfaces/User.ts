export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string | null;
  birthDate?: string | null;
  typeuser: {
    id: number;
    name: 'admin' | 'provider' | 'organizer';
    description: string;
  }
}