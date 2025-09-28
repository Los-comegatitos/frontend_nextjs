'use client';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Divider,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { Event } from '@/interfaces/Event';
import ExampleTabContent from '@/components/tabs/ExampleTabContent';
import EventOverview from '@/components/tabs/EventOverview';
import { useAppContext } from '@/context/AppContext';
import ServicesTab from '@/components/tabs/ServicesTab';
import { AuxiliarType } from '@/interfaces/AuxiliarType';
import Swal from 'sweetalert2';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  loading?: boolean;
  eventData?: Event | null;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, loading, eventData, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box
              sx={{
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 6,
              }}
            >
              <CircularProgress size="55px" className="mb-2" />
            </Box>
          ) : !eventData ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <Typography variant="body1">Evento no encontrado.</Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const EventPage = () => {
  const params = useParams() as { eventId?: string };
  const eventId = params?.eventId ?? '';
  const { token } = useAppContext();

  const [eventData, setEventData] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(true);

  const [eventTypes, setEventTypes] = useState<AuxiliarType[]>([]);
  const [clientTypes, setClientTypes] = useState<AuxiliarType[]>([]);

  const [tabValue, setTabValue] = useState(0);

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    eventDate: '',
    eventTypeId: '',
    clientTypeId: '',
    clientName: '',
    clientDescription: '',
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchEvent = React.useCallback(async () => {
    if (!eventId) {
      setLoadingEvent(false);
      return;
    }

    try {
      setLoadingEvent(true);
      const res = await fetch(`/api/event/${eventId}`, {
        headers: { token: token as string },
      });
      const data = await res.json();

      if (data?.message?.code === '000') {
        const ev = data.data as Event;
        setEventData(ev);

        setFormValues({
          name: ev.name,
          description: ev.description,
          eventDate: ev.eventDate?.split('T')[0] || '',
          eventTypeId: ev.eventTypeId.toString(),
          clientTypeId: ev.client.clientTypeId.toString(),
          clientName: ev.client.name,
          clientDescription: ev.client.description || '',
        });
      } else {
        setEventData(null);
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('error:', err);
      setEventData(null);
    } finally {
      setLoadingEvent(false);
    }
  }, [eventId, token]);

  const fetchEventTypes = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/event-type`, {
        headers: { token: token as string },
      });
      const data = await res.json();
      if (data.message.code === '000') {
        setEventTypes(data.data);
      }
    } catch (err) {
      console.error('error:', err);
    }
  }, [token]);

  const fetchClientTypes = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/client-type`, {
        headers: { token: token as string },
      });
      const data = await res.json();
      if (data.message.code === '000') {
        setClientTypes(data.data);
      }
    } catch (err) {
      console.error('error:', err);
    }
  }, [token]);

  useEffect(() => {
    // if (token && eventId) {
      
    fetchEvent();
    fetchEventTypes();
    fetchClientTypes();
  }, [fetchEvent, fetchEventTypes, fetchClientTypes]);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFinalize = async () => {
    if (!eventId) return;
    await Swal.fire({
      title: '¿Seguro de esta acción?', 
      text: '¿Está seguro de que desea finalizar este evento?', 
      icon: 'question', 
      showDenyButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si',
      denyButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('que bieeeeeeeeeeeeeeeeeeeeeen');
        setLoading(true);
        console.log(loading);
        
        return;
      }
    })
    console.log(loading);
    
    if (loading === false) return
    console.log('pasasteeeeeeeeeeeeeeee');
    
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
        await showSucessAlert('Evento finalizado exitosamente');
        await fetchEvent();
      } else {
        await showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error finalizando evento', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
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
      const res = await fetch(`${API_BASE_URL}events/${eventId}`, {
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
        fetchEvent();
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error modificando evento', err);
    } finally {
      setLoading(false);
    }
  };

  const optionsGeneralIndex = eventData?.status === 'finished' ? 7 : 5;

  return (
    <PageContainer
      title={eventData ? `Evento: ${eventData.name}` : 'Evento'}
      description="Vista de detalle del evento"
    >
      <DashboardCard title={eventData ? eventData.name : 'Evento'}>
        <Box
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Event navigation tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Servicios" {...a11yProps(1)} />
            <Tab label="Tareas" {...a11yProps(2)} />
            <Tab label="Cotizaciones" {...a11yProps(3)} />
            <Tab label="Proveedores" {...a11yProps(4)} />

            {eventData?.status === 'finished' && (
              <>
                <Tab label="Reporte" {...a11yProps(5)} />
                <Tab label="Calificar proveedores" {...a11yProps(6)} />
              </>
            )}
            <Tab label="Opciones Generales" {...a11yProps(7)} />
          </Tabs>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <CustomTabPanel
          value={tabValue}
          index={0}
          loading={loadingEvent}
          eventData={eventData}
        >
          <EventOverview event={eventData!} />
        </CustomTabPanel>

        <CustomTabPanel
          value={tabValue}
          index={1}
          loading={loadingEvent}
          eventData={eventData}
        >
          <ServicesTab token={token as string} event={eventData!} onRefresh={fetchEvent} />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={2} loading={loadingEvent} eventData={eventData}>
          <ExampleTabContent event={eventData!} />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={3} loading={loadingEvent} eventData={eventData}>
          <ExampleTabContent event={eventData!} />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={4} loading={loadingEvent} eventData={eventData}>
          <ExampleTabContent event={eventData!} />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={5} loading={loadingEvent} eventData={eventData}>
          <ExampleTabContent event={eventData!} />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={6} loading={loadingEvent} eventData={eventData}>
          <ExampleTabContent event={eventData!} />
        </CustomTabPanel>

        <CustomTabPanel
          value={tabValue}
          index={optionsGeneralIndex}
          loading={loadingEvent}
          eventData={eventData}
        >
          <Stack spacing={2} direction="column" alignItems="flex-start">
            <Button
              variant="contained"
              color="success"
              onClick={handleFinalize}
              disabled={loading}
            >
              Finalizar evento
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenModal(true)}
              disabled={loading}
            >
              Modificar evento
            </Button>
          </Stack>
        </CustomTabPanel>
      </DashboardCard>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modificar Evento</DialogTitle>
        <DialogContent dividers>
          {eventData && (
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
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
                required
              />
              <TextField
                type="date"
                label="Fecha"
                value={formValues.eventDate}
                onChange={(e) =>
                  setFormValues({ ...formValues, eventDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />

              <p>Tipo de evento</p>
              <Select
                value={formValues.eventTypeId}
                onChange={(e) =>
                  setFormValues({ ...formValues, eventTypeId: e.target.value })
                }
                required
              >
                {eventTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>

              <p>Tipo de cliente</p>
              <Select
                value={formValues.clientTypeId}
                onChange={(e) =>
                  setFormValues({ ...formValues, clientTypeId: e.target.value })
                }
                required
              >
                {clientTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                label="Nombre del cliente"
                value={formValues.clientName}
                onChange={(e) =>
                  setFormValues({ ...formValues, clientName: e.target.value })
                }
                required
              />
              <TextField
                label="Descripción del cliente"
                value={formValues.clientDescription}
                onChange={(e) =>
                  setFormValues({ ...formValues, clientDescription: e.target.value })
                }
                required
              />

              <Box display="flex" justifyContent="center" gap={2}>
                <Button variant="contained" type="submit" color="primary" disabled={loading}>
                  Guardar Cambios
                  {loading && <CircularProgress size="15px" className="ml-2" />}
                </Button>
                <Button
                  onClick={() => setOpenModal(false)}
                  color="secondary"
                  disabled={loading}
                >
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

export default EventPage;
