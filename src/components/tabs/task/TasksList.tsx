'use client';
import React, { useState } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, Card } from '@mui/material';
import Image from 'next/image';
import { Task } from '@/interfaces/Task';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';

type Props = {
  tasks: Task[];
  onAdd: () => void;
  onView: (task: Task) => void;
  eventId?: string;
  onComment: (task: Task) => void;
};

interface TaskCalendar {
  title: string;
  date: string;
  color: string;
  task: Task,
}

export default function TaskList({ tasks, onAdd, onView, onComment }: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const eventsArray: TaskCalendar[] =
    tasks.flatMap((task) => [
      {
        title: task.name,
        date: task.reminderDate.split('T')[0],
        color: '#439fbf',
        task:task,
      },
      {
        title: task.name,
        date: task.dueDate.split('T')[0],
        color: '#491d8d',
        task:task,
      },
    ]) || [];

  return (
    <Box>
      <Box display='flex' justifyContent='flex-end' mb={2} gap={1}>
        <button
          onClick={() => setShowCalendar((selected) => !selected)}
          style={{
            backgroundColor: '#439fbf',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showCalendar ? 'Lista' : 'Calendario'}
        </button>
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
          Añadir tarea
        </button>
      </Box>

      {showCalendar ? (
        <Card
          sx={{
            height: '100%',
            padding: 4,
            // esta cosa rara es para el pointer
            '& .fc-event-main': {
              cursor: 'pointer',
            },
          }}
        >
          <FullCalendar
            locale={esLocale}
            plugins={[dayGridPlugin]}
            initialView='dayGridMonth'
            events={eventsArray}
            eventClick={(info) => {
              onView(info.event.extendedProps.task);
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 3,
              mt: 2,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: '#439fbf', borderRadius: 0.5 }} />
              <Typography variant='body2' color='text.secondary'>
                Recordatorio
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: '#491d8d', borderRadius: 0.5 }} />
              <Typography variant='body2' color='text.secondary'>
                Fecha límite
              </Typography>
            </Box>
          </Box>
        </Card>
      ) : tasks.length === 0 ? (
        <Typography>No hay tareas registradas.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} hover style={{ cursor: 'pointer' }}>
                <TableCell onClick={() => onView(task)}>{task.name}</TableCell>
                <TableCell onClick={() => onView(task)}>{task.description}</TableCell>
                <TableCell onClick={() => onView(task)}>{task.status}</TableCell>
                <TableCell align='center'>
                  <button
                    onClick={() => onComment(task)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Image src='/images/icons/message_9351720.png' alt='Comentarios' width={24} height={24} />
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
