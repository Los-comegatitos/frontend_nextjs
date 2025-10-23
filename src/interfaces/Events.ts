export interface Event {
  eventId: string;
  name: string;
  description: string;
  eventDate: string;
  eventTypeId: number;
  organizerUserId: number;
  client: {
    name: string;
    clientTypeId: number;
    description: string;
  };
  status: string;
}