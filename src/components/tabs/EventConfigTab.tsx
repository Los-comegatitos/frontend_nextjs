// src/components/tabs/EventConfigTab.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, MenuItem, Select, TextField, Stack } from '@mui/material';
import Swal from 'sweetalert2';
import { Event } from '@/interfaces/Event';
import { AuxiliarType } from '@/interfaces/AuxiliarType';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';

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

  const fetchEventTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/service-type`, {
        headers: { token },
      });
      const data = await res.json();
      if (data.message.code === '000') {
        setEventTypes(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
    fetchEventTypes();
    }
  }, [fetchEventTypes, token]);

  const fetchClientTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/service-type`, {
        headers: { token },
      });
      const data = await res.json();
      if (data.message.code === '000') {
        setClientTypes(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
    fetchClientTypes();
    }
  }, [fetchClientTypes, token]);

  const [formValues, setFormValues] = useState({
    name: event.name,
    description: event.description,
    eventDate: event.eventDate?.split('T')[0] || '',
    eventTypeId: event.eventTypeId.toString(),
    clientTypeId: event.client.clientTypeId.toString(),
    clientName: event.client.name,
    clientDescription: event.client.description || '',
  });

  const handleAction = async (action: 'finalize' | 'cancel') => {
    const confirm = await Swal.fire({
      title: '¿Seguro de esta acción?',
      text: action === 'finalize' ? '¿Está seguro de que desea finalizar este evento?' : '¿Está seguro de que desea cancelar este evento?',
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
        await showSucessAlert(action === 'finalize' ? 'Evento finalizado exitosamente' : 'Evento cancelado exitosamente');
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

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formValues.name,
      description: formValues.description,
      eventDate: formValues.eventDate,
      eventTypeId: parseInt(formValues.eventTypeId),
      client: {
        name: formValues.clientName,
        clientTypeId: parseInt(formValues.clientTypeId),
        description: formValues.clientDescription,
      },
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
      <Box display='flex' justifyContent='center' gap={4}>
        <Button variant='outlined' color='primary' onClick={() => setOpenModal(true)} disabled={loading}>
          Modificar evento
        </Button>

        <Button variant='contained' color='success' onClick={() => handleAction('finalize')} disabled={loading}>
          Finalizar evento
        </Button>
        <Button variant='contained' color='error' onClick={() => handleAction('cancel')} disabled={loading}>
          Cancelar evento
        </Button>
      </Box>

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Modificar Evento</DialogTitle>
        <DialogContent dividers>
          <Box component='form' onSubmit={handleModify} display='flex' flexDirection='column' gap={2} mt={1}>
            <TextField label='Nombre' value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} required />
            <TextField label='Descripción' value={formValues.description} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} required />
            <TextField type='date' label='Fecha' value={formValues.eventDate} onChange={(e) => setFormValues({ ...formValues, eventDate: e.target.value })} InputLabelProps={{ shrink: true }} required />

            <p>Tipo de evento</p>
            <Select value={formValues.eventTypeId} onChange={(e) => setFormValues({ ...formValues, eventTypeId: e.target.value })} required>
              {eventTypes.map((t) => (
                <MenuItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>

            <p>Tipo de cliente</p>
            <Select value={formValues.clientTypeId} onChange={(e) => setFormValues({ ...formValues, clientTypeId: e.target.value })} required>
              {clientTypes.map((t) => (
                <MenuItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>

            <TextField label='Nombre del cliente' value={formValues.clientName} onChange={(e) => setFormValues({ ...formValues, clientName: e.target.value })} required />
            <TextField label='Descripción del cliente' value={formValues.clientDescription} onChange={(e) => setFormValues({ ...formValues, clientDescription: e.target.value })} required />

            <Box display='flex' justifyContent='center' gap={2}>
              <Button variant='contained' type='submit' color='primary' disabled={loading}>
                Guardar Cambios
                {loading && <CircularProgress size='15px' className='ml-2' />}
              </Button>
              <Button onClick={() => setOpenModal(false)} color='secondary' disabled={loading}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
