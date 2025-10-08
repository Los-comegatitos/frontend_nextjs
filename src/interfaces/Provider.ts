import { UserInterface } from '@/interfaces/User';
import { Service } from '@/interfaces/Event';

export interface ProviderWithService extends UserInterface {
  service?: Service;
}