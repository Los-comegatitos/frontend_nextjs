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
  Modal,
  Button,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useAppContext } from '@/context/AppContext';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';

type Quote = {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  date?: string;
  eventId?: number;
  eventName?: string;
  providerId?: number;
  status?: string;
};

type GroupedQuotes = Record<string, Quote[]>;

interface OrganizerQuotesPageProps {
  eventId?: string;
}

const OrganizerQuotesPage = ({ eventId }: OrganizerQuotesPageProps) => {
  const { token, user } = useAppContext();
  const [quotes, setQuotes] = useState<GroupedQuotes>({});
  const [loadingTable, setLoadingTable] = useState(false);

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (quote: Quote) => {
    setSelectedQuote(quote);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedQuote(null);
    setModalOpen(false);
  };

  const handleAproveModal = React.useCallback(async () => {
    if (!token || !selectedQuote) return
    console.log(selectedQuote);
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/quote/${selectedQuote.id}?${new URLSearchParams({
        state: 'accept'
      })}`, 
        { 
          method: 'POST', 
          headers: { token } 
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        showErrorAlert(errorData.message?.description || 'Error al aceptar cotizacións');
        return;
      }

      await showSucessAlert('Se aceptó la cotización exitosamente')
    } catch (error) {
      console.error(error);
      await showErrorAlert('Error interno al aceptar cotización');
    } finally {
      handleCloseModal()
      setLoadingTable(false);
    }
  }, [token, selectedQuote]);

  const handleDisaproveModal = React.useCallback(async () => {
    if (!token || !selectedQuote) return
    console.log(selectedQuote);
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/quote/${selectedQuote.id}?${new URLSearchParams({
        state: 'reject'
      })}`, 
        { 
          method: 'POST', 
          headers: { token } 
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        await showErrorAlert(errorData.message?.description || 'Error al rechazar cotización');
        return;
      }

      await showSucessAlert('Se rechazó la cotización exitosamente')
    } catch (error) {
      console.error(error);
      await showErrorAlert('Error interno al rechazar cotizaciones');
    } finally {
      handleCloseModal()
      setLoadingTable(false);
    }
  }, [token, selectedQuote]);

  const fetchQuotes = React.useCallback(async () => {
    if (!token || !user?.id || !eventId) return;

    setLoadingTable(true);
    try {
      const res = await fetch(`/api/quote_pro/${user.id}`, { headers: { token } });
      if (!res.ok) {
        const errorData = await res.json();
        showErrorAlert(errorData.message?.description || 'Error al cargar cotizaciones');
        setQuotes({});
        return;
      }

      const resp = await res.json();
      console.log(resp);

      if (resp.data && Object.keys(resp.data).length > 0) {
        const filtered: GroupedQuotes = {};
        Object.keys(resp.data).forEach((serviceType) => {
          const filteredQuotes = resp.data[serviceType].filter(
            (q: Quote) => q.eventId?.toString() === eventId
          );
          if (filteredQuotes.length) filtered[serviceType] = filteredQuotes;
        });
        setQuotes(filtered);
      } else {
        setQuotes({});
      }
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      showErrorAlert('Error interno al cargar cotizaciones');
    } finally {
      setLoadingTable(false);
    }
  }, [token, user?.id, eventId]);

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
    <DashboardCard title="Cotizaciones Recibidas">
      {loadingTable ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '150px',
          }}
        >
          <CircularProgress size="55px" />
        </Box>
      ) : Object.keys(quotes).length === 0 ? (
        <Typography>No hay cotizaciones para este evento</Typography>
      ) : (
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            {Array.from({ length: 2 }).map((_, i) => (
              <col key={i} style={{ width: `${100 / 2}%` }} />
            ))}
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell sx={cellStyle}>Servicio</TableCell>
              <TableCell sx={cellStyle}>Precio</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(quotes).map((serviceType) => (
              <React.Fragment key={serviceType}>
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{ ...cellStyle, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}
                  >
                    {serviceType}
                  </TableCell>
                </TableRow>
                {quotes[serviceType].map((q: Quote) => (
                  <TableRow
                    key={q.id}
                    onClick={() => handleOpenModal(q)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedQuote?.id === q.id ? 'rgba(63, 81, 181, 0.1)' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(63, 81, 181, 0.2)',
                      },
                    }}
                  >
                    <TableCell sx={cellStyle}>{q.name}</TableCell>
                    <TableCell sx={cellStyle}>{q.price}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 450 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {selectedQuote && (
            <>
              <Typography variant="h6" mb={2} textAlign="center">
                Detalle de Cotización
              </Typography>

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Typography>
                  <strong>Servicio:</strong> {selectedQuote.name}
                </Typography>

                {selectedQuote.description && (
                  <Typography>
                    <strong>Descripción:</strong> {selectedQuote.description}
                  </Typography>
                )}

                <Typography>
                  <strong>Evento:</strong> {selectedQuote.eventName}
                </Typography>

                <Typography>
                  <strong>Precio:</strong>{' '}
                  {selectedQuote.price?.toLocaleString('es-VE', {
                    style: 'currency',
                    currency: 'USD',
                  }) ?? '-'}
                </Typography>

                <Typography>
                  <strong>Cantidad:</strong> {selectedQuote.quantity ?? '-'}
                </Typography>

                <Typography>
                  <strong>Fecha:</strong>{' '}
                  {selectedQuote.date ? new Date(selectedQuote.date).toLocaleString() : '-'}
                </Typography>

                <Typography>
                  <strong>Proveedor:</strong> {selectedQuote.providerId ?? '-'}
                </Typography>

                <Typography>
                  <strong>Estado:</strong>{' '}
                  {statusLabels[selectedQuote.status ?? ''] || selectedQuote.status || '-'}
                </Typography>
              </Box>

              <Box mt={3} display="flex" justifyContent="space-evenly">
                {/* <Button variant="contained" onClick={handleCloseModal}>
                  Aceptar
                </Button>
                <Button variant="contained" onClick={handleCloseModal}>
                  Rechazar
                </Button> */}
                <Button variant='contained' color='success' onClick={handleAproveModal} disabled={loadingTable}>
                  Aceptar
                </Button>
                <Button variant='contained' color='error' onClick={handleDisaproveModal} disabled={loadingTable}>
                  Rechazar
                </Button>
                <Button variant="contained" onClick={handleCloseModal}>
                  Cerrar
                </Button>
              </Box>
              
            </>
          )}
        </Box>
      </Modal>
    </DashboardCard>
  );
};

export default OrganizerQuotesPage;
