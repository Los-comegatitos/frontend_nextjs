'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert, showSucessAlert } from '@/lib/swal';
import { Event } from '@/interfaces/Events';

const EventsPage = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  type ModalMode = 'add' | 'modify';
  const [events, setEvents] = useState<Event[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [openModal, setOpenModal] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // fetch events
  const fetchEvents = async () => {
    try {
      setLoadingTable(true);
      const res = await fetch(`${API_BASE_URL}/events`);
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
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      eventTypeId: Number(formData.get('eventTypeId')),
      organizerUserId: Number(formData.get('organizerUserId')),
      client: {
        name: formData.get('clientName') as string,
        clientTypeId: Number(formData.get('clientTypeId')),
        description: formData.get('clientDescription') as string,
      },
    };

    try {
      let res: Response;
      if (modalMode === 'modify') {
        res = await fetch(`${API_BASE_URL}/events/${formData.get('eventId')}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.message.code === '000') {
        showSucessAlert(
          modalMode === 'add'
            ? 'Evento añadido exitosamente.'
            : 'Evento modificado exitosamente.'
        );
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
        const res = await fetch(`${API_BASE_URL}/events/${eventId}/finalize`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
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
    setSelectedEvent(event);
    setModalMode('modify');
    setOpenModal(true);
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
                      <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                        {event.eventId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>
                        {event.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                        {new Date(event.eventDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>
                        {event.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </DashboardCard>

      {/* modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>
          {modalMode === 'add' ? 'Añadir evento' : 'Modificar evento'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box
              component='form'
              onSubmit={handleSubmit}
              display='flex'
              flexDirection='column'
              gap={2}
              mt={1}
            >
              {modalMode === 'modify' && (
                <TextField
                  label='ID'
                  name='eventId'
                  defaultValue={selectedEvent.eventId}
                  slotProps={{ input: { readOnly: true } }}
                />
              )}
              <TextField
                label='Nombre'
                name='name'
                defaultValue={selectedEvent.name}
                required
              />
              <TextField
                label='Descripción'
                name='description'
                defaultValue={selectedEvent.description}
                required
              />
              <TextField
                type='date'
                label='Fecha'
                name='eventDate'
                defaultValue={selectedEvent.eventDate?.split('T')[0]}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                type='number'
                label='Event Type ID'
                name='eventTypeId'
                defaultValue={selectedEvent.eventTypeId}
                required
              />
              <TextField
                type='number'
                label='Organizer User ID'
                name='organizerUserId'
                defaultValue={selectedEvent.organizerUserId}
                required
              />
              {/* Client */}
              <TextField
                label='Client Name'
                name='clientName'
                defaultValue={selectedEvent.client?.name}
                required
              />
              <TextField
                type='number'
                label='Client Type ID'
                name='clientTypeId'
                defaultValue={selectedEvent.client?.clientTypeId}
                required
              />
              <TextField
                label='Client Description'
                name='clientDescription'
                defaultValue={selectedEvent.client?.description}
                required
              />
              <Box display='flex' justifyContent='center' gap={2}>
                {modalMode === 'modify' && (
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => handleFinalize(selectedEvent.eventId)}
                    disabled={loading}
                  >
                    Finalizar
                    {loading && <CircularProgress size='15px' className={'ml-2'} />}
                  </Button>
                )}
                <Button
                  variant='contained'
                  type='submit'
                  color='primary'
                  disabled={loading}
                >
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
