export interface Task {
  id: string;
  name: string;
  description: string;
  reminderDate: string;
  dueDate: string;
  status: 'pending' | 'completed';
  associatedProviderId?: string | null;
}
