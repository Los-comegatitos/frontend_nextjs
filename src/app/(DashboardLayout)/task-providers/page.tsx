'use client';

import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, IconButton, TextField, TablePagination } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { showErrorAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';
import { ProviderTask } from '@/interfaces/ProviderTask';

export default function TaskProvidersPage() {
  const { token } = useAppContext();
  const [tasks, setTasks] = useState<ProviderTask[]>([]);
  const [, setLoadingTable] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ProviderTask | null>(null);
  const router = useRouter();

  // pagination cosas
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTasks = tasks.filter((task) => task.eventName.toLowerCase().includes(search.toLowerCase()));
  const paginatedTasks = filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // fetch task provider
  const fetchTaskProvider = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoadingTable(true);
      const res = await fetch(`/api/task/provider`, { headers: { token: token as string } });
      const data = await res.json();

      if (data.message.code === '000') {
        setTasks(data.data.data);
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
    fetchTaskProvider();
  }, [fetchTaskProvider]);

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: 900,
        mx: 'auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant='h5' mb={3} fontWeight={600}>
        Mis tareas asignadas
      </Typography>

      <Box display='flex' justifyContent='flex-end' mb={2} gap={5}>
        <TextField placeholder='Buscar por evento...' variant='outlined' size='small' value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>

      {tasks.length === 0 ? (
        <Typography color='text.secondary'>No tienes tareas asignadas.</Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre de la tarea</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Fecha límite</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align='center'>Comentarios</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.map((t) => (
                <TableRow key={t.task.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedTask(t)}>
                  <TableCell>{t.task.name}</TableCell>
                  <TableCell>{t.eventName}</TableCell>
                  <TableCell>
                    {t.task.dueDate
                      ? new Date(t.task.dueDate).toLocaleDateString()
                      : 'Sin fecha'}
                  </TableCell>
                  <TableCell>{t.task.status}</TableCell>
                  <TableCell
                    align='center'
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/task-providers/${t.eventId}/${t.task.id}`);
                    }}
                  >
                    <Button
                      sx={{
                        background: 'transparent',
                        border: 'none',
                        minWidth: 'auto',
                        padding: 0,
                      }}
                    >
                      <Image src='/images/icons/message_9351720.png' alt='Comentarios' width={24} height={24} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination labelRowsPerPage={'Filas a mostrar'} component='div' count={filteredTasks.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, { value: -1, label: 'Todos' }]} />
        </>
      )}

      <Dialog
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px', p: 1 },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography fontSize={20} fontWeight={600}>
            Detalles de la tarea
          </Typography>
          <IconButton onClick={() => setSelectedTask(null)} size='small'>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedTask && (
            <Box>
              <Typography variant='subtitle1' fontWeight={600}>
                Nombre de la tarea:
              </Typography>
              <Typography mb={2}>{selectedTask.task.name}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant='subtitle1' fontWeight={600}>
                Evento:
              </Typography>
              <Typography mb={2}>{selectedTask.eventName}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant='subtitle1' fontWeight={600}>
                Estado:
              </Typography>
              <Typography>{selectedTask.task.status}</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedTask(null)} color='primary'>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
