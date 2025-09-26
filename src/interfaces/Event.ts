export interface Client {
  name: string;
  clientTypeId: string;
  description?: string | null;
}

// Quote de service de evento específicamente
export interface Quote {
  date: string;
  quantity: number;
  price: number;
  serviceTypeId: string;
  providerId: string;
}

// service de evento (No confundir con service de catalog)
export interface Service {
  dueDate: string; 
  serviceTypeId: string;
  name: string;
  description: string;
  quantity?: number | null; 
  quote?: Quote | null;
}

//
export interface Attachment {
  id: string;
  fileName: string;
}

//
export interface Comment {
  idUser: string;
  userType: string;
  date: string;
  description: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  creationDate: string; 
  completionDate?: string | null; 
  reminderDate: string; 
  dueDate: string;
  status: 'pending' | 'completed';
  attachments: Attachment[];
  comments: Comment[];
  associatedProviderId?: string | null;
}


export interface Event {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  creationDate: string;
  eventTypeId: string;
  organizerUserId: string;
  status: 'in progress' | 'finished' | 'canceled';
  client: Client; // interfaz client que ya definimos
  services?: Service[]; // lista servicios que ya definimos
  tasks?: Task[]; // lista tarea que ya definimos arriba también
}