'use client';

import React, { useEffect, useState, 
  // useCallback 
} from 'react';
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
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { showSucessAlert, showErrorAlert } from '@/app/lib/swal';
import './comments.css';

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface File {
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
  attachments: File[];
  id: string;
  name: string;
  comments?: BackendComment[];
}

interface BackendEvent {
  tasks: BackendTask[];
}

interface Props {
  eventId: string;
  taskId: string;
  role: 'organizer' | 'provider';
}

export default function CommentsInterface({ eventId, taskId, role }: Props) {
  const { token } = useAppContext();
  const [taskName, setTaskName] = useState('Cargando...');
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState('');
  // const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingComment, setLoadingComment] = useState(false);

  const UploadIcon = '/images/icons/upload.png';
  // console.log('LA INTERFAZ DE COMENTARIOS');
  

  const fetchComments = React.useCallback(async () => {
    if (!eventId || !taskId  || !token) {
      setTaskName('Error: IDs o URL base faltantes.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/event/${eventId}`, {
        headers: {
          'token': token as string, 
        },
      });

      const data = await res.json();
      // console.log(data);
      
      if (!res.ok || !data?.data) {
        setTaskName('Error al obtener datos del evento');
        setComments([]);
        return;
      }

      const event: BackendEvent = data.data;
      const task = event.tasks.find((t) => t.id === taskId);
      if (!task) {
        setTaskName('Tarea no encontrada');
        setComments([]);
        return;
      }

      setTaskName(task.name);

      const mappedComments: Comment[] = (task.comments ?? []).map((c) => ({
        id: c._id,
        text: c.description,
        author: c.userType === 'organizer' ? 'Organizador' : 'Proveedor',
        date: new Date(c.date).toLocaleString(),
      }));

      setComments(mappedComments);
      setFiles(task.attachments)
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setTaskName('Error al cargar tarea');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [ eventId, taskId, token]);

  useEffect(() => {
    // console.log('alooooooooo');
    
    fetchComments();
  }, [fetchComments]);

  const handleSendComment = async () => {
    if (!comment.trim()) {
      showErrorAlert('Escribe un comentario antes de enviarlo.');
      return;
    }

    setLoadingComment(true);

    try {
      const url = `/api/event/${eventId}/task/${taskId}/comments/${role}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          token: token || '',
        },
        body: JSON.stringify({ description: comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        showErrorAlert(data.message || 'Error al enviar comentario.');
        setLoadingComment(false);

        return;
      }

      setLoadingComment(false);
      setComment('');
      fetchComments();
    } catch (err) {
        setLoadingComment(false);
      console.error(err);
      showErrorAlert('Error al enviar comentario.');
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
        // setVisible(false);
        showSucessAlert('El archivo se adjuntó exitosamente.');
        await fetchComments();
      } else {
        showErrorAlert(data.message?.description || 'Error al subir archivo.');
      }
    } catch (err) {
      console.error(err);
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
        showErrorAlert('Error al descargar el archivo.');
      }
    } catch (err) {
      console.error(err);
      showErrorAlert('Error en la descarga.');
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <div className="comments-container">
      <Typography variant="h5" className="comments-title">
        {taskName}
      </Typography>

      <Paper elevation={0} className="dropzone">
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
                // :'v
                // await showSucessAlert(`Archivo "${e.target.files[0].name}" cargado correctamente.`);
                // setVisible(true);
                (e.target.parentElement as HTMLFormElement)?.requestSubmit();
              } else {
                // setVisible(false);
              }
            }}
          />
          {/* {visible && <Button type="submit" sx={{ mt: 2 }}>Subir archivo</Button>} */}
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

      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSendComment}>
        Enviar comentario
        {loadingComment && <CircularProgress size='15px' className={'ml-2'} color="secondary" />}
      </Button>

      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Comentarios
        </Typography>
        {comments.length === 0 ? (
          <Typography color="text.secondary">Aún no hay comentarios.</Typography>
        ) : (
          <div className="comments-list">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`comment-bubble ${
                  c.author === 'Organizador' ? 'comment-left' : 'comment-right'
                }`}
              >
                <strong>{c.author}:</strong> {c.text}
                <div style={{ fontSize: '0.8rem', color: '#5a6a85', marginTop: '0.2rem' }}>
                  {c.date}
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}