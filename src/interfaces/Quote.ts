export interface Quote {
  service: {
    name: string;
    description: string;
    serviceTypeId: string;
  }, 
//   providerId: number;
  eventId: string;
  toServiceId: string;
  price: number;
  quantity: number;
}