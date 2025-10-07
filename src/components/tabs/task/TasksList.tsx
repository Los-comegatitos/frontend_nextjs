'use client';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Task } from '@/interfaces/Task';

type Props = {
  tasks: Task[];
  onAdd: () => void;
  onView: (task: Task) => void;
};

export default function TaskList({ tasks, onAdd, onView }: Props) {
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
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                hover
                onClick={() => onView(task)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}