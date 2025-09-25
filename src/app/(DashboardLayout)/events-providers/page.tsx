'use client';
import { useEffect, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert } from '@/lib/swal';
import { AuxiliarType } from '@/interfaces/AuxiliarType';

const EventsProvidersPage = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [eventTypes, setEventTypes] = useState<AuxiliarType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<AuxiliarType | null>(null);

  // Traer los tipos de evento de la API para mostrarlos en la tabla.
  const fetchEventTypes = async () => {
    try {
      setLoadingTable(true);
      const res = await fetch(`${API_BASE_URL}/event-type`);
      const data = await res.json();

      if (data.message.code === '000') {
        setEventTypes(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
      setLoadingTable(false);
    } catch (err) {
      setLoadingTable(false);
      console.error('error:', err);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setSelectedType({ id: '', name: '', description: '' });
    setOpenModal(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

  };

  const handleRowClick = (type: AuxiliarType) => {
    setSelectedType(type);
    setOpenModal(true);
  };

  // close modal
  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Tipos de evento' description='Event Types Page'>
      <DashboardCard title='Tipos de evento'>
        <Box display='flex' justifyContent='flex-end' mb={2}>
          <Button variant='contained' color='primary' onClick={handleAdd}>
            Añadir
          </Button>
        </Box>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          {loadingTable ? (
            <Box sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size='55px' className='mb-2' />
            </Box>
          ) : (
            <Table aria-label='event table' sx={{ whiteSpace: 'nowrap', mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant='subtitle2' fontWeight={600}>
                      ID
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='subtitle2' fontWeight={600}>
                      Name
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {eventTypes.map((type) => (
                  <TableRow
                    key={type.id}
                    className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200'
                    onClick={() => {
                      handleRowClick(type);
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{type.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{type.name}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </DashboardCard>

      {/* modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Añadir tipo de evento</DialogTitle>
        <DialogContent dividers>
          {selectedType && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2} mt={1}>
              
              <TextField label='Name' name='name' defaultValue={selectedType.name} required />
              <TextField label='Description' name='description' defaultValue={selectedType.description} required />
              <Box display='flex' justifyContent='center' gap={2}>
                
                <Button variant='contained' type='submit' color='primary' disabled={loading}>
    
                </Button>
                <Button onClick={handleClose} color='secondary' disabled={loading}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default EventsProvidersPage;
