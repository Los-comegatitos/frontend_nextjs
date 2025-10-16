'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/interfaces/Event';
import { ProviderWithService } from '@/interfaces/Provider';
import ProviderList from './ProList';
import { BackendProviderResponse } from '@/interfaces/ProviderResponse';

type Props = {
  token: string;
  event: Event;
  onRefresh: () => void;
};

export default function ProviderTab({ token, event }: Props) {
  const [providers, setProviders] = useState<ProviderWithService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch(`/api/event/accepted/${event.eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (res.ok && result.data) {
          const formatted: ProviderWithService[] = result.data.map((p: BackendProviderResponse) => ({
            id: p.providerId,
            name: p.providerName,
            description: p.service?.description || '',
            email: '',
            telephone: '',
            password: '',
            user_Typeid: 0,
            service: {
              serviceTypeId: p.service?.serviceTypeId || '',
              name: p.service?.name || '',
              description: p.service?.description || '',
              dueDate: '',
              quantity: null,
              quote: null,
            },
          }));

          setProviders(formatted);
        } else {
          console.error('Error al obtener proveedores:', result.message);
        }
      } catch (error) {
        console.error('Error de red al obtener proveedores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, [event.eventId, token]);

  if (loading) return <p>Cargando proveedores...</p>;

  return <ProviderList providers={providers} onAdd={() => {}} onView={() => {}} />;
}