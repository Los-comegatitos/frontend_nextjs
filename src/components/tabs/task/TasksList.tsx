'use client';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { Task } from '@/interfaces/Task';

type Props = {
  tasks: Task[];
  onAdd: () => void;
  onView: (task: Task) => void;
  eventId?: string;
  onComment: (task: Task) => void;
};

export default function TaskList({ tasks, onAdd, onView, onComment }: Props) {
  return (
    <Box>
      {/* Botón superior */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={onAdd}>
          Añadir tarea
        </Button>
      </Box>

      {/* Tabla de tareas*/}
      {tasks.length === 0 ? (
        <Typography>No hay tareas registradas.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} hover style={{ cursor: 'pointer' }}>
                <TableCell onClick={() => onView(task)}>{task.name}</TableCell>
                <TableCell onClick={() => onView(task)}>{task.description}</TableCell>
                <TableCell onClick={() => onView(task)}>{task.status}</TableCell>
                <TableCell align="center">
                  <button
                    onClick={() => onComment(task)}
                    style={{
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
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}