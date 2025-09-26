'use client';
import * as React from 'react';
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Dialog, DialogTitle, DialogContent, Button, TextField, CircularProgress, Select, MenuItem } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { AuxiliarType } from '@/interfaces/AuxiliarType';
import { Service } from '@/interfaces/Service';
import { Catalog } from '@/interfaces/Catalog';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

// tooda la lógica rara para rows expandibles (según la doc de mui)
function Row({ type, services, onServiceClick }: { type: AuxiliarType; services: Service[]; onServiceClick: (service: Service) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component='th' scope='row'>
          <Typography>{type.name}</Typography>
        </TableCell>
        <TableCell>{type.description}</TableCell>
      </TableRow>

      {/* colapsable de servicios */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size='small' aria-label='services'>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.name} className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200' onClick={() => onServiceClick(service)}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.quantity ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CatalogPage() {

  const { token } = useAppContext();
  

  const [serviceTypes, setServiceTypes] = useState<AuxiliarType[]>([]);
  const [serviceTypesSelect, setServiceTypesSelect] = useState<AuxiliarType[]>([]);

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'modify'>('modify');
  const [loadingTable, setLoadingTable] = useState(true);

  const [openDescModal, setOpenDescModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fetchServiceTypes = async () => {
    try {
      const res = await fetch(`/api/service-type`, { headers: { 'token': token as string, }, });
      const data = await res.json();

      if (data.message.code === '000') {
        setServiceTypesSelect(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('error:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoadingTable(true);
      const res = await fetch(`/api/catalog`, { headers: { 'token': token as string, }, });
      const data = await res.json();
      if (data.message.code === '000') {
        setCatalog(data.data.catalog);
        setServiceTypes(data.data.serviceTypes);
      } else {
        showErrorAlert(data.message.description);
      }
      setLoadingTable(false);
    } catch (err) {
      setLoadingTable(false);
      console.error('Error', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
      fetchServiceTypes();
    }
  }, [token]);

  const handleModifyDescription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const newDescription = formData.get('description') as string;

    try {
      const res = await fetch(`/api/catalog`, {
        method: 'PATCH',
        headers: { 'token': token as string, },
        body: JSON.stringify({ description: newDescription }),
      });

      const data = await res.json();
      if (data.message.code === '000') {
        showSucessAlert('Descripción modificada exitosamente');
        setOpenDescModal(false);
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      fetchData();
    }
  };

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      serviceTypeId: formData.get('serviceTypeId') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      quantity: formData.get('quantity') === '' ? null : Number(formData.get('quantity')),
    };

    try {
      let url = `/api/catalog/services`;
      let method = 'POST';

      if (modalMode === 'modify') {
        url = `/api/catalog/services/${selectedService.name}`;
        method = 'PATCH';
      }

      const res = await fetch(url, {
        method,
        headers: { 'token': token as string, },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(modalMode === 'add' ? 'Service added successfully' : 'Service modified successfully');
        fetchData();
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
      const res = await fetch(`/api/catalog/services/${serviceName}`, { method: 'DELETE', headers: { 'token': token as string, }, });
      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert('Service eliminado exitosamente ');
        fetchData();
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

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Catálogo' description='Catalog Page'>
      <DashboardCard title='Catálogo'>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          <Typography variant='h6' fontWeight={600} mb={2}>
            Descripción
          </Typography>
          {catalog && <Typography mb={3}>{catalog.description}</Typography>}

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 4, columnGap: 2 }}>
            <Button variant='contained' color='primary' onClick={handleAdd}>
              Añadir servicio
            </Button>

            <Button variant='outlined' onClick={() => setOpenDescModal(true)}>
              Modificar descripción
            </Button>
          </Box>

          {loadingTable ? (
            <Box sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size='55px' className='mb-2' />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table aria-label='collapsible table'>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Tipo de servicio</TableCell>
                    <TableCell>Descripción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceTypes.map((type) => (
                    <Row key={type.id} type={type} services={catalog.services.filter((s) => parseInt(s.serviceTypeId) === parseInt(type.id))} onServiceClick={handleRowClick} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DashboardCard>

      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{modalMode === 'add' ? 'Agregar servicio' : 'Modificar servicio'}</DialogTitle>
        <DialogContent dividers>
          {selectedService && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2} mt={1}>
              <p>Tipo de servicio</p>
              <Select name='serviceTypeId' defaultValue={selectedService.serviceTypeId || ''} required>
                {serviceTypesSelect.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField label='Nombre' name='name' defaultValue={selectedService.name} required />
              <TextField label='Descripción' name='description' defaultValue={selectedService.description} required />
              <TextField label='Cantidad' name='quantity' type='number' defaultValue={selectedService.quantity ?? ''} />

              <Box display='flex' justifyContent='center' gap={2}>
                {modalMode === 'modify' && (
                  <Button variant='outlined' color='error' onClick={() => handleDelete(selectedService.name)} disabled={loading}>
                    Eliminar
                  </Button>
                )}
                <Button variant='contained' type='submit' color='primary' disabled={loading}>
                  {modalMode === 'add' ? 'Agregar' : 'Modificar'}
                  {loading && <CircularProgress size='15px' className={'ml-2'} />}
                </Button>
                <Button onClick={handleClose} color='secondary' disabled={loading}>
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* modal para descripcion */}
      <Dialog open={openDescModal} onClose={() => setOpenDescModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Modificar descripción</DialogTitle>
        <DialogContent dividers>
          <Box component='form' onSubmit={handleModifyDescription} display='flex' flexDirection='column' gap={2} mt={1}>
            <TextField label='Descripción' name='description' defaultValue={catalog?.description ?? ''} required multiline />
            <Box display='flex' justifyContent='center' gap={2}>
              <Button variant='contained' type='submit' color='primary' disabled={loading}>
                Guardar
                {loading && <CircularProgress size='15px' className='ml-2' />}
              </Button>
              <Button onClick={() => setOpenDescModal(false)} color='secondary' disabled={loading}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
