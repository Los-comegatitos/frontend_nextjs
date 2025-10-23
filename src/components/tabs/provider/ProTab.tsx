'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/interfaces/Event';
import ProviderList from './ProList';
import { BackendProviderResponse } from '@/interfaces/ProviderResponse';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Rating, 
  Typography 
} from '@mui/material';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';

type Props = {
  token: string;
  event: Event;
  onRefresh: () => void;
};

/*interface ProviderWithScore extends ProviderWithService {
  score?: number;
}*/

export default function ProviderTab({ token, event, onRefresh }: Props) {
  const [providers, setProviders] = useState<BackendProviderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<BackendProviderResponse | null>(null);
  const [rating, setRating] = useState<number | null>(0);
  const [hasScore, setHasScore] = useState(false);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch(`/api/event/${event.eventId}/services/Providers`, {
          headers: { token },
        });
        const data: { data: BackendProviderResponse[] } = await res.json();

        if (res.ok && data.data) {
        //   const formatted: ProviderWithScore[] = data.data.map((p) => ({
        //     id: Number(p.providerId),
        //     name: p.providerName,
        //     description: p.service?.description || '',
        //     email: '',
        //     telephone: '',
        //     password: '',
        //     user_Typeid: 0,
        //     service: {
        //       serviceTypeId: p.service?.serviceTypeId || '',
        //       name: p.service?.name || '',
        //       description: p.service?.description || '',
        //       dueDate: '',
        //       quantity: null,
        //       quote: null,
        //     },
        //   }));

          setProviders(data.data);
        }
      } catch (error) {
        console.error('Error al obtener proveedores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, [event.eventId, token]);

  const handleRate = async (provider: BackendProviderResponse) => {
    if (event.status !== 'finalized') {
      showErrorAlert('Solo puedes calificar proveedores cuando el evento está finalizado.');
      return;
    }

    setSelectedProvider(provider);

    try {
      const res = await fetch(
        `/api/event/${event.eventId}/provider/${provider.id}/evaluation`,
        { headers: { token } }
      );

      if (res.ok) {
        const json = await res.json();
        const score = json.data?.score ? Number(json.data.score) : 0;
        setRating(score);
        setHasScore(score > 0);
      } else {
        setRating(0);
        setHasScore(false);
      }
    } catch (error) {
      console.error('Error al obtener evaluación del proveedor:', error);
      setRating(0);
      setHasScore(false);
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProvider(null);
    setRating(0);
    setHasScore(false);
  };

  const handleSubmit = async () => {
    if (!selectedProvider || rating === null) return;

    const method = hasScore ? 'PATCH' : 'POST';
    const url = `/api/event/${event.eventId}/provider/${selectedProvider.id}/evaluation`;

    const payload = {
      score: Number(rating),
      organizerUserId: !hasScore ? event.organizerUserId.toString() : undefined,
      eventId: event.eventId.toString(),
      providerId: selectedProvider.id.toString(),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        showErrorAlert(result.message?.description || 'Error al calificar proveedor.');
      } else {
        showSucessAlert(`Proveedor "${selectedProvider.providerName}" calificado correctamente.`);
        // Actualizar el score local
        setProviders(prev =>
          prev.map(p => p.id === selectedProvider.id ? { ...p, score: Number(rating) } : p)
        );
        onRefresh();
      }
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      showErrorAlert('Error interno al calificar proveedor.');
    } finally {
      handleClose();
    }
  };

  if (loading) return <p>Cargando proveedores...</p>;

  return (
    <>
      <ProviderList
        providers={providers}
        onView={() => {}}
        onRate={handleRate}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Calificar proveedor</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {selectedProvider?.providerName ?? 'Proveedor'}
          </Typography>
          <Rating
            value={rating ?? 0}
            onChange={(_, v) => setRating(v)}
            precision={1}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={rating === null || rating === 0}
          >
            {hasScore ? 'Editar calificación' : 'Calificar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}