'use client';
import { useEffect, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert, showSucessAlert } from '@/lib/swal';
import { AuxiliarType } from '@/interfaces/AuxiliarType';

const ClientTypesPage = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  type ModalMode = 'add' | 'modify';
  const [clientTypes, setClientTypes] = useState<AuxiliarType[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [openModal, setOpenModal] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<AuxiliarType | null>(null);

  // fetch client types (to table)
  const fetchClientTypes = async () => {
    try {
      setLoadingTable(true);
      const res = await fetch(`${API_BASE_URL}/client-type`);
      const data = await res.json();

      if (data.message.code === '000') {
        setClientTypes(data.data);
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
    fetchClientTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setSelectedType({ id: '', name: '', description: '' });
    setModalMode('add');
    setOpenModal(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    try {
      let res;
      if (modalMode === 'modify') {
        res = await fetch(`${API_BASE_URL}/client-type/${formData.get('id')}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (modalMode === 'add') {
        res = await fetch(`${API_BASE_URL}/client-type`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.message.code === '000') {
        showSucessAlert(modalMode === 'add' ? 'Tipo de cliente añadido exitosamente.' : 'Tipo de cliente modificado exitosamente.');
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error', err);
    } finally {
      fetchClientTypes();
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/client-type/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert('Tipo de cliente eliminado exitosamente');
      } else {
        showErrorAlert(data.message.description);
      }
    } catch (err) {
      console.error('Error', err);
    } finally {
      fetchClientTypes();
      setLoading(false);
      setOpenModal(false);
    }
  };
  console.log("modified info:", updated);
  showSucessAlert("¡Tipo de cliente modificado exitosamente!");
    //
  const handleRowClick = (type: AuxiliarType) => {
    setSelectedType(type);
    setModalMode('modify');
    setOpenModal(true);
  };

  // close modal
  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Tipos de cliente' description='Página de tipos de clientes'>
      <DashboardCard title='Tipos de cliente'>
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
            <Table aria-label='client table' sx={{ whiteSpace: 'nowrap', mt: 2 }}>
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
                {clientTypes.map((type) => (
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
        <DialogTitle>{modalMode === 'add' ? 'Añadir tipo de cliente' : 'Modificar tipo de cliente'}</DialogTitle>
        <DialogContent dividers>
          {selectedType && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2} mt={1}>
              {modalMode === 'modify' && <TextField label='ID' name='id' defaultValue={selectedType.id} slotProps={{ input: { readOnly: true } }} />}
              <TextField label='Name' name='name' defaultValue={selectedType.name} required />
              <TextField label='Description' name='description' defaultValue={selectedType.description} required />
              <Box display='flex' justifyContent='center' gap={2}>
                {modalMode === 'modify' && (
                  <Button variant='outlined' color='error' onClick={() => handleDelete(selectedType.id)} disabled={loading}>
                    Eliminar
                    {loading && <CircularProgress size='15px' className={'ml-2'} />}
                  </Button>
                )}
                <Button variant='contained' type='submit' color='primary' disabled={loading}>
                  {modalMode === 'add' ? 'Agregar' : 'Modificar'}
                  {loading && <CircularProgress size='15px' className={'ml-2'} />}
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

export default ClientTypesPage;
