export interface UserInterface { 
  id: number;
  name: string;
  description: string;
  email: string;
  telephone: string;
  password: string;
  user_Typeid: number;
}

// Por fa ambos tienen que coexistir o si no todo explota

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