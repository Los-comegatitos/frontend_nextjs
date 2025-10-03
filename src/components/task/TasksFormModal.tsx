'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Task } from '@/interfaces/Task';
import { useState, useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: Task;
  eventId?: string;
  token?: string;
  onRefresh?: () => void;
};

export default function TaskFormModal({ open, onClose, initialData, eventId, token, onRefresh }: Props) {
  const [form, setForm] = useState<Partial<Task>>({});
  const [providerName, setProviderName] = useState<string>('Cargando...');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setForm(initialData || {});
    if (initialData?.associatedProviderId) {
      fetch(`/api/user/${initialData.associatedProviderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.message?.code === '000' && data.data) {
            setProviderName(data.data.name);
          } else {
            setProviderName('No se ha asignado un proveedor');
          }
        })
        .catch(() => setProviderName('No se ha asignado un proveedor'));
    } else {
      setProviderName('No se ha asignado un proveedor');
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeleteConfirmed = async () => {
    if (!eventId || !initialData || !token) return;

    try {
      const res = await fetch(`/api/event/${eventId}/task/${initialData.id}`, {
        method: 'DELETE',
        headers: { token },
      });

      const data = await res.json();

      if (res.status === 200 && data?.message?.code === '000') {
        onRefresh?.();
        onClose();
      } else {
        alert(data?.message?.description || 'Error al eliminar');
      }
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      alert('Error interno al eliminar');
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      {/* Modal principal */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{initialData ? 'Detalle de tarea' : 'Crear tarea'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            fullWidth
            label="Nombre"
            name="name"
            value={form.name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Descripción"
            name="description"
            value={form.description || ''}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            type="date"
            label="Fecha límite"
            name="dueDate"
            value={form.dueDate?.split('T')[0] || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            type="date"
            label="Fecha de recordatorio"
            name="reminderDate"
            value={form.reminderDate?.split('T')[0] || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Proveedor"
            value={providerName}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          {initialData && (
            <Button color="error" onClick={() => setConfirmOpen(true)}>
              Eliminar
            </Button>
          )}
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs">
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>
          {'¿Estás seguro de eliminar la tarea "' + initialData?.name + '"?'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleDeleteConfirmed}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
