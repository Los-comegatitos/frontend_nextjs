'use client';
import * as React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { Event } from '@/interfaces/Event';
import { Service } from '@/interfaces/Event';
import { useEffect, useState } from 'react';
import { AuxiliarType } from '@/interfaces/AuxiliarType';

type ServicesTabProps = {
  token: string;
  event: Event;
  onRefresh: () => void;
};

export default function ServicesTab({ token, event, onRefresh }: ServicesTabProps) {
  const [serviceTypesSelect, setServiceTypesSelect] = useState<AuxiliarType[]>([]);
  const [modalMode, setModalMode] = useState<'add' | 'modify'>('modify');
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fetchServiceTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/service-type`, {
        headers: { token },
      });
      const data = await res.json();
      if (data.message.code === '000') {
        setServiceTypesSelect(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchServiceTypes();
  }, [fetchServiceTypes, token]);

  const handleRowClick = (service: Service) => {
    setSelectedService(service);
    setModalMode('modify');
    setOpenModal(true);
  };

  const handleAdd = () => {
    setSelectedService({
      serviceTypeId: '',
      name: '',
      description: '',
      quantity: null,
    } as Service);
    setModalMode('add');
    setOpenModal(true);
  };

  const handleSubmit = async (eventReact: React.FormEvent<HTMLFormElement>) => {
    eventReact.preventDefault();
    setLoading(true);

    const formData = new FormData(eventReact.currentTarget);

    const selectedId = formData.get('serviceTypeId') as string;
    const selectedType = serviceTypesSelect.find(t => parseInt(t.id) === parseInt(selectedId));

    const payload = {
      serviceTypeId: selectedId,
      serviceTypeName: selectedType?.name ?? '',
      name: formData.get('name') as string,
      dueDate: formData.get('dueDate') as string,
      description: formData.get('description') as string,
      quantity: formData.get('quantity') === '' ? null : Number(formData.get('quantity')),
    };

    //  validacion para no permitir fechas pasadas
    const today = new Date();
    const dueDate = new Date(payload.dueDate);
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      setLoading(false);
      showErrorAlert('La fecha límite no puede ser anterior a la fecha actual.');
      return;
    }

    try {
      let url = `/api/event/${event.eventId}/services`;
      let method = 'POST';

      if (modalMode === 'modify') {
        url = `/api/event/${event.eventId}/services/${payload.name}`;
        method = 'PATCH';
      }

      const res = await fetch(url, {
        method,
        headers: { token },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(modalMode === 'add' ? 'Servicio añadido exitosamente' : 'Servicio modificado exitosamente');
        onRefresh();
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error saving service:', err);
    } finally {
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleDelete = async (serviceName: string | undefined) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/event/${event.eventId}/services/${serviceName}`, {
        method: 'DELETE',
        headers: { token },
      });
      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert('Servicio eliminado exitosamente');
        onRefresh();
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error', err);
    } finally {
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleClose = () => setOpenModal(false);

  return (
    <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
      <Box sx={{ display: 'flex', mb: 3, justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleAdd}>
          Añadir servicio
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Servicio</TableCell>
              <TableCell>Descripción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {event?.services?.map((service) => (
              <TableRow
                key={service.name}
                className="cursor-pointer hover:bg-indigo-100 active:bg-indigo-200"
                onClick={() => {
                  handleRowClick(service);
                }}
              >
                <TableCell>
                  <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{service.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{service.description}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal servicio */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{modalMode === 'add' ? 'Agregar servicio' : 'Modificar servicio'}</DialogTitle>
        <DialogContent dividers>
          {selectedService && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              display="flex"
              flexDirection="column"
              gap={2}
              mt={1}
            >
              <p>Tipo de servicio</p>
              <Select
                name="serviceTypeId"
                defaultValue={selectedService.serviceTypeId || ''}
                required
              >
                {serviceTypesSelect.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField label="Nombre" name="name" defaultValue={selectedService.name} required />
              <TextField label="Descripción" name="description" defaultValue={selectedService.description} required />
              <TextField label="Cantidad" name="quantity" type="number" defaultValue={selectedService.quantity ?? ''} />

              <TextField
                type="date"
                label="Fecha límite para cotizaciones"
                name="dueDate"
                defaultValue={selectedService.dueDate?.split('T')[0]}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                required
              />

              <Box display="flex" justifyContent="center" gap={2}>
                {modalMode === 'modify' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(selectedService.name)}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                )}
                <Button variant="contained" type="submit" disabled={loading}>
                  {modalMode === 'add' ? 'Agregar' : 'Modificar'}
                  {loading && <CircularProgress size="15px" className="ml-2" />}
                </Button>
                <Button onClick={handleClose} color="secondary" disabled={loading}>
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
