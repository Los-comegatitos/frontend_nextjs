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
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { showSucessAlert, showErrorAlert } from '@/app/lib/swal';

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface FileItem {
  id: string;
  fileName: string;
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
  attachments?: FileItem[];
}

export default function TaskCommentsPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const token = searchParams.get('token');

  const [taskName, setTaskName] = useState<string>('Cargando...');
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const UploadIcon = "/images/icons/upload.png";

  // nombre de tarea y comentarios
  const fetchTaskAndComments = useCallback(async () => {
    if (!eventId || !token || !taskId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/event/${eventId}/task/provider`, {
        headers: { token },
      });

      const data = await res.json();

      if (!res.ok || !data?.data?.data) {
        showErrorAlert('No se pudo cargar la información de la tarea.');
        return;
      }

      const tasks: BackendTask[] = data.data.data;
      const selected = tasks.find((t) => t.id === taskId);

      if (!selected) {
        setTaskName('Tarea no encontrada');
        setComments([]);
        setFiles([]);
        return;
      }

      setTaskName(selected.name);

      const mappedComments: Comment[] = (selected.comments ?? []).map((c) => ({
        id: c._id,
        text: c.description,
        author: c.userType === 'organizer' ? 'Organizador' : 'Proveedor',
        date: new Date(c.date).toLocaleString(),
      }));

      setComments(mappedComments);
      setFiles(selected.attachments ?? []);
    } catch (err) {
      console.error('Error al obtener comentarios:', err);
      showErrorAlert('Error al cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  }, [eventId, taskId, token]);

  useEffect(() => {
    fetchTaskAndComments();
  }, [fetchTaskAndComments]);

  const handleSendComment = async () => {
    if (!comment.trim()) {
      showErrorAlert('Escribe un comentario antes de enviarlo.');
      return;
    }

    try {
      const res = await fetch(
        `/api/event/${eventId}/task/${taskId}/comments/provider`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            token: token || '',
          },
          body: JSON.stringify({ description: comment }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error('Error al enviar comentario:', data);
        showErrorAlert('No se pudo enviar el comentario.');
        return;
      }

      setComment('');
      showSucessAlert('Comentario enviado con éxito.');
      fetchTaskAndComments();
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      showErrorAlert('Error al enviar el comentario.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const input = document.getElementById('file') as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) {
      showErrorAlert('Selecciona un archivo para subir.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/event/${eventId}/task/${taskId}/files`, {
        method: 'POST',
        headers: { token: token || '' },
        body: formData,
      });

      const data = await res.json();

      if (data.message?.code === '000') {
        setVisible(false);
        await showSucessAlert(`El archivo se adjuntó exitosamente`);
        await fetchTaskAndComments();
      } else {
        showErrorAlert(data.message?.description || 'Error al subir archivo.');
      }
    } catch (err) {
      console.error('Error subiendo archivo:', err);
      showErrorAlert('Error al subir archivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await fetch(`/api/event/${eventId}/task/${taskId}/files/${id}`, {
        method: 'GET',
        headers: { token: token || '' },
      });

      const blob = await res.blob();

      if (res.ok) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = id;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        showErrorAlert('Un error ha sucedido en la descarga');
      }
    } catch (error) {
      console.error('Error en la descarga:', error);
    }
  };

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
        <form onSubmit={handleSubmit}>
          <label htmlFor="file" style={{ cursor: 'pointer' }}>
            <Image src={UploadIcon} alt="Subir archivo" width={50} height={50} />
            <Typography variant="body1" mt={1}>
              Haz clic o arrastra un archivo aquí para subirlo
            </Typography>
          </label>
          <input
            id="file"
            type="file"
            style={{ display: 'none' }}
            onChange={async (e) => {
              if (e.target.files?.length) {
                await showSucessAlert(`Archivo "${e.target.files[0].name}" cargado correctamente.`);
                setVisible(true);
              } else {
                setVisible(false);
              }
            }}
          />
          {visible && <Button type="submit" sx={{ mt: 2 }}>Subir archivo</Button>}
        </form>
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
                  sx={{ borderBottom: '1px solid #EAEFF4', mb: 1, alignItems: 'flex-start' }}
                >
                  <ListItemText
                    primary={
                      <Typography component="span" sx={{ fontSize: '1rem', display: 'block' }}>
                        <Typography component="span" sx={{ fontWeight: 600, mr: 1 }}>
                          {c.author}:
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 400 }}>
                          {c.text}
                        </Typography>
                      </Typography>
                    }
                    secondary={
                      <Typography
                        component="span"
                        color="text.disabled"
                        sx={{ display: 'block', mt: 0.5, fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        {c.date}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Archivos adjuntos
        </Typography>

        {files.length === 0 ? (
          <Typography color="text.secondary">No hay archivos adjuntos.</Typography>
        ) : (
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #EAEFF4' }}>
            <List>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{
                    borderBottom: '1px solid #EAEFF4',
                    mb: 1,
                    ':hover': { textDecorationLine: 'underline', cursor: 'pointer' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        component="span"
                        fontWeight={600}
                        onClick={() => handleDownload(file.id)}
                      >
                        {file.fileName}
                      </Typography>
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
