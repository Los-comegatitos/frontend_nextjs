export interface BackendProviderResponse {
  providerId: number;
  providerName: string;
  service: {
    serviceTypeId: string;
    name: string;
    description: string;
  };
}

//nota: se tuvo que acabar esta interface para evitar una variable any en ProTab