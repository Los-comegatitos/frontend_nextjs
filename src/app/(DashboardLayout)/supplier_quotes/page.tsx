'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

  const cellStyle = {
    textAlign: 'center' as const,
    padding: '8px',
    whiteSpace: 'normal' as const,
    wordBreak: 'break-word' as const,
    verticalAlign: 'middle' as const,
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
  };

  return (
    <PageContainer title="Cotizaciones Enviadas" description="Listado de cotizaciones enviadas por proveedor">
      <DashboardCard title="Cotizaciones enviadas">
        <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              label="Estado"
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
            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <col key={i} style={{ width: `${100 / 6}%` }} />
                ))}
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell sx={cellStyle}>Servicio</TableCell>
                  <TableCell sx={cellStyle}>Evento</TableCell>
                  <TableCell sx={cellStyle}>Precio</TableCell>
                  <TableCell sx={cellStyle}>Cantidad</TableCell>
                  <TableCell sx={cellStyle}>Estado</TableCell>
                  <TableCell sx={cellStyle}>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(quotes).map((serviceType) => (
                  <React.Fragment key={serviceType}>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        {serviceType}
                      </TableCell>
                    </TableRow>
                    {quotes[serviceType].map((q: Quote) => (
                      <TableRow key={q.id}>
                        <TableCell sx={cellStyle}>{q.name}</TableCell>
                        <TableCell sx={cellStyle}>{q.eventName}</TableCell>
                        <TableCell sx={cellStyle}>{q.price}</TableCell>
                        <TableCell sx={cellStyle}>{q.quantity}</TableCell>
                        <TableCell sx={cellStyle}>{statusLabels[q.status ?? ''] || q.status}</TableCell>
                        <TableCell sx={cellStyle}>{showDate(q.date!)}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default SupplierQuotesPage;
