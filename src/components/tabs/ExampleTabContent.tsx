import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Event } from '@/interfaces/Event'

// Un ejemplo super sencillo de lo que creo que estaremos renderizando dentro de las tabs del dashboard
interface ExampleTabContentProps {
  event: Event
}

const ExampleTabContent: React.FC<ExampleTabContentProps> = ({ event }) => {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tab de ejemplo (WIP)
        </Typography>
        <Typography variant="body1">
          Evento: {event.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ExampleTabContent;
