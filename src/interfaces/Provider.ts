import { UserInterface } from './User';
import { Service } from './Event';

export interface ProviderWithService extends UserInterface {
  service?: Service;
}
