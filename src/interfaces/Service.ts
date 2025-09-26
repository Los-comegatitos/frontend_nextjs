//Service de catalog
export interface Service {
  serviceTypeId: string;
  name: string;
  description: string;
  quantity: number | null;
}