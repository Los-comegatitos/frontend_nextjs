import { Service } from "./Service";

export interface Catalog {
  id: string;
  description: string;
  services: Service[];
}
