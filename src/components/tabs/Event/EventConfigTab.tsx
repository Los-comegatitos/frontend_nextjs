'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import Swal from 'sweetalert2';
import { Event } from '@/interfaces/Event';
import { AuxiliarType } from '@/interfaces/AuxiliarType';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

type EventConfigTabProps = {
  token: string;
  event: Event;
  onRefresh: () => void;
};

export default function EventConfigTab({ token, event, onRefresh }: EventConfigTabProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [eventTypes, setEventTypes] = useState<AuxiliarType[]>([]);
  const [clientTypes, setClientTypes] = useState<AuxiliarType[]>([]);

  //Cargar tipos de eventos
  const fetchEventTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/event-type`, { headers: { token } });
      const data = await res.json();
      if (data.message.code === '000') setEventTypes(data.data);
      else showErrorAlert(data.message.description);
    } catch (err) {
      console.error('error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchEventTypes();
  }, [fetchEventTypes, token]);

  // Cargar tipos de clientes
  const fetchClientTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/client-type`, { headers: { token } });
      const data = await res.json();
      if (data.message.code === '000') setClientTypes(data.data);
      else showErrorAlert(data.message.description);
    } catch (err) {
      console.error('error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchClientTypes();
  }, [fetchClientTypes, token]);

  //Formulario
  const [formValues, setFormValues] = useState({
    name: event.name,
    description: event.description,
    eventDate: event.eventDate || '',
    eventTypeId: event.eventTypeId.toString(),
    clientTypeId: event.client?.clientTypeId?.toString() || '',
    clientName: event.client?.name || '',
    clientDescription: event.client?.description || '',
  });

  // Acciones (finalizar/cancelar evento)
  const handleAction = async (action: 'finalize' | 'cancel') => {
    const confirm = await Swal.fire({
      title: '¿Seguro de esta acción?',
      text:
        action === 'finalize'
          ? '¿Está seguro de que desea finalizar este evento?'
          : '¿Está seguro de que desea cancelar este evento?',
      icon: 'question',
      showDenyButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Sí',
      denyButtonText: 'No',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}events/${event.eventId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.message.code === '000') {
        await showSucessAlert(
          action === 'finalize'
            ? 'Evento finalizado exitosamente'
            : 'Evento cancelado exitosamente'
        );
        onRefresh();
      } else {
        await showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error(`Error al ${action === 'finalize' ? 'finalizar' : 'cancelar'} evento`, err);
    } finally {
      setLoading(false);
    }
  };

  // Modificar evento
  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date();
    const eventDate = new Date(formValues.eventDate);
    if (eventDate < today) {
      showErrorAlert('La fecha del evento no puede ser anterior a hoy.');
      setLoading(false);
      return;
    }

    const payload: Partial<Event> = {
      name: formValues.name,
      description: formValues.description,
      eventDate: formValues.eventDate,
      eventTypeId: parseInt(formValues.eventTypeId),
      client: formValues.clientTypeId
        ? {
            name: formValues.clientName,
            clientTypeId: parseInt(formValues.clientTypeId),
            description: formValues.clientDescription,
          }
        : undefined,
    };

    try {
      const res = await fetch(`${API_BASE_URL}events/${event.eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.message.code === '000') {
        showSucessAlert('Evento modificado exitosamente.');
        setOpenModal(false);
        onRefresh();
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error modificando evento', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Box display="flex" justifyContent="center" gap={4}>
        {/* boton de Modificar evento - Deshabilitado si ya está finalizado o cancelado */}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpenModal(true)}
          disabled={loading || event.status !== 'in progress'}
        >
          Modificar evento
        </Button>

        {/* boton de Finalizar evento - deshabilitado si ya esta finalizado o cancelado un evento*/}
        <Button
          variant="contained"
          color="success"
          onClick={() => handleAction('finalize')}
          disabled={loading || event.status !== 'in progress'}
        >
          Finalizar evento
        </Button>

        {/* boton de Cancelar evento - deshabilitado si ya esta finalizado o cancelado el evento */}
        <Button
          variant="contained"
          color="error"
          onClick={() => handleAction('cancel')}
          disabled={loading || event.status !== 'in progress'}
        >
          Cancelar evento
        </Button>
      </Box>

      {/* Modal de edición */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modificar Evento</DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            onSubmit={handleModify}
            display="flex"
            flexDirection="column"
            gap={2}
            mt={1}
          >
            <TextField
              label="Nombre"
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              required
            />
            <TextField
              label="Descripción"
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle1">Fecha del evento</Typography>
                <DatePicker
                  label="Fecha"
                  value={formValues.eventDate ? dayjs(formValues.eventDate) : null}
                  onChange={(newValue: Dayjs | null) => {
                    const updatedDate = newValue ? newValue.toISOString() : '';
                    setFormValues({ ...formValues, eventDate: updatedDate });
                  }}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />

                <Typography variant="subtitle1">Hora del evento</Typography>
                <TimePicker
                  label="Hora"
                  value={formValues.eventDate ? dayjs(formValues.eventDate) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (!newValue) return;
                    const currentDate = formValues.eventDate ? dayjs(formValues.eventDate) : dayjs();
                    const merged = currentDate
                      .set('hour', newValue.hour())
                      .set('minute', newValue.minute())
                      .toISOString();
                    setFormValues({ ...formValues, eventDate: merged });
                  }}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Box>
            </LocalizationProvider>

            <Typography variant="subtitle1">Tipo de evento</Typography>
            <Select
              value={formValues.eventTypeId}
              onChange={(e) => setFormValues({ ...formValues, eventTypeId: e.target.value })}
              required
            >
              {eventTypes.map((t) => (
                <MenuItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>

            <Typography variant="subtitle1">Tipo de cliente</Typography>
            <Select
              value={formValues.clientTypeId}
              onChange={(e) =>
                setFormValues(
                  formValues.clientTypeId === ''
                    ? { ...formValues, clientTypeId: e.target.value }
                    : {
                        ...formValues,
                        clientTypeId: e.target.value,
                        clientDescription: '',
                        clientName: '',
                      }
                )
              }
            >
              <MenuItem key="" value="">
                Ninguno
              </MenuItem>
              {clientTypes.map((t) => (
                <MenuItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Nombre del cliente"
              value={formValues.clientName}
              onChange={(e) => setFormValues({ ...formValues, clientName: e.target.value })}
              required={formValues.clientTypeId !== ''}
              disabled={formValues.clientTypeId === ''}
            />
            <TextField
              label="Descripción del cliente"
              value={formValues.clientDescription}
              onChange={(e) =>
                setFormValues({ ...formValues, clientDescription: e.target.value })
              }
              required={formValues.clientTypeId !== ''}
              disabled={formValues.clientTypeId === ''}
            />

            <Box display="flex" justifyContent="center" gap={2}>
              <Button variant="contained" type="submit" color="primary" disabled={loading}>
                Guardar Cambios
                {loading && <CircularProgress size="15px" className="ml-2" />}
              </Button>
              <Button onClick={() => setOpenModal(false)} color="secondary" disabled={loading}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
