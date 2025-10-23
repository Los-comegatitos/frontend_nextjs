'use client';
import React, { useEffect, useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import TablePagination from '@mui/material/TablePagination'; // NEW
import CircularProgress from '@mui/material/CircularProgress';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';
import { User } from '@/interfaces/User';

const UsersPage = () => {
  type ModalMode = 'add' | 'modify';
  const [users, setUsers] = useState<User[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [openModal, setOpenModal] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { token } = useAppContext();

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // fetch client types (to table)
  const fetchClientTypes = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoadingTable(true);
      const res = await fetch('/api/user', {
        headers: { token: token as string },
      });

      const data = await res.json();

      if (data.message.code === '000') {
        setUsers(data.data);
      } else {
        showErrorAlert(data.message.description);
      }
      setLoadingTable(false);
    } catch (err) {
      setLoadingTable(false);
      console.error('error:', err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchClientTypes();
  }, [fetchClientTypes, token]);

  // pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);  
  };

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(search.toLowerCase()));

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAdd = () => {
    setUser({ id: 0, firstName: '', lastName: '', email: '', typeuser: {id:1, name:'', description: ''} });
    setModalMode('add');
    setOpenModal(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      let res;
      if (modalMode === 'modify') {
        res = await fetch(`/api/user/update-password/${formData.get('id')}`, {
          method: 'POST',
          headers: { token: token as string },
          body: JSON.stringify({password: formData.get('password') as string}),
        });
      }

      if (modalMode === 'add') {
        res = await fetch(`/api/user/create-admin`, {
          method: 'POST',
          headers: { token: token as string },
          body: JSON.stringify(payload),
        });
      }

      const data = await res!.json();
      if (data.message?.code === '000' || data.ok) {
        showSucessAlert(modalMode === 'add' ? 'Administrador registrado exitosamente.' : 'Contraseña cambiada exitosamente.');
      } else {
        if (modalMode === 'add') showErrorAlert(data.body);
        else showErrorAlert(data.message.description)
      }
    } catch (err) {
      console.error('Error', err);
    } finally {
      fetchClientTypes();
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleRowClick = (user: User) => {
    setUser(user);
    setModalMode('modify');
    setOpenModal(true);
  };

  // close modal
  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <PageContainer title='Usuario' description='Página de Usuarios'>
      <DashboardCard title='Usuarios'>
        <Box display='flex' justifyContent='flex-end' mb={2} gap={5}>
          <TextField placeholder='Buscar por email...' variant='outlined' size='small' value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant='contained' color='primary' onClick={handleAdd}>
            Añadir administrador
          </Button>
        </Box>
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          {loadingTable ? (
            <Box sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size='55px' className='mb-2' />
            </Box>
          ) : (
            <>
              <Table aria-label='client table' sx={{ whiteSpace: 'nowrap', mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Email
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Nombre
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Rol
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className='cursor-pointer hover:bg-indigo-100 active:bg-indigo-200'
                      onClick={() => {
                        handleRowClick(user);
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{user.firstName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>{user.typeuser.name}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination labelRowsPerPage={"Filas a mostrar"} component='div' count={filteredUsers.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, { value: -1, label: 'Todos' }]} />
            </>
          )}
        </Box>
      </DashboardCard>

      {/* modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{modalMode === 'add' ? 'Registrar administrador' : 'Cambiar contraseña'}</DialogTitle>
        <DialogContent dividers>
          {user && (
            <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2} mt={1}>
              {modalMode === 'modify' && <TextField label='ID' name='id' defaultValue={user.id} slotProps={{ input: { readOnly: true } }} />}
              <TextField label='Nombre' name='firstName' defaultValue={user.firstName} required slotProps={{ input: { readOnly: modalMode === 'modify'} }} />
              <TextField label='Apellido' name='lastName' defaultValue={user.lastName} required slotProps={{ input: { readOnly: modalMode === 'modify' } }}/>
              {modalMode === 'modify' && <TextField label='Telefono' name='telephone' defaultValue={user?.telephone} slotProps={{ input: { readOnly: true } }} />}
              {modalMode === 'modify' && <TextField label='Fecha de nacimiento' name='birthDate' defaultValue={user?.birthDate} slotProps={{ input: { readOnly: true } }} />}
              <TextField label='Email' name='email' defaultValue={user.email} required slotProps={{ input: { readOnly: modalMode === 'modify' } }}/>
              <TextField label={modalMode === 'modify' ? 'Nueva contraseña' : 'Contraseña'} name='password' required />

              <Box display='flex' justifyContent='center' gap={2}>

                <Button variant='contained' type='submit' color='primary' disabled={loading}>
                  {modalMode === 'add' ? 'Registrar administrador' : 'Cambiar contraseña'}
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

export default UsersPage;
