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
import { useSearchParams, useRouter } from 'next/navigation';
import { showErrorAlert } from '@/app/lib/swal';

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
}

export default function TaskProvidersPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const token = searchParams.get('token');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTasks() {
      if (!eventId) return;
      setLoading(true);

      try {
        const res = await fetch(`/api/event/${eventId}/task/provider`, {
          headers: { token: token || '' },
        });

        const data = await res.json();

        if (res.ok && Array.isArray(data?.data?.data)) {
          setTasks(data.data.data);
        } else {
          setTasks([]);
          //showErrorAlert('No se pudieron obtener las tareas del evento.');
        }
      } catch (error) {
        console.error('Error al obtener tareas:', error);
        showErrorAlert('Error al cargar las tareas.');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [eventId, token]);

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
        Tareas del evento
      </Typography>

      {tasks.length === 0 ? (
        <Typography color="text.secondary">No hay tareas disponibles.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Comentarios</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => setSelectedTask(task)}
              >
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell
                  align="center"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/events-providers/task-providers/${task.id}?eventId=${eventId}&token=${token}`
                    );
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
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <Typography component="span" variant="h6" fontWeight={600}>
            Detalles de la tarea
          </Typography>
          <IconButton onClick={() => setSelectedTask(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ mt: 1 }}>
          {selectedTask && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Nombre:
              </Typography>
              <Typography mb={2}>{selectedTask.name}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600}>
                Descripción:
              </Typography>
              <Typography mb={2}>{selectedTask.description}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600}>
                Estado:
              </Typography>
              <Typography>{selectedTask.status}</Typography>
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
