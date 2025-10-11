export interface Task {
  id: string;
  name: string;
  description: string;
  reminderDate: string;
  dueDate: string;
  status: 'pending' | 'completed';
  associatedProviderId?: string | null;
}

export interface BackendComment {
  _id: string;
  description: string;
  userType: 'organizer' | 'provider';
  date: string;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  date: string;
}
