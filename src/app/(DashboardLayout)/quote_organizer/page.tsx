'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Typography,
  CircularProgress,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useAppContext } from '@/context/AppContext';
import { showErrorAlert } from '@/app/lib/swal';

type Quote = {
  id?: number;
  name?: string;
  price?: number;
  quantity?: number;
  status?: string;
  date?: string;
  eventId?: number;
  eventName?: string;
};

type GroupedQuotes = Record<string, Quote[]>;

const OrganizerQuotesPage = () => {
  const { token } = useAppContext();
  const params = useParams();
  const eventId = params.id;

  const [quotes, setQuotes] = useState<GroupedQuotes>({});
  const [loadingTable, setLoadingTable] = useState(true);

  const fetchQuotes = React.useCallback(async () => {
    if (!token || !eventId) return;
    setLoadingTable(true);

    try {
      const res = await fetch(`/api/quote_O/${eventId}`, { headers: { token } });
      if (!res.ok) {
        const errorData = await res.json();
        showErrorAlert(errorData.message?.description || 'Error al cargar cotizaciones');
        setQuotes({});
        return;
      }
//ya no puedo mas por hoy DIOS
      const resp = await res.json();
      if (resp.data && Object.keys(resp.data).length > 0) {
        
        const pending: GroupedQuotes = {};
        Object.keys(resp.data).forEach((serviceType) => {
          pending[serviceType] = resp.data[serviceType].filter((q: Quote) => q.status === 'pending');
        });
        setQuotes(pending);
      } else {
        showErrorAlert(resp.message?.description || 'No hay cotizaciones para mostrar');
        setQuotes({});
      }
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      showErrorAlert('Error interno al cargar cotizaciones');
      setQuotes({});
    } finally {
      setLoadingTable(false);
    }
  }, [token, eventId]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <PageContainer title="Cotizaciones Recibidas" description="Listado de cotizaciones recibidas por evento">
      <DashboardCard title={`Cotizaciones recibidas - Evento ${eventId}`}>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          {loadingTable ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
              <CircularProgress size="55px" />
            </Box>
          ) : Object.keys(quotes).length === 0 ? (
            <Typography>No hay cotizaciones para mostrar</Typography>
          ) : (
            Object.keys(quotes).map((serviceType) => (
              <Box key={serviceType} mb={4}>
                <Typography variant="h6" mb={1}>{serviceType}</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Servicio</TableCell>
                      <TableCell>Evento</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotes[serviceType].map((q: Quote) => (
                      <TableRow key={q.id}>
                        <TableCell>{q.id}</TableCell>
                        <TableCell>{q.name}</TableCell>
                        <TableCell>{q.eventName}</TableCell>
                        <TableCell>{q.price}</TableCell>
                        <TableCell>{q.quantity}</TableCell>
                        <TableCell>{q.status}</TableCell>
                        <TableCell>{q.date ? new Date(q.date).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ))
          )}
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default OrganizerQuotesPage;
