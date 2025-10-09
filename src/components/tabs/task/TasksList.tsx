'use client';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import Image from 'next/image';
import { Task } from '@/interfaces/Task';
import { useRouter } from 'next/navigation';

type Props = {
  tasks: Task[];
  onAdd: () => void;
  onView: (task: Task) => void;
  eventId?: string;
};

export default function TaskList({ tasks, onAdd, onView, eventId }: Props) {
  const router = useRouter();

  
  const handleComments = (taskId: string) => {
    console.log('Navegando en comentarios:', { eventId, taskId });
    if (!eventId) {
      console.error('Error: eventId no definido.');
      return;
    }
    router.push(`/events/${eventId}/tasks/${taskId}/comments`);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <button
          onClick={onAdd}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ➕ Añadir tarea
        </button>
      </Box>

      {tasks.length === 0 ? (
        <Typography>No hay tareas registradas.</Typography>
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
                style={{ cursor: 'pointer' }}
              >
                <TableCell onClick={() => onView(task)}>{task.name}</TableCell>
                <TableCell onClick={() => onView(task)}>{task.description}</TableCell>
                <TableCell onClick={() => onView(task)}>{task.status}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleComments(task.id)}
                    color="primary"
                  >
                    <Image
                      src="/images/icons/message_9351720.png"
                      alt="Comentarios"
                      width={22}
                      height={22}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
