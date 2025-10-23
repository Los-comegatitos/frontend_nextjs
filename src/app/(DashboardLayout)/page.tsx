'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { showErrorAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';

import { Grid } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

interface PieData {
  type: string;
  count: number;
  [key: string]: string | number; // esto para arreglar cosa de ts paula :(
}

const Dashboard = () => {
  const { user, token } = useAppContext();

  const [loading, setLoading] = useState(false);

  const [labelStat, setLabelStat] = useState<string | null>(null);

  const [pieStats, setPieStats] = useState<PieData[]>([]);

  const [labelTitle, setLabelTitle] = useState('');
  const [pieTitle, setPieTitle] = useState('');

  // texto de la vista de los stats segun tipo usuario
  useEffect(() => {
    const newLabelTitle = user?.role === 'organizer' ? 'Tiempo promedio de finalización de tareas' : user?.role === 'provider' ? 'Porcentaje de cotizaciones aceptadas' : 'Cantidad de usuarios registrados';

    const newPieTitle = user?.role === 'organizer' ? 'Tipos de clientes más frecuentes' : user?.role === 'provider' ? 'Tipos de servicios que has cotizado' : 'Eventos creados por usuarios por tipo de evento';

    setLabelTitle(newLabelTitle);
    setPieTitle(newPieTitle);
  }, [user]);

  // fetch label
  const fetchLabel = React.useCallback(async () => {
    if (!token) return;
    const url = user?.role === 'organizer' ? 'event/average-task-time' : user?.role === 'provider' ? 'quote/accepted-quotes-percentage' : 'user/registered-users-count';

    try {
      setLoading(true);
      const res = await fetch(`/api/${url}`, {
        headers: { token: token as string },
      });

      const data = await res.json();

      if (data.message.code === '000') {
        setLabelStat(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('error:', err);
    }
  }, [token, user]);

  // fetch (pie)
  const fetchPie = React.useCallback(async () => {
    if (!token) return;
    const url = user?.role === 'organizer' ? 'event/client-type-stats' : user?.role === 'provider' ? 'quote/service-type-stats' : 'event/event-type-stats';

    try {
      setLoading(true);
      const res = await fetch(`/api/${url}`, {
        headers: { token: token as string },
      });

      const data = await res.json();

      if (data.message.code === '000') {
        setPieStats(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('error:', err);
    }
  }, [token, user]);

  useEffect(() => {
    if (!token) return;
    fetchLabel();
    fetchPie();
  }, [fetchLabel, fetchPie, token]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#0088FE', '#00C49F'];

  return (
    <PageContainer title='Home' description='Home'>
      <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' }, marginBottom: 2 }}>
        <Typography variant='h2' fontWeight={600} mb={2}>
          ¡Bienvenido {user?.role === 'organizer' ? 'Organizador' : user?.role === 'provider' ? 'Proveedor' : 'Administrador'}!
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size='55px' className='mb-2' />
        </Box>
      ) : (
        <Box>
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                lg: 6,
              }}
            >
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant='h5'>{labelTitle}</Typography>
                      <Typography variant='h3' color='primary' fontWeight='bold'>
                        {labelStat || 'Sin datos'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={12}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant='h5'>{pieTitle}</Typography>
                      {pieStats.length === 0 ? (
                        <Typography>No hay datos disponibles.</Typography>
                      ) : (
                        <ResponsiveContainer width='100%' height={300}>
                          <PieChart>
                            <Pie data={pieStats} dataKey='count' nameKey='type' cx='50%' cy='50%' outerRadius={100} fill='#8884d8' label>
                              {pieStats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              size={{
                xs: 12,
                lg: 6,
              }}
            >
              <Card sx={{ height: '100%', padding: 2}}>
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView='dayGridMonth'
                  events={[
                    // { title: 'evento ejemplo', date: '2025-10-13' },
                  ]}
                />
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </PageContainer>
  );
};

export default Dashboard;
