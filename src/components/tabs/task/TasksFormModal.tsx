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
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: Task;
  eventId?: string;
  token?: string;
  onRefresh?: () => void;
};

export default function TaskFormModal({
  open,
  onClose,
  initialData,
  eventId,
  token,
  onRefresh,
}: Props) {
  const [form, setForm] = useState<Partial<Task>>({});
  const [providerName, setProviderName] = useState<string>('Cargando...');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


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


  //Crear tarea de un evento
  const handleCreate = async () => {
    if (!eventId || !token) return;

    const payload = {
      name: form.name,
      description: form.description,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate,
    };

    try {
      const res = await fetch(`${API_BASE_URL}events/${eventId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${form.name}" fue creada exitosamente.`);
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo crear la tarea.');
      }
    } catch (err) {
      console.error('Error al crear tarea:', err);
      showErrorAlert('Ocurrió un error interno al crear la tarea.');
    }
  };

  //Eliminar tarea de un evento
  const handleDeleteConfirmed = async () => {
    if (!eventId || !initialData || !token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}events/${eventId}/tasks/${initialData.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(
          `La tarea "${initialData.name}" fue eliminada exitosamente.`
        );
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo eliminar la tarea.');
      }
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      showErrorAlert('Ocurrió un error interno al eliminar la tarea.');
    } finally {
      setConfirmOpen(false);
    }
  };

  //Finalizar tarea de un evento
  const handleFinalize = async () => {
    if (!eventId || !initialData || !token) return;

    //payload por si el backend espera algo adicional
    const payload = { status: 'finished' };

    try {
      const res = await fetch(
        `${API_BASE_URL}events/${eventId}/tasks/${initialData.id}/finalize`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(
          `La tarea "${initialData.name}" fue finalizada exitosamente.`
        );
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo finalizar la tarea.');
      }
    } catch (err) {
      console.error('Error al finalizar tarea:', err);
      showErrorAlert('Ocurrió un error interno al finalizar la tarea.');
    }
  };


  //Modificar
  const handleUpdate = async () => {
    if (!eventId || !initialData || !token) return;

    const updatePayload = {
      name: form.name,
      description: form.description,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate,
    };

    try {
      const res = await fetch(`${API_BASE_URL}events/${eventId}/tasks/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(
          `La tarea "${initialData.name}" fue modificada exitosamente.`
        );
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo modificar la tarea.');
      }
    } catch (err) {
      console.error('Error al modificar tarea:', err);
      showErrorAlert('Ocurrió un error interno al modificar la tarea.');
    }
  };

  return (
    <>
      {/* Modal principal */}
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
          {!initialData ? (
            <>
              <Button color="primary" onClick={handleCreate}>
                Guardar
              </Button>
              <Button onClick={onClose}>Cerrar</Button>
            </>
          ) : (
            <>
              <Button color="primary" onClick={handleUpdate}>
                Modificar
              </Button>
              <Button color="success" onClick={handleFinalize}>
                Finalizar
              </Button>
              <Button color="error" onClick={() => setConfirmOpen(true)}>
                Eliminar
              </Button>
              <Button onClick={onClose}>Cerrar</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>
          {'¿Estás seguro de eliminar la tarea "' + initialData?.name + '"?'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleDeleteConfirmed}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
