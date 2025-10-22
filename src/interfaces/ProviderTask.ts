export interface ProviderTask {
  eventId: string;
  eventName: string;
  task: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
}