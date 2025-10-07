'use client';

import { useState } from 'react';
import { Event } from '@/interfaces/Event';
import { UserInterface } from '@/interfaces/User';
import ProviderList from './ProList';
import ProviderFormModal from './ProFormModal';

type Props = {
  token: string;
  event: Event;
  onRefresh: () => void;
};

export default function ProviderTab({ token, event, onRefresh }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<UserInterface | null>(null);

  const providers: UserInterface[] =
    event.services
      ?.filter((s) => s.quote?.providerId) 
      .map((s) => ({
        id: Number(s.quote!.providerId),
        name: '',
        description: s.description || '',
        email: '',
        telephone: '',
        password: '',
        user_Typeid: 0,
      })) || [];

  const handleAdd = () => {
    setSelectedProvider(null);
    setOpenModal(true);
  };

  const handleView = (provider: UserInterface) => {
    setSelectedProvider(provider);
    setOpenModal(true);
  };

  return (
    <>
      <ProviderList
        providers={providers}
        services={event.services || []}
        onAdd={handleAdd}
        onView={handleView}
      />

      <ProviderFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialData={selectedProvider || undefined}
        eventId={event.eventId}
        token={token}
        onRefresh={onRefresh}
      />
    </>
  );
}
