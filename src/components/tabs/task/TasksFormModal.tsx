'use client';
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Select, InputLabel, FormControl, IconButton, Menu, Divider, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Task } from '@/interfaces/Task';
import { useState, useEffect } from 'react';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { useAppContext } from '@/context/AppContext';

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: Task;
  eventId?: string;
  token?: string;
  onRefresh?: () => void;
};

interface Quote {
  serviceTypeId: string;
  price: number;
  quantity: number;
  providerId: string;
  date: string;
}

interface EventService {
  serviceTypeId: string;
  serviceTypeName: string;
  name: string;
  description: string;
  quantity: number;
  quote?: Quote;
}

interface EventResponse {
  message: { code: string; description: string };
  data?: { services?: EventService[] };
}

export default function TaskFormModal({ open, onClose, initialData, eventId, onRefresh }: Props) {
  const [form, setForm] = useState<Partial<Task>>({});
  const [providerName, setProviderName] = useState<string>('Cargando...');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingAsignando, setLoadingAsignando] = useState(false);
  const [loadingDesasignando, setLoadingDesasignando] = useState(false);
  const [loadingFinalize, setLoadingFinalize] = useState(false);
  const [eventStatus, setEventStatus] = useState<string>('');



  const { token } = useAppContext();

  // opciones secundarias para no sobre cargar el modal :/
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  //const isFinalized = initialData?.status === 'completed';

  useEffect(() => {
    if (!open || !eventId || !token) return;

    const fetchEventStatus = async () => {
      try {
        const res = await fetch(`/api/event/${eventId}`, { headers: { token } });
        const data = await res.json();
        setEventStatus(data.data?.status ?? '');
      } catch (err) {
        console.error('No se pudo obtener el estado del evento:', err);
        setEventStatus('');
      }
    };

    fetchEventStatus();
  }, [open, eventId, token]);

  useEffect(() => {
    setForm(initialData || {});

    const loadAssignedProvider = async () => {
      if (!eventId || !token || !initialData?.associatedProviderId) {
        setProviderName('No se ha asignado un proveedor');
        return;
      }

      try {
        const res = await fetch(`/api/event/${eventId}`, {
          headers: { token: token as string },
        });
        const data: EventResponse = await res.json();

        if (data?.message?.code === '000' && data.data?.services) {
          const match = data.data.services.find((s: EventService) => s.quote?.providerId === initialData.associatedProviderId);

          if (match) {
            setProviderName(match.serviceTypeName || 'Servicio desconocido');
          } else {
            setProviderName('Proveedor asignado no encontrado en los servicios del evento');
          }
        } else {
          setProviderName('No se ha asignado un proveedor');
        }
      } catch {
        setProviderName('No se ha asignado un proveedor');
      }
    };

    loadAssignedProvider();
  }, [initialData, eventId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // validaciones para fechas no vacias y no anteriores a hoy
  const validateDates = async (): Promise<boolean> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.dueDate || !form.reminderDate) {
      showErrorAlert('Las fechas no pueden estar vacías.');
      return false;
    }

    const dueDate = new Date(form.dueDate);
    const reminderDate = new Date(form.reminderDate);

    if (isNaN(dueDate.getTime()) || isNaN(reminderDate.getTime())) {
      showErrorAlert('Las fechas no son válidas.');
      return false;
    }

    if (dueDate < today || reminderDate < today) {
      showErrorAlert('Las fechas no pueden ser anteriores a hoy.');
      return false;
    }

    if (reminderDate > dueDate) {
      showErrorAlert('La fecha de recordatorio no puede ser posterior a la fecha límite.');
      return false;
    }

    // Validar que las fechas de recordatorio y límite no sean posteriores a la del evento
    try {
      if (eventId && token) {
        const res = await fetch(`/api/event/${eventId}`, {
          headers: { token: token as string },
        });
        const data = await res.json();

        if (data?.data?.eventDate) {
          const eventDate = new Date(data.data.eventDate);
          if (dueDate > eventDate || reminderDate > eventDate) {
            showErrorAlert('Las fechas no pueden ser posteriores a la fecha del evento.');
            return false;
          }
        }
      }
    } catch (err) {
      console.warn('No se pudo validar contra la fecha del evento.', err);
    }

    return true;
  };

  //Crear tarea de un evento
  const handleCreate = async () => {
    if (!validateDates()) return;

    if (!eventId || !token) return;

    let eventStatus = '';
    try {
      const res = await fetch(`/api/event/${eventId}`, { headers: { token } });
      if (!res.ok) throw new Error('No se pudo obtener el evento');
      const data = await res.json();
      eventStatus = data.data?.status ?? '';
    } catch (err) {
      console.error(err);
      showErrorAlert('No se pudo obtener el estado del evento.');
      return;
    }

    if (eventStatus === 'finalized') {
      showErrorAlert('No puedes crear tareas en un evento finalizado.');
      return;
    }

    if (eventStatus === 'canceled') {
      showErrorAlert('No puedes crear tareas en un evento cancelado.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.dueDate) {
      showErrorAlert('Debes ingresar una fecha límite para la tarea.');
      return;
    }

    const dueDate = new Date(form.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      showErrorAlert('La fecha límite no puede ser anterior a hoy.');
      return;
    }

    if (form.reminderDate) {
      const reminderDate = new Date(form.reminderDate);
      reminderDate.setHours(0, 0, 0, 0);

      if (reminderDate < today) {
        showErrorAlert('La fecha de recordatorio no puede ser anterior a hoy.');
        return;
      }

      if (reminderDate > dueDate) {
        showErrorAlert('La fecha de recordatorio no puede ser posterior a la fecha límite.');
        return;
      }
    }

    const payload = {
      name: form.name,
      description: form.description,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate,
    };

    try {
      const res = await fetch(`/api/event/${eventId}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token as string,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${form.name}" fue creada exitosamente.`);
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo crear la tarea.');
      }
    } catch {
      showErrorAlert('Ocurrió un error interno al crear la tarea.');
    }
  };

  //Eliminar tarea de un evento
  const handleDeleteConfirmed = async () => {
    if (!eventId || !initialData || !token) return;

    try {
      const res = await fetch(`/api/event/${eventId}/task/${initialData.id}`, {
        method: 'DELETE',
        headers: { token: token as string },
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${initialData.name}" fue eliminada exitosamente.`);
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo eliminar la tarea.');
      }
    } catch {
      showErrorAlert('Ocurrió un error interno al eliminar la tarea.');
    } finally {
      setConfirmOpen(false);
    }
  };

  //Finalizar tarea de un evento
  const handleFinalize = async () => {
    if (!eventId || !initialData || !token) return;

    const payload = { status: 'finalized' };

    setLoadingFinalize(true);
    try {
      const res = await fetch(`/api/event/${eventId}/task/${initialData.id}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          token: token as string,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${initialData.name}" fue finalizada exitosamente.`);
        handleMenuClose();
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo finalizar la tarea.');
      }
      setLoadingFinalize(false);
    } catch (err) {
      setLoadingFinalize(false);
      console.error('Error al finalizar tarea:', err);
      showErrorAlert('Ocurrió un error interno al finalizar la tarea.');
    }
  };

  // Modificar
  const handleUpdate = async () => {
    if (!validateDates()) return;

    if (!eventId || !initialData || !token) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.dueDate) {
      showErrorAlert('Debes ingresar una fecha límite para la tarea.');
      return;
    }

    const dueDate = new Date(form.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      showErrorAlert('La fecha límite no puede ser anterior a hoy.');
      return;
    }

    if (form.reminderDate) {
      const reminderDate = new Date(form.reminderDate);
      reminderDate.setHours(0, 0, 0, 0);

      if (reminderDate < today) {
        showErrorAlert('La fecha de recordatorio no puede ser anterior a hoy.');
        return;
      }

      if (reminderDate > dueDate) {
        showErrorAlert('La fecha de recordatorio no puede ser posterior a la fecha límite.');
        return;
      }
    }

    const updatePayload = {
      name: form.name,
      description: form.description,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate,
    };

    try {
      const res = await fetch(`/api/event/${eventId}/task/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          token: token as string,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (data.message.code === '000') {
        showSucessAlert(`La tarea "${initialData.name}" fue modificada exitosamente.`);
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message.description || 'No se pudo modificar la tarea.');
      }
    } catch {
      showErrorAlert('Ocurrió un error interno al modificar la tarea.');
    }
  };

  const fetchProvidersFromEvent = async () => {
    if (!eventId || !token) return;

    try {
      const res = await fetch(`/api/event/${eventId}`, {
        headers: { token: token as string },
      });
      const data: EventResponse = await res.json();

      if (data?.message?.code !== '000' || !data.data?.services) {
        throw new Error('No se pudieron obtener los servicios del evento');
      }

      const providersWithNames = data.data.services
        .filter((s: EventService) => !!s.quote?.providerId && !!s.serviceTypeName)
        .map((s: EventService) => ({
          id: s.quote!.providerId,
          name: s.serviceTypeName,
        }));

      setProviders(providersWithNames);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      showErrorAlert('No se pudieron obtener los proveedores del evento.');
    }
  };

  const handleAssignProvider = async () => {
    setSubmitError(null);
    if (!eventId || !initialData || !token) return;
    if (!selectedProvider) {
      setSubmitError('Debes seleccionar algún proveedor para asignar.');
      return;
    }

    setLoadingAsignando(true);
    try {
      const res = await fetch(`/api/event/${eventId}/task/${initialData.id}/assign-provider/${selectedProvider}`, {
        method: 'PATCH',
        headers: {
          token: token as string,
        },
      });

      const data = await res.json();

      if (data.message?.code === '000') {
        showSucessAlert('Proveedor asignado correctamente.');
        onRefresh?.();
        setAssignOpen(false);
        onClose();
      } else {
        showErrorAlert(data.message?.description || 'No se pudo asignar el proveedor.');
      }
      setLoadingAsignando(false);
    } catch (err) {
      setLoadingAsignando(false);
      console.error('Error al asignar proveedor:', err);
      showErrorAlert('Ocurrió un error interno al asignar el proveedor.');
    }
  };

  const handleUnassignProvider = async () => {
    if (!eventId || !initialData || !token) return;

    setLoadingDesasignando(true);
    try {
      const res = await fetch(`/api/event/${eventId}/task/${initialData.id}/unassign-provider`, {
        method: 'PATCH',
        headers: {
          token: token as string,
        },
      });

      const data = await res.json();

      if (data.message?.code === '000') {
        showSucessAlert('Proveedor desasignado correctamente.');
        handleMenuClose();
        onRefresh?.();
        onClose();
      } else {
        showErrorAlert(data.message?.description || 'No se pudo desasignar el proveedor.');
      }
    setLoadingDesasignando(false);

    } catch (err) {
    setLoadingDesasignando(false);

      console.error('Error al desasignar proveedor:', err);
      showErrorAlert('Ocurrió un error interno al desasignar el proveedor.');
    }
  };

  // verificacion si la tarea esta finalizda
  const isCompleted = initialData?.status === 'completed';

  return (
    <>
      {/* Modal principal */}
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {initialData ? 'Detalle de tarea' : 'Crear tarea'}
          {/* Ícono más pequeño y elegante */}
          {/* buenisima david  */}
          {initialData && !isCompleted && (
            <IconButton size='small' onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent dividers>
          <TextField margin='normal' fullWidth label='Nombre' name='name' value={form.name || ''} onChange={handleChange} InputProps={{ readOnly: isCompleted }} />
          <TextField margin='normal' fullWidth label='Descripción' name='description' value={form.description || ''} onChange={handleChange} InputProps={{ readOnly: isCompleted }} />
          <TextField
            margin='normal'
            fullWidth
            type='date'
            label='Fecha límite'
            name='dueDate'
            value={form.dueDate?.split('T')[0] || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: isCompleted }}
            inputProps={{
              min: new Date().toISOString().split('T')[0],
            }}
          />
          <TextField
            margin='normal'
            fullWidth
            type='date'
            label='Fecha de recordatorio'
            name='reminderDate'
            value={form.reminderDate?.split('T')[0] || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: isCompleted }}
            inputProps={{
              min: new Date().toISOString().split('T')[0],
            }}
          />
          <TextField margin='normal' fullWidth label='Proveedor' value={providerName} InputProps={{ readOnly: true }} />
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'space-between',
            px: 3,
            py: 1.5,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          {!initialData ? (
            <>
              <Button variant='contained' color='primary' onClick={handleCreate}>
                Guardar
              </Button>
              <Button onClick={onClose}>Cerrar</Button>
            </>
          ) : (
            <>
              {/* si la tarea no esta finalizada que se muestren los botones */}
              {!isCompleted && (
                <Button variant='contained' color='primary' onClick={handleUpdate} sx={{ borderRadius: 2 }} disabled={eventStatus === 'canceled' || eventStatus === 'finalized'}>
                  Modificar
                </Button>
              )}
              <Button onClick={onClose}>Cerrar</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Menú lateral elegante */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 200,
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleFinalize();
          }}
          disabled={loadingFinalize}
        >
          Finalizar
          {loadingFinalize && <CircularProgress size="15px" className="ml-2" />}
        </MenuItem>

        {!initialData?.associatedProviderId && (
          <MenuItem
            onClick={() => {
              fetchProvidersFromEvent();
              setAssignOpen(true);
              setSubmitError(null);
              handleMenuClose();
            }}
          >
            Asignar proveedor
          </MenuItem>
        )}

        {initialData?.associatedProviderId && (
          <MenuItem
            onClick={() => {
              handleUnassignProvider(); 
            }}
            disabled={loadingDesasignando}
          >
            Desasignar proveedor
            {loadingDesasignando && <CircularProgress size="15px" className="ml-2" />}
          </MenuItem>
        )}

        <Divider />
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setConfirmOpen(true);
            handleMenuClose();
          }}
        >
          Eliminar
        </MenuItem>
      </Menu>

      {/* Modal de confirmación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth='xs'>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>{'¿Estás seguro de eliminar la tarea "' + initialData?.name + '"?'}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color='error' onClick={handleDeleteConfirmed}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para asignar proveedor */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Asignar proveedor</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{marginBottom: 1}}>
            <InputLabel>Proveedor</InputLabel>
            <Select value={selectedProvider} label='Proveedor' onChange={(e) => setSelectedProvider(e.target.value as string)}>
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {submitError && (
            <Typography color='error' fontSize={14} textAlign='center'>
              {submitError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancelar</Button>
          <Button color='primary' onClick={handleAssignProvider} disabled={loadingAsignando}>
            Asignar
            {loadingAsignando && <CircularProgress size="15px" className="ml-2" color='secondary'/>}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
