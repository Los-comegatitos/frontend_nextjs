'use client';

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField, Select, MenuItem, TablePagination } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';
import { FilteredEvent } from '@/interfaces/Event';
import { showDate } from '@/utils/Formats';
import { Quote } from '@/interfaces/Quote';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Catalog } from '@/interfaces/Catalog';

const EventsProvidersPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [events, setEvents] = useState<FilteredEvent[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FilteredEvent | null>(null);
  const { token } = useAppContext();
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  // stepper cosas
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedSendService, setSelectedSendService] = useState(''); // a que servicio se envia la coti
  const [selectedQuoteService, setSelectedQuoteService] = useState(''); // que servicio se esta cotizando
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const filteredCatalogServices = useMemo(() => {
    const selectedSendServiceObject = selectedEvent?.services.filter((s) => s.name === selectedSendService) ?? [];

    // validaciones para que el ts se quede quieto
    if (!catalog?.services) return [];
    if (!selectedSendServiceObject[0]) return [];

    return catalog?.services.filter((s) => s.serviceTypeId === selectedSendServiceObject[0]?.serviceTypeId);
  }, [catalog?.services, selectedEvent?.services, selectedSendService]);

  // pagination cosas
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredEvents = events.filter((event) => event.name.toLowerCase().includes(search.toLowerCase()));
  const paginatedEvents = filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const fetchCatalog = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoadingTable(true);
      const res = await fetch(`/api/catalog`, { headers: { token: token as string } });
      const data = await res.json();
      if (data.message.code === '000') {
        setCatalog(data.data.catalog);
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
    fetchEvents();
    fetchCatalog();
  }, [fetchEvents, fetchCatalog]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedEvent) return;

    const quoteService = filteredCatalogServices.find((s) => s.name === selectedQuoteService);
    // otra validación para que ts se quede quieto pero obvio super obvio que nunca va a pasar por como está la lógica.
    if (!quoteService) {
      setSubmitError('Servicio a cotizar inválido');
      return;
    }

    const priceValue = parseFloat(price);
    const quantityValue = parseInt(quantity);

    if (isNaN(priceValue) || priceValue <= 0) {
      setSubmitError('El precio debe ser un número mayor que 0');
      return;
    }

    if (quoteService.quantity != null) {
      if (isNaN(quantityValue) || quantityValue <= 0) {
        setSubmitError('La cantidad debe ser un número mayor que 0');
        return;
      }
      if (quantityValue > quoteService.quantity) {
        setSubmitError('La cantidad supera la disponible en tu catálogo');
        return;
      }
    } else if (quantity !== '') {
      setSubmitError('Este servicio no permite cantidades');
      return;
    }

    const quote: Quote = {
      service: {
        name: quoteService.name,
        description: quoteService.description,
        serviceTypeId: quoteService.serviceTypeId,
      },
      price: parseFloat(price),
      eventId: selectedEvent?.eventId as string,
      toServiceId: selectedSendService,
      quantity: parseInt(quantity),
    };

    try {
      setLoading(true);
      const res = await fetch(`/api/quote`, {
        headers: { 
          'Content-Type': 'application/json',
          token: token as string },
        method: 'POST',
        body: JSON.stringify(quote),
      });
      const data = await res.json();
      if (data.message.code === '000') {
        setActiveStep(0);
        setOpenModal(false);
        setSelectedEvent(null);
        setSelectedSendService('');
        setSelectedQuoteService('');
        setPrice('');
        setQuantity('');
        await showSucessAlert('La cotización fue enviada exitosamente');
        await fetchEvents();
      } else {
        await showErrorAlert(data.message.description || 'Error al enviar cotización');
      }
    } catch (error) {
      console.log('error', error);
      await showErrorAlert('Error inesperado al enviar cotización');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (event: FilteredEvent) => {
    setSelectedEvent(event);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Eventos' description='Página de eventos'>
      <DashboardCard title='Eventos'>
        <Typography color='gray' mb={3}>
          Aquí podrás visualizar los eventos que requieren servicios compatibles con los que ofreces. Da click en un evento para enviar una cotización.
        </Typography>
        <Box display='flex' justifyContent='flex-end' mb={2} gap={5}>
          <TextField placeholder='Buscar por nombre...' variant='outlined' size='small' value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          {loadingTable ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size='55px' />
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
                  {paginatedEvents.map((event) => (
                    <TableRow key={event.name} className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200' onClick={() => handleRowClick(event)}>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{event.name}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{showDate(event.eventDate)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination labelRowsPerPage={"Filas a mostrar"} component='div' count={filteredEvents.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, { value: -1, label: 'Todos' }]} />

              {events.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                  }}
                >
                  <Typography variant='subtitle2' fontWeight={600}>
                    No hay eventos para mostrar.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DashboardCard>

      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Enviar cotización</DialogTitle>
        <DialogContent dividers sx={{ p: 6 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
            {['Servicio a enviar cotización', 'Servicio a cotizar', 'Información adicional'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Paso 1 */}
          {activeStep === 0 && (
            <Box display='flex' flexDirection='column' gap={2}>
              <Typography>Selecciona servicio a enviar cotización:</Typography>
              <Select
                value={selectedSendService}
                onChange={(e) => setSelectedSendService(e.target.value)}
              >
                {selectedEvent?.services.map((s) => (
                  <MenuItem key={s.name} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>

              {selectedSendService && (() => {
                const selectedService = selectedEvent?.services.find(
                  (s) => s.name === selectedSendService
                );
                const isExpired =
                  selectedService?.dueDate && new Date(selectedService.dueDate) < new Date();

                return (
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Descripción del servicio: {selectedService?.description}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Cantidad requerida: {selectedService?.quantity}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: isExpired ? 'error.main' : 'text.secondary' }}
                    >
                      Hasta qué fecha recibe cotizaciones:{' '}
                      {showDate(selectedService?.dueDate as string)}
                      {isExpired && ' (vencida)'}
                    </Typography>
                  </Box>
                );
              })()}

              <Box display='flex' justifyContent='flex-end' gap={2} mt={2}>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (!selectedSendService) {
                      setSubmitError('Selecciona un servicio antes de continuar');
                      return;
                    }

                    const selectedSendServiceObject = selectedEvent?.services.find(
                      (s) => s.name === selectedSendService
                    );

                    if (!selectedSendServiceObject) {
                      setSubmitError('Servicio no encontrado');
                      return;
                    }

                    const dueDate = selectedSendServiceObject.dueDate;
                    if (dueDate && new Date(dueDate) < new Date()) {
                      setSubmitError(
                        'La fecha límite para enviar cotizaciones ha pasado'
                      );
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
          
          {/* Paso 2 */}
          {activeStep === 1 && (
            <Box display='flex' flexDirection='column' gap={2}>
              <Typography>Seleccionar servicio de tu catálogo a cotizar:</Typography>
              <Select value={selectedQuoteService} onChange={(e) => setSelectedQuoteService(e.target.value)}>
                {filteredCatalogServices?.map((s) => (
                  <MenuItem key={s.name} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>

              {selectedQuoteService && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Descripción de tu servicio: {filteredCatalogServices?.find((s) => s.name === selectedQuoteService)?.description}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Cantidad disponible: {filteredCatalogServices?.find((s) => s.name === selectedQuoteService)?.quantity || 'No aplica'}
                  </Typography>
                </Box>
              )}

              <Box display='flex' justifyContent='space-between' mt={2}>
                <Button onClick={() => setActiveStep(0)}>Atrás</Button>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (!selectedQuoteService) {
                      setSubmitError('Selecciona un servicio antes de continuar');
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

          {/* Paso 3 */}
          {activeStep === 2 && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2}>
              <Typography>Información adicional:</Typography>
              <TextField type='number' label='Precio' name='price' value={price} onChange={(e) => setPrice(e.target.value)} required />
              <TextField type='number' label='Cantidad' name='quantity' value={quantity} onChange={(e) => setQuantity(e.target.value)} />

              <Box display='flex' justifyContent='space-between' mt={2}>
                <Button onClick={() => setActiveStep(1)}>Atrás</Button>
                <Button type='submit' variant='contained' disabled={loading}>
                  Enviar cotización
                  {loading && <CircularProgress size='20px' sx={{ ml: 2 }} />}
                </Button>
              </Box>

              {submitError && (
                <Typography color='error' fontSize={14} textAlign='center'>
                  {submitError}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default EventsProvidersPage;
