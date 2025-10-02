import { Box, Typography, Chip } from '@mui/material';
import { Event } from '@/interfaces/Event';
import { showFormalDate } from '@/utils/Formats';

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
  return (
    <Box display='grid' gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={2}>
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
              <Typography sx={{ fontSize: '14px' }}>{event.client?.name}</Typography>
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
        <Typography variant='subtitle2' fontWeight={700} gutterBottom>
          Tareas del día
        </Typography>

        <Box
          sx={{
            border: '2px solid',
            borderColor: 'red',
            borderRadius: 1,
            p: 3,
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            POR IMPLEMENTAR PROXIMAMENTE 
          </Typography>
        </Box>

      </Box>

      
    </Box>
  );
};

export default EventOverviewTab;
