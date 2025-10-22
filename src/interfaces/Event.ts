export interface Client {
  name: string;
  clientTypeId: string | number;
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
  // id: string;
  eventId: string;
  name: string;
  description: string;
  eventDate: string;
  creationDate: string;
  eventTypeId: string | number;
  organizerUserId: string;
  status: 'in progress' | 'finalized' | 'canceled';
  client?: Client; // interfaz client que ya definimos
  services?: Service[]; // lista servicios que ya definimos
  tasks?: Task[]; // lista tarea que ya definimos arriba también
}

// ----------- Event info para provider
export interface FilteredService {
  serviceTypeId: string;
  name: string;
  description: string;
  quantity: number | null;
  dueDate: string;
}

export interface FilteredEvent {
  eventId: string;
  name: string;
  description: string;
  eventDate: string;
  services: FilteredService[];
}


// TODO: esto es lo que realmente tiene event cuando te traes 1 

// {
//     "_id": "68d6d24cdea47ffec2ac3ae4",
//     "eventId": "2111",
//     "name": "un evento",
//     "description": "descripcion del evento",
//     "eventDate": "2025-09-02T00:00:00.000Z",
//     "eventTypeId": "1",
//     "organizerUserId": "42",
//     "status": "in progress",
//     "client": {
//         "name": "el partido",
//         "clientTypeId": 1,
//         "description": "politico"
//     },
//     "creationDate": "2025-09-26T17:50:04.484Z",
//     "services": [],
//     "tasks": [],
//     "__v": 0
// }