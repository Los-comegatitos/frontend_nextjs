'use client';
import * as React from 'react';
import {
  Box,
  Collapse,
  IconButton,
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
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { showSucessAlert } from '@/lib/swal';
import { ServiceType } from '@/interfaces/ServiceType';
import { Service } from '@/interfaces/Service';

// implementar un método en el back que me traiga los tipos de servicio que tiene un catalogo
const serviceTypes: ServiceType[] = [
  { id: '1', name: 'Tipo de servicio 1', description: 'Descripcion tipo 1' },
  { id: '2', name: 'Tipo de servicio 2', description: 'Descripcion tipo 2' },
  { id: '3', name: 'Tipo de servicio 3', description: 'Descripcion tipo 3' },

];

const catalog = {
  id: 'c1',
  description: 'Catálogo de servicios del proveedor',
  services: [
    {
      serviceTypeId: '1',
      name: 'Servicio A',
      description: 'Descripción servicio A',
      quantity: 5,
    },
    {
      serviceTypeId: '1',
      name: 'Servicio B',
      description: 'Descripción servicio B',
      quantity: null,
    },
    {
      serviceTypeId: '2',
      name: 'Servicio C',
      description: 'Descripción servicio C',
      quantity: 10,
    },
  ] as Service[],
};

// tooda la lógica rara para rows expandibles (según la doc de mui)
function Row({
  type,
  services,
  onServiceClick,
}: {
  type: ServiceType;
  services: Service[];
  onServiceClick: (service: Service) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label='expand row'
            size='small'
            onClick={() => setOpen(!open)}
          >
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
                    <TableRow
                      key={service.name}
                      className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200'
                      onClick={() => onServiceClick(service)}
                    >
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
  const [openModal, setOpenModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(
    null
  );

  const handleRowClick = (service: Service) => {
    setSelectedService(service);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleModify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const updated = {
      serviceTypeId: formData.get('serviceTypeId') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      quantity:
        formData.get('quantity') === ''
          ? null
          : Number(formData.get('quantity')),
    };

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('modified info:', updated);
    showSucessAlert('Service modified successfully');

    setLoading(false);
    setOpenModal(false);
  };

  return (
    <PageContainer title='Catálogo' description='Catalog Page'>
      <DashboardCard title='Catálogo'>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          <Typography variant='h6' fontWeight={600} mb={2}>
            Descripción
          </Typography>
          <Typography mb={3}>{catalog.description}</Typography>

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
                  <Row
                    key={type.id}
                    type={type}
                    services={catalog.services.filter(
                      (s) => s.serviceTypeId === type.id
                    )}
                    onServiceClick={handleRowClick}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DashboardCard>

      {/* Modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Modificar servicio</DialogTitle>
        <DialogContent dividers>
          {selectedService && (
            <Box
              component='form'
              onSubmit={handleModify}
              display='flex'
              flexDirection='column'
              gap={2}
              mt={1}
            >
              <p>Tipo de servicio</p>
              <Select
                name='serviceTypeId'
                defaultValue={selectedService.serviceTypeId}
                required
              >
                {serviceTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label='Nombre'
                name='name'
                defaultValue={selectedService.name}
                required
              />
              <TextField
                label='Descripción'
                name='description'
                defaultValue={selectedService.description}
                required
              />
              <TextField
                label='Cantidad'
                name='quantity'
                type='number'
                defaultValue={selectedService.quantity ?? ''}
              />
              <Box display='flex' justifyContent='center' gap={2}>
                <Button
                  variant='contained'
                  type='submit'
                  color='primary'
                  disabled={loading}
                >
                  Modificar
                  {loading && (
                    <CircularProgress size='15px' className={'ml-2'} />
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  color='secondary'
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
