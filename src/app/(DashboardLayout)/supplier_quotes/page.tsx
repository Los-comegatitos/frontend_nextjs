'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Typography,
  CircularProgress, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useAppContext } from '@/context/AppContext';
import { showErrorAlert } from '@/app/lib/swal';
import { showDate } from '@/utils/Formats';

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

const SupplierQuotesPage = () => {
  const { token, user } = useAppContext();
  const [statusFilter, setStatusFilter] = useState('');
  const [quotes, setQuotes] = useState<GroupedQuotes>({});
  const [loadingTable, setLoadingTable] = useState(false);

  const fetchQuotes = React.useCallback(async () => {
    if (!token || !user?.id) return;

    setLoadingTable(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/quote/${user.id}${query}`, { headers: { token } });
      if (!res.ok) {
        const errorData = await res.json();
        showErrorAlert(errorData.message?.description || 'Error al cargar cotizaciones');
        setQuotes({});
        return;
      }

      const resp = await res.json();
      if (resp.data && Object.keys(resp.data).length > 0) {
        setQuotes(resp.data);
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
  }, [token, user?.id, statusFilter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <PageContainer title="Cotizaciones Enviadas" description="Listado de cotizaciones enviadas por proveedor">
      <DashboardCard title="Cotizaciones enviadas">
        <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">Pendientes</MenuItem>
              <MenuItem value="accepted">Aceptadas</MenuItem>
              <MenuItem value="rejected">Rechazadas</MenuItem>
            </Select>
          </FormControl>
        </Box>

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
                        <TableCell>{showDate(q.date!)}</TableCell>
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

export default SupplierQuotesPage;
