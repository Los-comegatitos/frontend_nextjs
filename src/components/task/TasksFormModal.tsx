'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { Task } from '@/interfaces/Task';
import { useState, useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: Task;
};

export default function TaskFormModal({ open, onClose, initialData }: Props) {
  const [form, setForm] = useState<Partial<Task>>({});
  const [providerName, setProviderName] = useState<string>('Cargando...');

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Detalle de tarea' : 'Crear tarea'}
      </DialogTitle>
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
          <>
            <Button color="error" onClick={() => console.log('Eliminar')}>
              Eliminar
            </Button>
            <Button color="primary" onClick={() => console.log('Modificar')}>
              Modificar
            </Button>
            <Button color="success" onClick={() => console.log('Finalizar')}>
              Finalizar
            </Button>
          </>
        )}
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
