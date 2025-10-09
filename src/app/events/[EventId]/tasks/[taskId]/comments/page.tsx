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
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { showSucessAlert, showErrorAlert } from '@/app/lib/swal';

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface BackendComment {
  _id: string;
  description: string;
  userType: 'organizer' | 'provider';
  date: string;
}

interface BackendTask {
  id: string;
  name: string;
  comments?: BackendComment[];
}

interface BackendEvent {
  tasks: BackendTask[];
}

export default function CommentsPage() {
  const { EventId: eventId, taskId } = useParams();
  const [taskName, setTaskName] = useState<string>('Cargando...');
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const UploadIcon = "/images/icons/upload.png";
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Buscar nombre de la tarea
  useEffect(() => {
    async function fetchTask() {
      if (!eventId || !taskId || !API_BASE_URL) { 
        setTaskName('Error: IDs o URL base faltantes.');
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok && data?.data) {
          const event: BackendEvent = data.data;
          const found = event.tasks.find((t) => t.id === taskId);

          if (found) {
            setTaskName(found.name);
          } else {
            setTaskName('Tarea no encontrada');
          }
        } else {
          setTaskName('Error al obtener datos del evento');
        }
      } catch (err) {
        console.error('Error al obtener la tarea:', err);
        setTaskName('Error al cargar tarea');
      }
    }
    fetchTask();
  }, [eventId, taskId, API_BASE_URL, token]);

  // Obtener comentarios desde la tarea
  useEffect(() => {
    async function fetchComments() {
      if (!eventId || !taskId || !API_BASE_URL) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        if (!res.ok || !data?.data) {
          setComments([]);
          return;
        }

        const event: BackendEvent = data.data;
        const task = event.tasks.find((t) => t.id === taskId);
        if (!task) {
          setComments([]);
          return;
        }

        const mappedComments: Comment[] = (task.comments ?? []).map((c) => ({
          id: c._id,
          text: c.description,
          author: c.userType === 'organizer' ? 'Organizador' : 'Proveedor',
          date: new Date(c.date).toLocaleString(),
        }));

        setComments(mappedComments);
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [eventId, taskId, API_BASE_URL, token]);

  // Enviar comentario (solo añade localmente)
  const handleSendComment = async () => {
    if (!comment.trim()) {
      showErrorAlert('Escribe un comentario antes de enviarlo.');
      return;
    }

    const newComment: Comment = {
      id: `${Date.now()}`,
      text: comment,
      author: 'Tú',
      date: new Date().toLocaleString(),
    };

    setComments((prev) => [...prev, newComment]);
    setComment('');
    showSucessAlert('Comentario enviado con éxito.');
  };

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
        maxWidth: 700,
        mx: 'auto',
        mt: 5,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h5" fontWeight={600} mb={3}>
        {taskName}
      </Typography>

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
          <Image src={UploadIcon} alt="Subir archivo" width={50} height={50} />
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

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Escribe un comentario..."
        variant="outlined"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSendComment}
      >
        Enviar comentario
      </Button>

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
                <ListItem
                  key={c.id}
                  sx={{ borderBottom: '1px solid #EAEFF4', mb: 1 }}
                >
                  <ListItemText
                    primary={
                      <Typography component="span" fontWeight={600}>
                        {c.author}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {c.text}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.disabled">
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
