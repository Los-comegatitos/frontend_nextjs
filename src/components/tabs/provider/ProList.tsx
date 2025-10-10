import { ProviderWithService } from '@/interfaces/Provider';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

type Props = {
  providers: ProviderWithService[];
  onAdd: () => void;
  onView: (provider: ProviderWithService) => void;
};

export default function ProviderList({ providers, onView }: Props) {
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
      </Box>

      {providers.length === 0 ? (
        <Typography>No hay proveedores relacionados al evento.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Servicio proporcionado</TableCell>
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
                <TableCell>{provider.name}</TableCell>
                <TableCell>{provider.service?.name || 'No asignado'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
