'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField, List, ListItemText, ListItem } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';
import { FilteredEvent } from '@/interfaces/Event';

const EventsProvidersPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [events, setEvents] = useState<FilteredEvent[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FilteredEvent | null>(null);
  const { token } = useAppContext();

  const fetchEvents = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoadingTable(true);
      const res = await fetch(`/api/event/for-providers`, { headers: { token: token as string } });
      const data = await res.json();
      if (data.message.code === '000') {
        setEvents(data.data);
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
    if (!token) return;
    fetchEvents();
  }, [fetchEvents, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
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
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{event.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{event.eventDate.toString()}</Typography>
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
        <DialogTitle>Añadir tipo de evento</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2} mt={1}>
              <TextField label='Name' name='name' defaultValue={selectedEvent.name} required />
              <TextField label='Description' name='description' defaultValue={selectedEvent.description} required />
              <List sx={{ width: '100%' }}>
                {selectedEvent.services.map((service) => (
                  <ListItem
                    key={service.name}
                    alignItems='flex-start'
                    className='rounded-xl'
                    sx={{ width: '100%' }}
                    secondaryAction={
                      <Button variant='outlined' color='primary' onClick={() => console.log('aquí hacemos link a cotizacion (paso event id y tipo de servicio a cotizar)')}>
                        Enviar cotización
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={<Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{service.name}</Typography>}
                      secondary={
                        <Fragment>
                          <Typography component='span' variant='body2' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            {service.description}
                          </Typography>
                          <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled' }}>
                            Cantidad: {service.quantity}
                          </Typography>
                          <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled' }}>
                            Fecha límite para enviar cotización: {service.dueDate.toString()}
                          </Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box display='flex' justifyContent='center' gap={2}>
                <Button onClick={handleClose} color='secondary' disabled={loading}>
                  Close
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
