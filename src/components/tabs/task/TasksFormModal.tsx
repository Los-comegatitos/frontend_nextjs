"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
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

interface Quote {
  serviceTypeId: string;
  price: number;
  quantity: number;
  providerId: string;
  date: string;
}

interface EventService {
  serviceTypeId: string;
  serviceTypeName: string;
  name: string;
  description: string;
  quantity: number;
  quote?: Quote;
}

interface EventResponse {
  message: { code: string; description: string };
  data?: { services?: EventService[] };
}

export default function TaskFormModal({
  open,
  onClose,
  initialData,
  eventId,
  token,
  onRefresh,
}: Props) {
  const [form, setForm] = useState<Partial<Task>>({});
  const [providerName, setProviderName] = useState<string>("Cargando...");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  useEffect(() => {
    setForm(initialData || {});

    const loadAssignedProvider = async () => {
      if (!eventId || !token || !initialData?.associatedProviderId) {
        setProviderName("No se ha asignado un proveedor");
        return;
      }

      try {
        const res = await fetch(`/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: EventResponse = await res.json();

        if (data?.message?.code === "000" && data.data?.services) {
          const match = data.data.services.find(
            (s: EventService) =>
              s.quote?.providerId === initialData.associatedProviderId
          );

          if (match) {
            setProviderName(match.serviceTypeName || "Servicio desconocido");
          } else {
            setProviderName("Proveedor asignado no encontrado en los servicios del evento");
          }
        } else {
          setProviderName("No se ha asignado un proveedor");
        }
      } catch {
        setProviderName("No se ha asignado un proveedor");
      }
    };

    loadAssignedProvider();
  }, [initialData, eventId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!eventId || !token) return;

    const payload = {
      name: form.name,
      description: form.description,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate,
    };

    try {
      const res = await fetch(`/api/events/${eventId}/tasks`, {
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
    } catch {
      showErrorAlert('Ocurrió un error interno al crear la tarea.');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!eventId || !initialData || !token) return;

    try {
      const res = await fetch(`/api/events/${eventId}/tasks/${initialData.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${initialData.name}" fue eliminada exitosamente.`);
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo eliminar la tarea.');
      }
    } catch {
      showErrorAlert('Ocurrió un error interno al eliminar la tarea.');
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleFinalize = async () => {
    if (!eventId || !initialData || !token) return;

    const payload = { status: 'finished' };

    try {
      const res = await fetch(`/api/events/${eventId}/tasks/${initialData.id}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${initialData.name}" fue finalizada exitosamente.`);
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo finalizar la tarea.');
      }
    } catch {
      showErrorAlert('Ocurrió un error interno al finalizar la tarea.');
    }
  };

  const handleUpdate = async () => {
    if (!eventId || !initialData || !token) return;

    const updatePayload = {
      name: form.name,
      description: form.description,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate,
    };

    try {
      const res = await fetch(`/api/events/${eventId}/tasks/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${initialData.name}" fue modificada exitosamente.`);
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo modificar la tarea.');
      }
    } catch {
      showErrorAlert('Ocurrió un error interno al modificar la tarea.');
    }
  };

  const fetchProvidersFromEvent = async () => {
    if (!eventId || !token) return;

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: EventResponse = await res.json();

      if (data?.message?.code !== "000" || !data.data?.services) {
        throw new Error("No se pudieron obtener los servicios del evento");
      }

      const providersWithNames = data.data.services
        .filter((s: EventService) => !!s.quote?.providerId && !!s.serviceTypeName)
        .map((s: EventService) => ({
          id: s.quote!.providerId,
          name: s.serviceTypeName,
        }));

      setProviders(providersWithNames);
    } catch {
      showErrorAlert("No se pudieron obtener los proveedores del evento.");
    }
  };

  const handleAssignProvider = async () => {
    if (!eventId || !initialData || !selectedProvider || !token) return;

    try {
      const res = await fetch(
        `/api/events/${eventId}/tasks/${initialData.id}/assign-provider/${selectedProvider}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.message.code === "000") {
        showSucessAlert("Proveedor asignado correctamente.");
        onRefresh?.();
        setAssignOpen(false);
        onClose();
      } else {
        showErrorAlert(data.message.description || "No se pudo asignar el proveedor.");
      }
    } catch {
      showErrorAlert("Ocurrió un error interno al asignar el proveedor.");
    }
  };

  const handleUnassignProvider = async () => {
    if (!eventId || !initialData || !token) return;

    try {
      const res = await fetch(
        `/events/${eventId}/tasks/${initialData.id}/unassign-provider`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.message.code === "000") {
        showSucessAlert("Proveedor desasignado correctamente.");
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || "No se pudo desasignar el proveedor.");
      }
    } catch {
      showErrorAlert("Ocurrió un error interno al desasignar el proveedor.");
    }
  };

  return (
    <>
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
              <Button
                color="warning"
                onClick={() => {
                  fetchProvidersFromEvent();
                  setAssignOpen(true);
                }}
              >
                Asignar proveedor
              </Button>
              {initialData.associatedProviderId && (
                <Button color="secondary" onClick={handleUnassignProvider}>
                  Desasignar proveedor
                </Button>
              )}
              <Button color="error" onClick={() => setConfirmOpen(true)}>
                Eliminar
              </Button>
              <Button onClick={onClose}>Cerrar</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs">
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

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Asignar proveedor</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <InputLabel>Proveedor</InputLabel>
            <Select
              value={selectedProvider}
              label="Proveedor"
              onChange={(e) => setSelectedProvider(e.target.value as string)}
            >
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancelar</Button>
          <Button color="primary" onClick={handleAssignProvider}>
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}