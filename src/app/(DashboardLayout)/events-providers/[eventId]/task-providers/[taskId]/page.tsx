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
import { useParams } from 'next/navigation';
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
  const { token, user } = useAppContext();
  
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




  // caragar comentarios inicialmente
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);


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
      const type = (user?.role == 'provider') ? 'provider' : ''
      const res = await fetch(`/api/event/${eventId}/task/${taskId}/comments/${type}`,
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
                setVisible(true)
              } else {
                setVisible(false)
              }
            }}
          />
          {visible && <Button type='submit'>Subir archivo</Button>}
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
                      <Typography
                        component="span"
                        sx={{ fontSize: '1rem', display: 'block' }}
                      >
                        <Typography
                          component="span"
                          sx={{ fontWeight: 600, mr: 1 }}
                        >
                          {c.author}:
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontWeight: 400 }}
                        >
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
          <Typography color="text.secondary">Aún no hay comentarios.</Typography>
        ) : (
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #EAEFF4' }}>
            <List>
              {files.map((c) => (
                <ListItem
                  key={c.id}
                  sx={{ borderBottom: '1px solid #EAEFF4', mb: 1, ":hover": { textDecorationLine: 'underline', cursor: 'pointer' } }}
                >
                  <ListItemText
                    primary={
                      <Typography component="span" fontWeight={600} onClick={async () => {
                        await handleDownload(c.id)
                      }}>
                        {c.fileName}
                      </Typography>
                    }
                    // secondary={
                    //   <>
                    //     <Typography component="span" variant="body2" color="text.secondary">
                    //       {c.text}
                    //     </Typography>
                    //     <br />
                    //     <Typography component="span" variant="caption" color="text.disabled">
                    //       {c.date}
                    //     </Typography>
                    //   </>
                    // }
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

// 'use client';

// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Paper,
//   CircularProgress,
//   List,
//   ListItem,
//   ListItemText,
// } from '@mui/material';
// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams } from 'next/navigation';
// import Image from 'next/image';
// import { showSucessAlert, showErrorAlert } from '@/app/lib/swal';
// import { useAppContext } from '@/context/AppContext';

// interface Comment {
//   id: string;
//   text: string;
//   author: string;
//   date: string;
// }

// interface FileItem {
//   id: string;
//   fileName: string;
// }

// interface BackendComment {
//   _id: string;
//   description: string;
//   userType: 'organizer' | 'provider';
//   date: string;
// }

// interface BackendTask {
//   id: string;
//   name: string;
//   comments?: BackendComment[];
//   attachments?: FileItem[];
// }

// export default function TaskCommentsPage() {
//   const { eventId, taskId } = useParams<{ eventId: string, taskId: string }>();
//   const { token } = useAppContext();
//   const [taskName, setTaskName] = useState<string>('Cargando...');
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [comment, setComment] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [visible, setVisible] = useState(false);

//   const UploadIcon = "/images/icons/upload.png";

//   // nombre de la tarea, comentarios y archivos
//   const fetchTaskAndComments = useCallback(async () => {
//     if (!eventId || !token || !taskId) return;

//     try {
//       setLoading(true);
//       const res = await fetch(`/api/event/${eventId}/task/provider`, {
//         headers: { token },
//       });

//       const data = await res.json();

//       if (!res.ok || !data?.data?.data) {
//         showErrorAlert('No se pudo cargar la información de la tarea.');
//         return;
//       }

//       const tasks: BackendTask[] = data.data.data;
//       const selected = tasks.find((t) => t.id === taskId);

//       if (!selected) {
//         setTaskName('Tarea no encontrada');
//         setComments([]);
//         setFiles([]);
//         return;
//       }

//       setTaskName(selected.name);

//       const mappedComments: Comment[] = (selected.comments ?? []).map((c) => ({
//         id: c._id,
//         text: c.description,
//         author: c.userType === 'organizer' ? 'Organizador' : 'Proveedor',
//         date: new Date(c.date).toLocaleString(),
//       }));

//       setComments(mappedComments);
//       setFiles(selected.attachments ?? []);
//     } catch (err) {
//       console.error('Error al obtener comentarios:', err);
//       showErrorAlert('Error al cargar los comentarios.');
//     } finally {
//       setLoading(false);
//     }
//   }, [eventId, taskId, token]);

//   useEffect(() => {
//     fetchTaskAndComments();
//   }, [fetchTaskAndComments]);

//   // enviar comentario
//   const handleSendComment = async () => {
//     if (!comment.trim()) {
//       showErrorAlert('Escribe un comentario antes de enviarlo.');
//       return;
//     }

//     try {
//       const res = await fetch(
//         `/api/event/${eventId}/task/${taskId}/comments/provider`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//             token: token || '',
//           },
//           body: JSON.stringify({ description: comment }),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         console.error('Error al enviar comentario:', data);
//         showErrorAlert('No se pudo enviar el comentario.');
//         return;
//       }

//       setComment('');
//       showSucessAlert('Comentario enviado con éxito.');
//       fetchTaskAndComments();
//     } catch (err) {
//       console.error('Error al enviar comentario:', err);
//       showErrorAlert('Error al enviar el comentario.');
//     }
//   };

//   // subir archivo
//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setLoading(true);

//     const input = document.getElementById('file') as HTMLInputElement;
//     const file = input?.files?.[0];

//     if (!file) {
//       showErrorAlert('Selecciona un archivo para subir.');
//       setLoading(false);
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const res = await fetch(`/api/event/${eventId}/task/${taskId}/files`, {
//         method: 'POST',
//         headers: { token: token || '' },
//         body: formData,
//       });

//       const data = await res.json();

//       if (data.message?.code === '000') {
//         setVisible(false);
//         await showSucessAlert(`El archivo se adjuntó exitosamente`);
//         await fetchTaskAndComments();
//       } else {
//         showErrorAlert(data.message?.description || 'Error al subir archivo.');
//       }
//     } catch (err) {
//       console.error('Error subiendo archivo:', err);
//       showErrorAlert('Error al subir archivo.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // descargar archivo
//   const handleDownload = async (id: string) => {
//     try {
//       const res = await fetch(`/api/event/${eventId}/task/${taskId}/files/${id}`, {
//         method: 'GET',
//         headers: { token: token || '' },
//       });

//       const blob = await res.blob();

//       if (res.ok) {
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = id;
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);
//       } else {
//         showErrorAlert('Un error ha sucedido en la descarga');
//       }
//     } catch (error) {
//       console.error('Error en la descarga:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" mt={5}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         p: 4,
//         maxWidth: 700,
//         mx: 'auto',
//         mt: 5,
//         backgroundColor: 'white',
//         borderRadius: '12px',
//         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//       }}
//     >
//       <Typography variant="h5" fontWeight={600} mb={3}>
//         {taskName}
//       </Typography>

//       {/* 📎 Subir archivo */}
//       <Paper
//         elevation={0}
//         sx={{
//           p: 3,
//           mb: 3,
//           border: '2px dashed #5D87FF',
//           borderRadius: '10px',
//           textAlign: 'center',
//           cursor: 'pointer',
//           '&:hover': { backgroundColor: '#f5f8ff' },
//         }}
//       >
//         <form onSubmit={handleSubmit}>
//           <label htmlFor="file" style={{ cursor: 'pointer' }}>
//             <Image src={UploadIcon} alt="Subir archivo" width={50} height={50} />
//             <Typography variant="body1" mt={1}>
//               Haz clic o arrastra un archivo aquí para subirlo
//             </Typography>
//           </label>
//           <input
//             id="file"
//             type="file"
//             style={{ display: 'none' }}
//             onChange={async (e) => {
//               if (e.target.files?.length) {
//                 await showSucessAlert(`Archivo "${e.target.files[0].name}" cargado correctamente.`);
//                 setVisible(true);
//               } else {
//                 setVisible(false);
//               }
//             }}
//           />
//           {visible && <Button type="submit" sx={{ mt: 2 }}>Subir archivo</Button>}
//         </form>
//       </Paper>

//       {/* Campo de comentario */}
//       <TextField
//         fullWidth
//         multiline
//         rows={3}
//         label="Escribe un comentario..."
//         variant="outlined"
//         value={comment}
//         onChange={(e) => setComment(e.target.value)}
//       />

//       <Button
//         variant="contained"
//         color="primary"
//         sx={{ mt: 2 }}
//         onClick={handleSendComment}
//       >
//         Enviar comentario
//       </Button>

//       {/* Comentarios */}
//       <Box mt={4}>
//         <Typography variant="h6" mb={2}>
//           Comentarios
//         </Typography>

//         {comments.length === 0 ? (
//           <Typography color="text.secondary">Aún no hay comentarios.</Typography>
//         ) : (
//           <Paper elevation={0} sx={{ p: 2, border: '1px solid #EAEFF4' }}>
//             <List>
//               {comments.map((c) => (
//                 <ListItem
//                   key={c.id}
//                   sx={{ borderBottom: '1px solid #EAEFF4', mb: 1, alignItems: 'flex-start' }}
//                 >
//                   <ListItemText
//                     primary={
//                       <Typography component="span" sx={{ fontSize: '1rem', display: 'block' }}>
//                         <Typography component="span" sx={{ fontWeight: 600, mr: 1 }}>
//                           {c.author}:
//                         </Typography>
//                         <Typography component="span" sx={{ fontWeight: 400 }}>
//                           {c.text}
//                         </Typography>
//                       </Typography>
//                     }
//                     secondary={
//                       <Typography
//                         component="span"
//                         color="text.disabled"
//                         sx={{ display: 'block', mt: 0.5, fontSize: '0.8rem', fontWeight: 600 }}
//                       >
//                         {c.date}
//                       </Typography>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           </Paper>
//         )}
//       </Box>

//       {/* Archivos adjuntos */}
//       <Box mt={4}>
//         <Typography variant="h6" mb={2}>
//           Archivos adjuntos
//         </Typography>

//         {files.length === 0 ? (
//           <Typography color="text.secondary">No hay archivos adjuntos.</Typography>
//         ) : (
//           <Paper elevation={0} sx={{ p: 2, border: '1px solid #EAEFF4' }}>
//             <List>
//               {files.map((file) => (
//                 <ListItem
//                   key={file.id}
//                   sx={{
//                     borderBottom: '1px solid #EAEFF4',
//                     mb: 1,
//                     ':hover': { textDecorationLine: 'underline', cursor: 'pointer' },
//                   }}
//                 >
//                   <ListItemText
//                     primary={
//                       <Typography
//                         component="span"
//                         fontWeight={600}
//                         onClick={() => handleDownload(file.id)}
//                       >
//                         {file.fileName}
//                       </Typography>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           </Paper>
//         )}
//       </Box>
//     </Box>
//   );
// }
