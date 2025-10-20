'use client';

import { useParams, usePathname } from 'next/navigation';
import CommentsInterface from '@/components/comments/commentsection';
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
import Image from 'next/image';
import { showSucessAlert, showErrorAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';

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

export default function CommentsPage() {
const { eventId, taskId } = useParams<{ eventId: string, taskId: string }>();
  const [visible, setVisible] = useState(false);
  const [taskName, setTaskName] = useState<string>('Cargando...');
  const [comment, setComment] = useState<string>('');
  
  // const [file, setFile] = useState<File>({
  //   id: '', 
  //   name: ''
  // });
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const UploadIcon = "/images/icons/upload.png";
  const { token } = useAppContext();
  
   // se reutiliza esta funcion para cargar comentarios
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
      console.log(data);
      
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




  // Buscar nombre de la tarea
  // useEffect(() => {
  //   async function fetchTask() {
  //     if (!eventId || !taskId  || !token) { 
  //       setTaskName('Error: IDs o URL base faltantes.');
  //       return;
  //     }
  //     try {
  //       const res = await fetch(`$/api/event/${eventId}`, {
  //         headers: {
  //         'token': token as string,
  //         },
  //       });

        
  //       const data = await res.json();

  //       if (res.ok && data?.data) {
  //         const event: BackendEvent = data.data;
  //         const found = event.tasks.find((t) => t.id === taskId);

  //         if (found) {
  //           setTaskName(found.name);
  //         } else {
  //           setTaskName('Tarea no encontrada');
  //         }
  //       } else {
  //         setTaskName('Error al obtener datos del evento');
  //       }
  //     } catch (err) {
  //       console.error('Error al obtener la tarea:', err);
  //       setTaskName('Error al cargar tarea');
  //     }
  //   }
  //   fetchTask();
  // }, [eventId, taskId, token]);



export default function TaskCommentsPage() {
  const { eventId, taskId } = useParams<{ eventId: string; taskId: string }>();
  const pathname = usePathname();


  const role: 'organizer' | 'provider' = pathname.includes('provider')
    ? 'provider'
    : 'organizer';
  
  // enviar comentario
  const handleSendComment = async () => {
    if (!comment.trim()) {
      showErrorAlert('Escribe un comentario antes de enviarlo.');
      return;
    }

    if (!eventId || !taskId ) {
      showErrorAlert('No se pudo enviar el comentario, faltan parámetros.');
      return;
    }

    try {
      const res = await fetch(`/api/event/${eventId}/task/${taskId}/comments`,
        {
          method: 'PATCH',
          headers: {
            'token': token as string, 
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

      // refrescamiento de la lista de comentarios
      fetchComments();
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      showErrorAlert('Error al enviar el comentario.');
    }
  };



  //adjuntar un documento  a la tarea
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
  
      const input = document.getElementById('file') as HTMLInputElement;
      const file = input?.files?.[0];
      console.log(file);
      

      if (!file) {
        console.log('Algo está muy mal');
        
        return;
      }

      const formData = new FormData();
      formData.append('file', file); 
      try {
        const res = await fetch(`/api/event/${eventId}/task/${taskId}/files`, {
          method: 'POST',
          headers: { 
            // 'Content-Type': 'multipart/form-data',
            'token': token as string,
          },
          body: formData,
        });
        const data = await res.json();
  
        if (data.message.code === '000') {
          setVisible(false)
          await showSucessAlert(`El archivo se adjuntó exitosamente`); 
          await fetchComments()
        } else {
          showErrorAlert(data.message.description);
        }
      } catch (err) {
        console.error('Error saving service:', err);
      } finally {
        setLoading(false);
      }
  };

  //descargar dsocumento adjuntado a la tarea
  const handleDownload = async (id : string) => {
    try {
      const res = await fetch(`/api/event/${eventId}/task/${taskId}/files/${id}`, {
        method: 'GET',
        headers: { 'token': token as string },
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
      console.log('error', error)
    }
  }

  if (!eventId || !taskId) 
    return <p className="text-center mt-10 text-gray-500">Cargando datos...</p>; 
  else return <CommentsInterface eventId={eventId} taskId={taskId} role={role} />;
}
