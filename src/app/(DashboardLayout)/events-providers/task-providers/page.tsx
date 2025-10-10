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
} from '@mui/material';
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  useEffect(() => {
    async function fetchTasks() {
      if (!eventId || !API_BASE_URL) return;
      try {
        const res = await fetch(`${API_BASE_URL}events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok && data?.data?.tasks) {
          setTasks(data.data.tasks);
        } else {
          showErrorAlert('No se pudieron obtener las tareas del evento.');
        }
      } catch (error) {
        console.error('Error al obtener tareas:', error);
        showErrorAlert('Error al cargar las tareas.');
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [eventId, API_BASE_URL, token]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

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
              <TableRow key={task.id} hover>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() =>
                      router.push(
                        `/events-providers/task-providers/${task.id}?eventId=${eventId}&token=${token}`
                      )
                    }
                    sx={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
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
    </Box>
  );
}
