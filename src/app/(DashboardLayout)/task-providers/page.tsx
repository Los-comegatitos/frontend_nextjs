'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { showErrorAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';

interface ProviderTask {
  eventId: string;
  eventName: string;
  task: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
}

export default function TaskProvidersPage() {
  const { token } = useAppContext();
  const [tasks, setTasks] = useState<ProviderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ProviderTask | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const res = await fetch('/api/task/provider', {
          headers: { 'token': token as string },
        });

        const data = await res.json();

        if (res.ok && Array.isArray(data?.data)) {
          setTasks(data.data);
        } else {
          setTasks([]);
          showErrorAlert('No se pudieron obtener las tareas asignadas.');
        }
      } catch (error) {
        console.error('Error al obtener tareas:', error);
        showErrorAlert('Error al cargar las tareas.');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

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
      <Typography variant="h5" mb={3} fontWeight={600}>
        Mis tareas asignadas
      </Typography>

      {tasks.length === 0 ? (
        <Typography color="text.secondary">No tienes tareas asignadas.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre de la tarea</TableCell>
              <TableCell>Evento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Comentarios</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((t) => (
              <TableRow
                key={t.task.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => setSelectedTask(t)}
              >
                <TableCell>{t.task.name}</TableCell>
                <TableCell>{t.eventName}</TableCell>
                <TableCell>{t.task.status}</TableCell>
                <TableCell
                  align="center"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/task-providers/${t.task.id}`);
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
                    <Image
                      src="/images/icons/message_9351720.png"
                      alt="Comentarios"
                      width={24}
                      height={24}
                    />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        maxWidth="sm"
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
            pb: 0,
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Detalles de la tarea
          </Typography>
          <IconButton onClick={() => setSelectedTask(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedTask && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Nombre de la tarea:
              </Typography>
              <Typography mb={2}>{selectedTask.task.name}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600}>
                Evento:
              </Typography>
              <Typography mb={2}>{selectedTask.eventName}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600}>
                Estado:
              </Typography>
              <Typography>{selectedTask.task.status}</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedTask(null)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}