'use client';

import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { showSucessAlert, showErrorAlert } from '@/app/lib/swal';
import { BackendComment, TaskComment } from '@/interfaces/Task';


export default function CommentsPage() {
  const { EventId: eventId, taskId } = useParams();
  const [taskName, setTaskName] = useState<string>('Cargando...');
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<TaskComment[]>([]);  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Cargar comentarios
  const fetchComments = React.useCallback(async () => {
    if (!eventId || !taskId || !token) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/event/${eventId}/task/${taskId}/comments`, {
        headers: { token: token as string },
      });
      const data = await res.json();

      if (res.ok && data.message.code === '000') {
        const backendComments: BackendComment[] = data.data;
        const mapped: TaskComment[] = backendComments.map((c) => ({
          id: c._id,
          text: c.description,
          author: c.userType === 'organizer' ? 'Organizador' : 'Proveedor',
          date: new Date(c.date).toLocaleString(),
        }));
        setComments(mapped);
      }   
      else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, taskId, token]);

  // Obtener nombre de la tarea
  useEffect(() => {
    async function fetchTaskName() {
      try {
        const res = await fetch(`/api/event/${eventId}/task/provider`, {
          headers: { token: token as string },
        });
        const data = await res.json();

        if (res.ok && data.message.code === '000') {

          interface BackendTask {
          id: string;
          name: string;
          description?: string;
          status?: string;
          comments?: BackendComment[];
        }

        const backendTasks: BackendTask[] = data.data;
        const found = backendTasks.find((t) => t.id === taskId);

          setTaskName(found ? found.name : 'Tarea no encontrada');
        } else {
          setTaskName('Error al obtener tarea');
        }
      } catch (err) {
        console.error('Error al obtener tarea:', err);
        setTaskName('Error al cargar tarea');
      }
    }
    fetchTaskName();
  }, [eventId, taskId, token]);

  // Cargar comentarios al inicio
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Enviar comentario (como proveedor)
  const handleSendComment = async () => {
    if (!comment.trim()) return showErrorAlert('Escribe un comentario.');

    try {
      const res = await fetch(`/api/event/${eventId}/task/${taskId}/comments/provider`, {
        method: 'PATCH',
        headers: {
          token: token as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: comment }),
      });

      const data = await res.json();
      if (res.ok && data.message.code === '000') {
        showSucessAlert('Comentario enviado.');
        setComment('');
        fetchComments();
      } else {
        showErrorAlert(data.message.description || 'Error al enviar el comentario.');
      }
    } catch (err) {
      console.error(err);
      showErrorAlert('Error al enviar comentario.');
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 5, backgroundColor: 'white', borderRadius: '12px' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        {taskName}
      </Typography>

      {/* Subida de archivo */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '2px dashed #5D87FF',
          borderRadius: '10px',
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#f5f8ff' },
        }}
      >
        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          <Image src="/images/icons/upload.png" alt="Subir archivo" width={50} height={50} />
          <Typography variant="body1" mt={1}>
            Haz clic o arrastra un archivo aquí para subirlo
          </Typography>
        </label>
        <input
          id="file-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={(e) =>
            e.target.files?.length
              ? showSucessAlert(`Archivo "${e.target.files[0].name}" cargado correctamente.`)
              : null
          }
        />
      </Paper>

      {/* Campo de comentario */}
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Escribe un comentario..."
        variant="outlined"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSendComment}>
        Enviar comentario
      </Button>

      {/* Listado de comentarios */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Comentarios
        </Typography>
        {comments.length === 0 ? (
          <Typography color="text.secondary">Aún no hay comentarios.</Typography>
        ) : (
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #EAEFF4' }}>
            <List>
              {comments.map((c) => (
                <ListItem key={c.id} sx={{ borderBottom: '1px solid #EAEFF4', mb: 1 }}>
                  <ListItemText
                    primary={<Typography fontWeight={600}>{c.author}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {c.text}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {c.date}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
}