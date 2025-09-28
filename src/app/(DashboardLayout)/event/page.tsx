'use client';
import React, { useEffect, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField, Select, MenuItem } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { Event } from '@/interfaces/Events';
import { useAppContext } from '@/context/AppContext';
import { AuxiliarType } from '@/interfaces/AuxiliarType';
import { useRouter } from 'next/navigation'

const EventsPage = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  type ModalMode = 'add' | 'modify';
  const [eventTypes, setEventTypes] = useState<AuxiliarType[]>([]);
  const [clientTypes, setClientTypes] = useState<AuxiliarType[]>([]);

  const [events, setEvents] = useState<Event[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [openModal, setOpenModal] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { token } = useAppContext();

  const fetchClientTypes = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/client-type`, { headers: { token: token as string } });
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

  const fetchEventTypes = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/event-type`, { headers: { token: token as string } });
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

  // fetch events
  const fetchEvents = React.useCallback(async () => {
    try {
      setLoadingTable(true);
      const res = await fetch(`/api/event`, { headers: { token: token as string } });
      const data = await res.json();

      if (data.message.code === '000') {
        setEvents(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('error:', err);
    } finally {
      setLoadingTable(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchEvents();
    fetchEventTypes();
    fetchClientTypes();
  }, [fetchClientTypes, fetchEventTypes, fetchEvents, token]);

  const handleAdd = () => {
    setSelectedEvent({
      eventId: '',
      name: '',
      description: '',
      eventDate: '',
      eventTypeId: 0,
      organizerUserId: 0,
      client: { name: '', clientTypeId: 0, description: '' },
      status: 'active',
    });
    setModalMode('add');
    setOpenModal(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      eventDate: formData.get('eventDate') as string,
      eventTypeId: parseInt(formData.get('eventTypeId') as string) as number,
      client: {
        name: formData.get('clientName') as string,
        clientTypeId: parseInt(formData.get('clientTypeId') as string) as number,
        description: formData.get('clientDescription') as string,
      },
    };

    try {
      let res: Response;
      if (modalMode === 'modify') {
        res = await fetch(`${API_BASE_URL}event/${formData.get('eventId')}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/event`, {
          method: 'POST',
          headers: { token: token as string },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.message.code === '000') {
        showSucessAlert(modalMode === 'add' ? 'Evento añadido exitosamente.' : 'Evento modificado exitosamente.');
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error', err);
    } finally {
      fetchEvents();
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleFinalize = async (eventId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}events/${eventId}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'finalized' }),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert('Evento finalizado exitosamente');
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error finalizando evento', err);
    } finally {
      fetchEvents();
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleRowClick = (event: Event) => {

    router.push(`/event/${event.eventId}`);
    // Por ahora no va abrir modal ni nada sino redirigir al dashboard
    // setSelectedEvent(event);
    // setModalMode('modify');
    // setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Eventos' description='Events Page'>
      <DashboardCard title='Eventos'>
        <Box display='flex' justifyContent='flex-end' mb={2}>
          <Button variant='contained' color='primary' onClick={handleAdd}>
            Añadir Evento
          </Button>
        </Box>
        {}
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          {loadingTable ? (
            <Box
              sx={{
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress size='55px' className='mb-2' />
            </Box>
          ) : (
            <>
              <Table aria-label='events table' sx={{ whiteSpace: 'nowrap', mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        ID
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Nombre
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Fecha
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Estado
                      </Typography>
                    </TableCell>
                    {/* <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Acciones
                      </Typography>
                    </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow
                      key={event.eventId}
                      className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200'
                      onClick={() => {
                        handleRowClick(event);
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{event.eventId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{event.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{new Date(event.eventDate).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{event.status}</Typography>
                      </TableCell>
                      {/* <TableCell>
                        <Button variant='outlined' color='primary' component={NextLink} href={`event/${event.eventId}`}>
                          Dashboard
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {events.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                  }}
                >
                  <Typography className='text' variant='subtitle2' fontWeight={600}>
                    No hay eventos para mostrar.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DashboardCard>

      {/* modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{modalMode === 'add' ? 'Añadir evento' : 'Modificar evento'}</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2} mt={1}>
              {modalMode === 'modify' && <TextField label='ID' name='eventId' defaultValue={selectedEvent.eventId} slotProps={{ input: { readOnly: true } }} />}

              <TextField label='Nombre' name='name' defaultValue={selectedEvent.name} required />
              <TextField label='Descripción' name='description' defaultValue={selectedEvent.description} required />
              <TextField type='date' label='Fecha' name='eventDate' defaultValue={selectedEvent.eventDate?.split('T')[0]} InputLabelProps={{ shrink: true }} required />

              <p>Tipo de evento</p>
              <Select name='eventTypeId' defaultValue={selectedEvent.eventTypeId || ''} required>
                {eventTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>

              <p>Tipo de cliente</p>
              <Select name='clientTypeId' defaultValue={selectedEvent.client.clientTypeId || ''} required>
                {clientTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField label='Client Name' name='clientName' defaultValue={selectedEvent.client?.name} required />
              <TextField label='Client Description' name='clientDescription' defaultValue={selectedEvent.client?.description} required />
              <Box display='flex' justifyContent='center' gap={2}>
                {modalMode === 'modify' && (
                  <Button variant='outlined' color='error' onClick={() => handleFinalize(selectedEvent.eventId)} disabled={loading}>
                    Finalizar
                    {loading && <CircularProgress size='15px' className={'ml-2'} />}
                  </Button>
                )}
                <Button variant='contained' type='submit' color='primary' disabled={loading}>
                  {modalMode === 'add' ? 'Agregar' : 'Modificar'}
                  {loading && <CircularProgress size='15px' className={'ml-2'} />}
                </Button>
                <Button onClick={handleClose} color='secondary' disabled={loading}>
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default EventsPage;
