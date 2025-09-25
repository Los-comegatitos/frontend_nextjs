'use client';
import { useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CircularProgress from '@mui/material/CircularProgress';
import { showSucessAlert } from "@/app/lib/swal";

const ClientTypesPage = () => {
  const products = [
    {
      id: '1',
      name: 'Tipo de cliente 1',
      description: 'Tipo de cliente 1 descripcion',
    },
    {
      id: '2',
      name: 'Tipo de cliente 2',
      description: 'Tipo de cliente 2 descripcion',
    },
    {
      id: '3',
      name: 'Tipo de cliente 3',
      description: 'Tipo de cliente 13 descripcion',
    },
  ];

  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedType, setSelectedType] = useState<{ id: string; name: string; description: string } | null>(null);

  // open modal
  const handleRowClick = (type: { id: string; name: string; description: string }) => {
    setSelectedType(type);
    setOpenModal(true);
  };

  // close modal
  const handleClose = () => {
    setOpenModal(false);
  };

   const handleModify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    const formData = new FormData(event.currentTarget);

    const updated = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    
    // some modify logic
    await new Promise((resolve) => setTimeout(resolve, 2000)); // para que se awaitee correctamente

    console.log("modified info:", updated);
    showSucessAlert("¡Tipo de cliente modificado exitosamente!");
    //

    setLoading(false);
    setOpenModal(false);
  };

  return (
    <PageContainer title='Tipos de clientes' description='Página de tipos de clientes'>
      <DashboardCard title='Tipos de clientes'>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
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
              {products.map((type) => (
                <TableRow
                  key={type.name}
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
        </Box>
      </DashboardCard>

      {/* modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Modifica tipo de cliente</DialogTitle>
        <DialogContent dividers>
          {selectedType && (
            <Box component='form' onSubmit={handleModify} display='flex' flexDirection='column' gap={2} mt={1}>
              <TextField label='ID' name='id' defaultValue={selectedType.id} disabled />
              <TextField label='Name' name='name' defaultValue={selectedType.name} required/>
              <TextField label='Description' name='description' defaultValue={selectedType.description} required/>
              <Box display="flex" justifyContent="center" gap={2}>
                <Button variant='contained' type='submit' color='primary' disabled={loading}>
                  Modify
                  {loading && <CircularProgress size="15px" className={'ml-2'} />}
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
