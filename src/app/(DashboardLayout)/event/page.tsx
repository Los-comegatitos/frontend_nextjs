'use client';
import React, { useEffect, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField, Select, MenuItem, TablePagination } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { showErrorAlert } from '@/app/lib/swal';
import { Event } from '@/interfaces/Events';
import { useAppContext } from '@/context/AppContext';
import { AuxiliarType } from '@/interfaces/AuxiliarType';
import { useRouter } from 'next/navigation';

// es la interfaz auxiliar para manejar el form de los steppers. No es igual a evento porque fue necesario un campo adicional para saber si validar o no ciertos datos.
interface EventDataAux {
  name: string;
  description: string;
  eventTypeId: string;
  eventDate: string | undefined;
  clientMode: 'none' | 'propio' | 'cliente';
  clientTypeId: string;
  clientName: string;
  clientDescription: string;
}

const EventsPage = () => {
  const router = useRouter();
  type ModalMode = 'add' | 'modify';

  const [eventTypes, setEventTypes] = useState<AuxiliarType[]>([]);
  const [clientTypes, setClientTypes] = useState<AuxiliarType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [openModal, setOpenModal] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [eventAdded, setEventAdded] = useState<Event | null>(null);
  const { token } = useAppContext();

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Stepper
  const steps = ['Cuéntanos más', 'Fecha', 'Datos adicionales', 'Finalizado'];
  const [activeStep, setActiveStep] = useState(0);
  const [eventData, setEventData] = useState<EventDataAux>({
    name: '',
    description: '',
    eventTypeId: '',
    eventDate: '',
    clientMode: 'none',
    clientTypeId: '',
    clientName: '',
    clientDescription: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // fetch client types
  const fetchClientTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/client-type`, {
        headers: { token: token as string },
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

  // fetch event types
  const fetchEventTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/event-type`, {
        headers: { token: token as string },
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

  // fetch events
  const fetchEvents = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoadingTable(true);
      const res = await fetch(`/api/event`, {
        headers: { token: token as string },
      });
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

  // pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);  
  };

  const filteredEvents = events.filter((event) => event.name.toLowerCase().includes(search.toLowerCase()));

  const paginatedEvents = filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAdd = () => {
    setModalMode('add');
    setEventData({
      name: '',
      description: '',
      eventTypeId: '',
      eventDate: '',
      clientMode: 'none',
      clientTypeId: '',
      clientName: '',
      clientDescription: '',
    });
    setActiveStep(0);
    setOpenModal(true);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);

    const payload: Partial<Event> = {
      name: eventData.name,
      description: eventData.description,
      eventDate: eventData.eventDate,
      eventTypeId: parseInt(eventData.eventTypeId),
    };

    if (eventData.clientMode === 'cliente') {
      payload.client = {
        name: eventData.clientName,
        clientTypeId: parseInt(eventData.clientTypeId),
        description: eventData.clientDescription,
      };
    }
    
    try {
      const res = await fetch(`/api/event`, {
        method: 'POST',
        headers: { token: token as string },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.message.code === '000') {
        setActiveStep(3);
        setEventAdded(data.data);
        // showSucessAlert('Evento añadido exitosamente.'); ya nop
      } else {
        setSubmitError(data.message.description);
      }
    } catch (err) {
      console.error('Error', err);
      setSubmitError('Ocurrió un error inesperado');
    } finally {
      fetchEvents();
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Eventos' description='Events Page'>
      <DashboardCard title='Eventos'>
        <Box display='flex' justifyContent='flex-end' mb={2} gap={5}>
          <TextField placeholder='Buscar por nombre...' variant='outlined' size='small' value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant='contained' color='primary' onClick={handleAdd}>
            Añadir Evento
          </Button>
        </Box>

        {/* tabla */}
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEvents.map((event) => (
                    <TableRow key={event.eventId} className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200' onClick={() => router.push(`/event/${event.eventId}`)}>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{event.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{new Date(event.eventDate).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{event.status}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination component='div' count={filteredEvents.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, { value: -1, label: 'Todos' }]} />

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

      {/* modal stepper */}
      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{modalMode === 'add' ? 'Añadir evento' : 'Modificar evento'}</DialogTitle>
        <DialogContent dividers sx={{ p: 6 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box display='flex' flexDirection='column' gap={2} mt={2}>
              <Typography>¿Cuál es el nombre de tu evento?</Typography>
              <TextField label='Nombre' value={eventData.name} onChange={(e) => setEventData({ ...eventData, name: e.target.value })} required />
              <Typography>¿Alguna información adicional que quieras detallar?</Typography>
              <TextField label='Descripción' value={eventData.description} onChange={(e) => setEventData({ ...eventData, description: e.target.value })} />
              <Box display='flex' justifyContent='flex-end' gap={2} mt={2}>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (!eventData.name.trim()) {
                      setSubmitError('Por favor completa los campos obligatorios');
                      return;
                    }
                    setSubmitError(null);
                    setActiveStep(1);
                  }}
                >
                  Siguiente
                </Button>
              </Box>
              {submitError && (
                <Typography color='error' fontSize={14} textAlign='center'>
                  {submitError}
                </Typography>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box display='flex' flexDirection='column' gap={2} mt={2}>
              <Typography>¿Qué fecha será tu evento tentativamente?</Typography>
              <TextField type='date' label='Fecha' InputLabelProps={{ shrink: true }} value={eventData.eventDate} onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })} required />

              <Box display='flex' justifyContent='space-between' mt={2}>
                <Button onClick={() => setActiveStep(0)}>Atrás</Button>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (!eventData.eventDate) {
                      setSubmitError('Por favor completa los campos obligatorios');
                      return;
                    }

                    const today = new Date();
                    const selectedDate = new Date(eventData.eventDate);
                    today.setHours(0, 0, 0, 0);
                    selectedDate.setHours(0, 0, 0, 0);

                    if (selectedDate < today) {
                      setSubmitError('La fecha del evento no puede ser anterior a hoy.');
                      return;
                    }

                    setSubmitError(null);
                    setActiveStep(2);
                  }}
                >
                  Siguiente
                </Button>
              </Box>

              {submitError && (
                <Typography color='error' fontSize={14} textAlign='center'>
                  {submitError}
                </Typography>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box display='flex' flexDirection='column' gap={2} mt={2}>
              <Typography>¿De qué tipo es tu evento?</Typography>
              <Select value={eventData.eventTypeId} onChange={(e) => setEventData({ ...eventData, eventTypeId: e.target.value })} required>
                {eventTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>

              <Typography>¿Para quién es el evento?</Typography>
              <Box display='flex' gap={2} justifyContent='center'>
                <Button variant={eventData.clientMode === 'propio' ? 'contained' : 'outlined'} onClick={() => setEventData({ ...eventData, clientMode: 'propio' })}>
                  Evento propio
                </Button>
                <Button variant={eventData.clientMode === 'cliente' ? 'contained' : 'outlined'} onClick={() => setEventData({ ...eventData, clientMode: 'cliente' })}>
                  Evento para un cliente
                </Button>
              </Box>

              {eventData.clientMode === 'cliente' && (
                <Box display='flex' flexDirection='column' gap={2}>
                  <p>Tipo de cliente</p>
                  <Select value={eventData.clientTypeId} onChange={(e) => setEventData({ ...eventData, clientTypeId: e.target.value })} required>
                    {clientTypes.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField label='Nombre del cliente' value={eventData.clientName} onChange={(e) => setEventData({ ...eventData, clientName: e.target.value })} required />
                  <TextField label='Descripción del cliente' value={eventData.clientDescription} onChange={(e) => setEventData({ ...eventData, clientDescription: e.target.value })} />
                </Box>
              )}

              {submitError && (
                <Typography color='error' fontSize={14} textAlign='center'>
                  {submitError}
                </Typography>
              )}

              <Box display='flex' justifyContent='space-between' mt={2}>
                <Button onClick={() => setActiveStep(1)}>Atrás</Button>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (eventData.clientMode !== 'cliente') {
                      if (!eventData.eventTypeId) {
                        setSubmitError('Por favor completa los campos obligatorios');
                        return;
                      }
                    } else {
                      if (!eventData.eventTypeId || !eventData.clientTypeId || !eventData.clientName) {
                        setSubmitError('Por favor completa los campos obligatorios');
                        return;
                      }
                    }
                    setSubmitError(null);
                    handleSubmit();
                  }}
                  disabled={loading || eventData.clientMode === 'none'}
                >
                  Confirmar
                  {loading && <CircularProgress size='20px' color='secondary' className={'ml-2'} />}
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 3 && (
            <Box display='flex' flexDirection='column' alignItems='center' mt={3} gap={2}>
              <Typography variant='h6' mb={2}>
                ¡Evento registrado exitosamente!
              </Typography>
              <Box display='flex' gap={2}>
                <Button variant='outlined' onClick={handleClose}>
                  Volver
                </Button>
                <Button variant='contained' color='primary' onClick={() => router.push(`/event/${eventAdded?.eventId}`)}>
                  Ver dashboard
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
