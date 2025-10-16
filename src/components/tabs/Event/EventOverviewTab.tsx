import { Box, Typography, Chip, Card } from '@mui/material';
import { Event } from '@/interfaces/Event';
import { showFormalDate } from '@/utils/Formats';
import { Task } from '@/interfaces/Task';

// const formatDate = (dateString?: string) => {
//   if (!dateString) return '—';
//   try {
//     const d = new Date(dateString);
//     return new Intl.DateTimeFormat('es-VE', {
//       year: 'numeric',
//       month: 'long',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//     }).format(d);
//   } catch {
//     return dateString;
//   }
// };

interface Props {
  event: Event;
}

const EventOverviewTab = ({ event }: Props) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Caracas',
  });
  const today = formatter.format(new Date());

  const todayTasks = event?.tasks?.filter((task) => {
    const reminder = task.reminderDate ? task.reminderDate.split('T')[0] : null;
    const due = task.dueDate ? task.dueDate.split('T')[0] : null;
    console.log({ today, reminder, due });
    return reminder === today || due === today;
  });

  const getTaskType = (task: Task) => {
    const reminder = task.reminderDate?.split('T')[0] === today;
    const due = task.dueDate?.split('T')[0] === today;

    if (reminder) return { label: 'Recordatorio', color: '#439fbf' };
    if (due) return { label: 'Fecha límite', color: '#491d8d' };
  };
  return (
    <Box display='grid' gridTemplateColumns={{ xs: '1fr', md: '3fr 2fr' }} gap={2}>
      <Box>
        <Typography variant='subtitle2' sx={{ fontSize: '18px', fontWeight: 700 }} gutterBottom>
          Evento
        </Typography>

        <Box display='flex' gap={2} flexDirection='column' mb={2}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              ID
            </Typography>
            <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{event.eventId}</Typography>
          </Box>

          <Box>
            <Typography variant='caption' color='text.secondary'>
              Nombre
            </Typography>
            <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>{event.name}</Typography>
          </Box>

          <Box>
            <Typography variant='caption' color='text.secondary'>
              Descripción
            </Typography>
            <Typography sx={{ fontSize: '14px' }}>{event.description}</Typography>
          </Box>

          <Box display='flex' gap={10} flexWrap='wrap' alignItems='center'>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Fecha del evento
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>{showFormalDate(event.eventDate)}</Typography>
            </Box>

            <Box>
              <Typography variant='caption' color='text.secondary'>
                Cliente
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>{event.client ? event.client.name : 'n/a'}</Typography>
            </Box>

            <Box>
              <Typography variant='caption' color='text.secondary'>
                Estado
              </Typography>
              <Box mt={0.5}>
                <Chip label={event.status} size='small' variant='outlined' sx={{ textTransform: 'capitalize' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box>
        <Card sx={{ height: '100%', padding: 2 }}>
          <Typography variant='h5' fontWeight='bold' mb={2}>
            Tareas del día
          </Typography>

          {todayTasks?.length === 0 ? (
            <Typography color='text.secondary'>No hay tareas para hoy.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {todayTasks?.map((task, idx) => {
                const type = getTaskType(task);
                return (
                  <Card key={idx} variant='outlined' sx={{ p: 2, borderLeft: `5px solid ${type.color}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant='subtitle1' fontWeight='bold'>
                        {task.name}
                      </Typography>
                      <Chip size='small' label={task.status === 'completed' ? 'Completado' : 'Pendiente'} color={task.status === 'completed' ? 'success' : 'warning'} />
                    </Box>
                    <Typography variant='body2' color='text.secondary' mb={0.5}>
                      {task.description || 'Sin descripción'}
                    </Typography>
                    <Typography variant='caption' sx={{ color: type?.color }}>
                      {type?.label}
                    </Typography>
                  </Card>
                );
              })}
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default EventOverviewTab;
