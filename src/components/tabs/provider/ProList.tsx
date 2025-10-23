'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material';
//import { ProviderWithService } from '@/interfaces/Provider';
import { BackendProviderResponse } from '@/interfaces/ProviderResponse';

type Props = {
  providers: (BackendProviderResponse & { score?: number })[];
  onView: (provider: BackendProviderResponse) => void;
  onRate: (provider: BackendProviderResponse) => void;
};

export default function ProviderList({ providers, onView, onRate }: Props) {
  console.log('TODOS LOS PROVEEDORES');
  console.log(providers);
  
  return (
    <Box>
      {providers.length === 0 ? (
        <Typography>No hay proveedores relacionados al evento.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Servicio proporcionado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((provider) => (
              <TableRow
                key={provider.id}
                hover
                onClick={() => onView(provider)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{provider.providerName}</TableCell>
                <TableCell>{provider.service?.name || 'No asignado'}</TableCell>

                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRate(provider);
                    }}
                  >
                    {provider.score ? 'Editar calificación' : 'Calificar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
