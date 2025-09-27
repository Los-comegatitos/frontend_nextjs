'use client';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Tabs, Tab, Typography, CircularProgress, Divider } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { showErrorAlert } from '@/app/lib/swal';
import { Event } from '@/interfaces/Event';
import ExampleTabContent from '@/components/tabs/ExampleTabContent';
import EventOverview from '@/components/tabs/EventOverview';
import { useAppContext } from '@/context/AppContext';
import ServicesTab from '@/components/tabs/ServicesTab';

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
    <div role='tabpanel' hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
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
              <CircularProgress size='55px' className='mb-2' />
            </Box>
          ) : !eventData ? (
            <Box display='flex' justifyContent='center' alignItems='center' py={6}>
              <Typography variant='body1'>Evento no encontrado.</Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      )}
    </div>
  );
}

// de verdad no sé por qué esta function se llama así pero así ponía la documentación
// básicamente es para el manejo de tabs
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

  // info principal a mostrar de event
  const fetchEvent = React.useCallback(async () => {
    if (!eventId) {
      setLoadingEvent(false);
      return;
    }

    try {
      setLoadingEvent(true);
      const res = await fetch(`/api/event/${eventId}`, {headers: { 'token': token as string, },});
      const data = await res.json();

      if (data?.message?.code === '000') {
        setEventData(data.data as Event);
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

  useEffect(() => {
    // if (token && eventId) 
    fetchEvent()
  }, [fetchEvent]);

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <PageContainer title={eventData ? `Evento: ${eventData.name}` : 'Evento'} description='Vista de detalle del evento'>
      <DashboardCard title={eventData ? eventData.name : 'Evento'}>
        <Box mb={2} display='flex' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={1}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label='Event navigation tabs' variant='scrollable' scrollButtons='auto'>
            <Tab label='Overview' {...a11yProps(0)} />
            <Tab label='Servicios' {...a11yProps(1)} />
            <Tab label='Tareas' {...a11yProps(2)} />
            <Tab label='Cotizaciones' {...a11yProps(3)} />
            <Tab label='Proveedores' {...a11yProps(4)} />

            {eventData?.status === 'finished' && (
              <>
                <Tab label='Reporte' {...a11yProps(5)} />
                <Tab label='Calificar proveedores' {...a11yProps(6)} />
              </>
            )}
          </Tabs>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <CustomTabPanel value={tabValue} index={0} loading={loadingEvent} eventData={eventData}>
          <EventOverview event={eventData!} />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={1} loading={loadingEvent} eventData={eventData}>
          <ServicesTab token={token as string} event={eventData!} onRefresh={fetchEvent}/>
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
      </DashboardCard>
    </PageContainer>
  );
};

export default EventPage;
