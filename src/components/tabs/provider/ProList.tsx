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
import { UserInterface } from '@/interfaces/User';
import { Service } from '@/interfaces/Event'; 

type Props = {
  providers: UserInterface[];
  services: Service[];
  onAdd: () => void;
  onView: (provider: UserInterface) => void;
};

export default function ProviderList({ providers, services, onAdd, onView }: Props) {
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={onAdd}
        >
          Añadir proveedor
        </Button>
      </Box>

      {providers.length === 0 ? (
        <Typography>No hay proveedores relacionados al evento.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Servicio proporcionado</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Teléfono</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((provider) => {
              // Buscar el servicio que este proveedor ofrece
              const service = services.find(
                (s) => s.quote?.providerId === provider.id.toString()
              );

              return (
                <TableRow
                  key={provider.id}
                  hover
                  onClick={() => onView(provider)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>{service ? service.name : 'No asignado'}</TableCell>
                  <TableCell>{provider.email}</TableCell>
                  <TableCell>{provider.telephone}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
