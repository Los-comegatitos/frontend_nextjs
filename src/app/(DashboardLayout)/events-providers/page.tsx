'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField, List, ListItemText, ListItem } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';
import { FilteredEvent } from '@/interfaces/Event';
import { showDate } from '@/utils/Formats';
import { Quote } from '@/interfaces/Quote';

const EventsProvidersPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [events, setEvents] = useState<FilteredEvent[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FilteredEvent | null>(null);
  // const [quote, setQuote] = useState<Quote | null>(null);
  const { token } = useAppContext();

  const fetchEvents = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoadingTable(true);
      const res = await fetch(`/api/event/for-providers`, { headers: { token: token as string } });
      const data = await res.json();
      if (data.message.code === '000') {
        setEvents(data.data);
        console.log(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
      setLoadingTable(false);
    } catch (err) {
      setLoadingTable(false);
      console.error('Error', err);
    }
  }, [token]);

  useEffect(() => {
    // if (!token) return;
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedEvent) return;

     const info = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;

    const buttonId = info?.id;

    const service = selectedEvent?.services.find((s) => s.name === buttonId);

    console.log(events)

    const formData = new FormData(event.currentTarget);
    console.log(formData);
    console.log(formData.keys());
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    const quote : Quote = {
      service: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        serviceTypeId: service?.serviceTypeId as string, 
      }, 
      price: parseFloat(formData.get('price') as string),
      eventId: selectedEvent?.eventId as string,
      toServiceId: service?.name as string,
      quantity: parseInt(formData.get('quantity') as string),
    };
    console.log(quote);
    setLoading(true);
    const res = await fetch(`/api/quote`, { 
      headers: { token: token as string }, 
      method: 'POST', body: JSON.stringify(quote) 
    });
    const data = await res.json();
    if (data.message.code === '000') {
      setLoading(false);
      setOpenModal(false);
      setSelectedEvent(null);
      await showSucessAlert('La cotización fue enviada exitósamente');
      // window.location.reload();
      await fetchEvents();
    } else {
      setLoading(false);
      await showErrorAlert(data.message.description || 'Error al enviar cotización');
    }
  };

  const handleRowClick = (event: FilteredEvent) => {
    setSelectedEvent(event);
    setOpenModal(true);
  };

  // close modal
  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Eventos' description='Página de eventos'>
      <DashboardCard title='Eventos'>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          {loadingTable ? (
            <Box sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size='55px' className='mb-2' />
            </Box>
          ) : (
            <>
              <Table aria-label='event table' sx={{ whiteSpace: 'nowrap', mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Nombre
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Fecha del evento
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                    <Typography variant='subtitle2' fontWeight={600}>
                      Tareas
                    </Typography>
                  </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {events.map((event) => (
                      <TableRow
                        key={event.name}
                        className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200'
                        onClick={() => {
                          handleRowClick(event);
                        }}
                      >
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                          {event.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>
                          {showDate(event.eventDate)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          onClick={() => {
                            window.location.href = `/events-providers/task-providers?eventId=${event.eventId}&token=${token}`;
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <img
                            src="/images/icons/lista-de-verificacion.png"
                            alt="Ver tareas"
                            width={28}
                            height={28}
                          />
                        </Button>
                      </TableCell>
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
        <DialogTitle>Enviar cotización</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2} mt={1}>
              <TextField label='Nombre' name='name' required />
              <TextField label='Descripción' name='description' required />
              <TextField type='number' label='Precio' name='price' required />
              <TextField type='number' label='Cantidad' name='quantity' required />
              <List sx={{ width: '100%' }}>
                {selectedEvent.services.map((service) => (
                  <ListItem
                    key={service.name}
                    alignItems='flex-start'
                    className='rounded-xl'
                    sx={{ width: '100%' }}
                    secondaryAction={
                      <Button id={service.name} variant='outlined' type='submit' color='primary' onClick={() => console.log(service)}>
                        Enviar cotización
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={<Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{service.name}</Typography>}
                      secondary={
                        <Fragment>
                          {/* <input type="hidden" name="serviceName" value={service.name} required /> */}
                          <Typography component='span' variant='body2' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            {service.description}
                          </Typography>
                          <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled' }}>
                            Cantidad: {service.quantity}
                          </Typography>
                          <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled' }}>
                            Fecha límite para enviar cotización: {showDate(service.dueDate)}
                          </Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box display='flex' justifyContent='center' gap={2}>
                <Button onClick={handleClose} color='secondary' disabled={loading}>
                  Cerrar
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default EventsProvidersPage;
