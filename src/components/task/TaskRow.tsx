import { TableRow, TableCell, Button } from '@mui/material';
import { Task } from '@/interfaces/Task';

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onFinalize: (id: string) => void;
};

export default function TaskRow({ task, onEdit, onFinalize }: Props) {
  return (
    <TableRow>
      <TableCell>{task.name}</TableCell>
      <TableCell>{task.description}</TableCell>
      <TableCell>{task.status}</TableCell>
      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
      <TableCell align="right">
        <Button size="small" variant="outlined" onClick={() => onEdit(task)}>
          Editar
        </Button>
        <Button
          size="small"
          variant="contained"
          color="success"
          sx={{ ml: 1 }}
          onClick={() => onFinalize(task.id)}
          disabled={task.status === 'completed'}
        >
          Finalizar
        </Button>
      </TableCell>
    </TableRow>
  );
}
