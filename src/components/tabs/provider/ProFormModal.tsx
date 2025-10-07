'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { UserInterface } from '@/interfaces/User';

type ProviderOption = {
  providerId: number;
  providerName: string;
};

type Props = {
  open: boolean;
  onRefresh: () => void;
  onClose: () => void;
  eventId: string;
  token: string;
  onAssigned?: () => void;
  initialData?: UserInterface;
  
};

export default function ProviderFormModal({ open, onClose, eventId, token, onAssigned }: Props) {
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && eventId && token) {
      (async () => {
        try {
          const res = await fetch(`/api/event/${eventId}/providers`, {
            headers: { token },
          });
          const data = await res.json();

          if (data.message.code === '000') {
            setProviders(data.data);
          } else {
            showErrorAlert(data.message.description || 'No se pudieron obtener los proveedores.');
          }
        } catch (err) {
          console.error('Error cargando proveedores:', err);
          showErrorAlert('Error interno al cargar proveedores.');
        }
      })();
    }
  }, [open, eventId, token]);

  const handleAssign = async () => {
    if (!selectedProvider) {
      showErrorAlert('Selecciona un proveedor.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/event/${eventId}/assign-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify({ providerId: selectedProvider }),
      });

      const data = await res.json();
      if (data.message.code === '000') {
        showSucessAlert('Proveedor asignado correctamente.');
        onAssigned?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo asignar el proveedor.');
      }
    } catch (err) {
      console.error('Error asignando proveedor:', err);
      showErrorAlert('Error interno al asignar el proveedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Asignar proveedor a la tarea</DialogTitle>
      <DialogContent dividers>
        {providers.length === 0 ? (
          <p>No hay proveedores con cotizaciones aceptadas.</p>
        ) : (
          <Select
            fullWidth
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {providers.map((p) => (
              <MenuItem key={p.providerId} value={p.providerId}>
                {p.providerName}
              </MenuItem>
            ))}
          </Select>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleAssign} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={18} /> : 'Asignar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}