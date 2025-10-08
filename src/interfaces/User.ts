interface UserType {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  birthDate?: string;
  typeuser: UserType;
}
