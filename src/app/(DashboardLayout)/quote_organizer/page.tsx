'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Typography,
  CircularProgress, Modal, Button,
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useAppContext } from '@/context/AppContext';
import { showErrorAlert } from '@/app/lib/swal';

type Quote = {
  id?: number;
  name?: string;
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
        Object.keys(quotes).map((serviceType) => (
          <Box key={serviceType} mb={4}>
            <Typography variant="h6" mb={1}>
              {serviceType}
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Precio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes[serviceType].map((q: Quote) => (
                  <TableRow
                    key={q.id}
                    onClick={() => handleOpenModal(q)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: selectedQuote?.id === q.id ? 'rgba(63, 81, 181, 0.1)' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(63, 81, 181, 0.2)',
                      },
                    }}
                  >
                    <TableCell>{q.name}</TableCell>
                    <TableCell>{q.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))
      )}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {selectedQuote && (
            <>
              <Typography variant="h6" mb={2}>
                Cotización #{selectedQuote.id}
              </Typography>
              <Typography><strong>Servicio:</strong> {selectedQuote.name}</Typography>
              <Typography><strong>Evento:</strong> {selectedQuote.eventName}</Typography>
              <Typography><strong>Precio:</strong> {selectedQuote.price}</Typography>
              <Typography><strong>Cantidad:</strong> {selectedQuote.quantity}</Typography>
              <Typography>
                <strong>Fecha:</strong> {selectedQuote.date ? new Date(selectedQuote.date).toLocaleString() : '-'}
              </Typography>
              <Typography><strong>Proveedor:</strong> {selectedQuote.providerId}</Typography>
              <Typography><strong>Estado:</strong> {selectedQuote.status}</Typography>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" onClick={handleCloseModal}>Cerrar</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </DashboardCard>
  );
};

export default OrganizerQuotesPage;
