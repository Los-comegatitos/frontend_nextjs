'use client';

import { useEffect, useState } from 'react';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Typography,
  CircularProgress, Select, MenuItem, FormControl, InputLabel,
  Modal, Button,
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
  date?: string;
  eventId?: number;
  eventName?: string;
  providerId?: number;
  status?: string;
};

type GroupedQuotes = Record<string, Quote[]>;

const OrganizerQuotesPage = () => {
  const { token, user } = useAppContext();
  const [allQuotes, setAllQuotes] = useState<GroupedQuotes>({});
  const [quotes, setQuotes] = useState<GroupedQuotes>({});
  const [events, setEvents] = useState<{ id: number; name: string }[]>([]);
  const [eventIdFilter, setEventIdFilter] = useState('');
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

  const fetchQuotes = async () => {
    if (!token || !user?.id) return;

    setLoadingTable(true);
    try {
      const res = await fetch(`/api/quote_pro/${user.id}`, { headers: { token } });
      if (!res.ok) {
        const errorData = await res.json();
        showErrorAlert(errorData.message?.description || 'Error al cargar cotizaciones');
        setAllQuotes({});
        setEvents([]);
        return;
      }

      const resp = await res.json();
      if (resp.data && Object.keys(resp.data).length > 0) {
        setAllQuotes(resp.data);

        const eventMap = new Map<number, string>();
        const allQuotesValues: Quote[][] = Object.values(resp.data) as Quote[][];
        allQuotesValues.forEach((quotesByType) => {
          quotesByType.forEach((q) => {
            if (q.eventId && q.eventName) {
              eventMap.set(q.eventId, q.eventName);
            }
          });
        });

        setEvents(Array.from(eventMap.entries()).map(([id, name]) => ({ id, name })));
      } else {
        setAllQuotes({});
        setEvents([]);
      }
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      showErrorAlert('Error interno al cargar cotizaciones');
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [token, user?.id]);

  useEffect(() => {
    if (!eventIdFilter) {
      setQuotes({});
      return;
    }

    const filtered: GroupedQuotes = {};
    Object.keys(allQuotes).forEach((serviceType) => {
      const filteredQuotes = allQuotes[serviceType].filter(
        (q) => q.eventId?.toString() === eventIdFilter
      );
      if (filteredQuotes.length) filtered[serviceType] = filteredQuotes;
    });
    setQuotes(filtered);
  }, [eventIdFilter, allQuotes]);

  return (
    <PageContainer
      title="Cotizaciones Recibidas"
      description="Listado de cotizaciones recibidas por eventos del organizador"
    >
      <DashboardCard title="Cotizaciones recibidas">
        <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Evento</InputLabel>
            <Select
              value={eventIdFilter}
              label="Evento"
              onChange={(e) => setEventIdFilter(e.target.value)}
            >
              <MenuItem value="">Seleccione un evento</MenuItem>
              {events.map((ev) => (
                <MenuItem key={ev.id} value={ev.id.toString()}>
                  {ev.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          {!eventIdFilter ? (
            <Typography>Seleccione un evento para ver las cotizaciones</Typography>
          ) : loadingTable ? (
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
                      <TableCell>ID</TableCell>
                      <TableCell>Servicio</TableCell>
                      <TableCell>Evento</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotes[serviceType].map((q: Quote) => (
                      <TableRow
                        key={q.id}
                        onClick={() => handleOpenModal(q)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{q.id}</TableCell>
                        <TableCell>{q.name}</TableCell>
                        <TableCell>{q.eventName}</TableCell>
                        <TableCell>{q.price}</TableCell>
                        <TableCell>{q.quantity}</TableCell>
                        <TableCell>
                          {q.date ? new Date(q.date).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ))
          )}
        </Box>

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
    </PageContainer>
  );
};

export default OrganizerQuotesPage;
