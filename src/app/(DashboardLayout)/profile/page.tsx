'use client';
import { Typography, Grid, CardContent, Button } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { User } from '@/interfaces/User';
import { showDateInput } from '@/utils/Formats';
import CustomTextField from '../components/forms/theme-elements/CustomTextField';
import { showErrorAlert, showSucessAlert } from '@/app/lib/swal';
import { UpdateProfilePayload } from '@/interfaces/UpdateProfilePayload';

const ProfilePage = () => {
  const { token, user } = useAppContext();
  const [info, setInfo] = useState<User | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    birthDate: '',
    // user_Typeid: '',
  });
  const [editable, setEditable] = useState(true);

  const userTypeMap: { [key: string]: { label: string; description: string } } = {
    provider: {
      label: 'Proveedor',
      description: 'Usuario que provee servicios o productos',
    },
    organizer: {
      label: 'Organizador',
      description: 'Usuario que organiza eventos',
    },
    admin: {
      label: 'Administrador',
      description: 'Administrador con acceso completo',
    },
  };

  const obtainProfile = React.useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/profile', { headers: { token: token as string } });
      const data = await response.json();
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        telephone: data.telephone || '',
        birthDate: data.birthDate || '',
        // user_Typeid: data?.typeuser.id || '',
      });
      setInfo(data);
      setEditable(true);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
    }
  }, [token]);

  const obtainAverage = React.useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`/api/event/provider/${user.id}/average`, {
        headers: {
          'Content-Type': 'application/json',
          token: token as string,
        },
      });

      if (!response.ok) {
        console.error('Error al obtener promedio:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      // console.log("Promedio recibido:", data);

      setAverage(data?.data?.average ?? 0);
    } catch (error) {
      console.error('Error obteniendo promedio:', error);
    }
  }, [user, token]);

  useEffect(() => {
    obtainProfile();
    obtainAverage();
  }, [obtainProfile, obtainAverage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    if (!token) return;

    if (!formData.firstName || !formData.lastName) {
      showErrorAlert('Los campos de nombre y apellido son obligatorios.');
      return;
    }

    if (formData.telephone && formData.telephone.length < 11) {
      showErrorAlert('El número de teléfono debe tener al menos 11 dígitos.');
      return;
    }


    const payload: UpdateProfilePayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      telephone: formData.telephone || null,
    };


    if (formData.birthDate) {
      // Envía solo la parte YYYY-MM-DD sin zona horaria
      payload.birthDate = formData.birthDate;
    }

    if (formData.email) {
      payload.email = formData.email;
    }

    const response = await fetch(`/api/profile/${user?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        token: token as string,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 200) {
      showSucessAlert('Perfil actualizado exitosamente.');
    } else {
      showErrorAlert(response.statusText);
    }
    await obtainProfile();
  };

  return (
    <PageContainer title='Perfil' description='Este es el perfil'>
      <Grid container spacing={3}>
        <Grid size={{ sm: 12 }}>
          <DashboardCard title='Tus datos básicos'>
            <Grid container spacing={3}>
              <Grid size={{ sm: 12 }}>
                <BlankCard>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Typography variant='body1' color='textSecondary'>
                      Nombres:
                    </Typography>
                    <CustomTextField id='firstName' type='text' variant='outlined' fullWidth value={formData.firstName} disabled={editable} onChange={handleChange} required />

                    <Typography variant='body1' color='textSecondary'>
                      Apellidos:
                    </Typography>
                    <CustomTextField id='lastName' type='text' variant='outlined' fullWidth value={formData.lastName} disabled={editable} onChange={handleChange} required />

                    <Typography variant='body1' color='textSecondary'>
                      Fecha de nacimiento:
                    </Typography>
                    <CustomTextField id='birthDate' type='date' variant='outlined' fullWidth value={showDateInput(formData.birthDate)} disabled={editable} onChange={handleChange} />

                    <Typography variant='body1' color='textSecondary'>
                      Teléfono:
                    </Typography>
                    <CustomTextField id='telephone' type='tel' variant='outlined' fullWidth value={formData.telephone} disabled={editable} onChange={handleChange} />

                    {editable ? (
                      <Button variant='outlined' color='primary' onClick={() => setEditable(!editable)}>
                        🖋️
                      </Button>
                    ) : (
                      <Button variant='outlined' color='primary' onClick={handleUpdate}>
                        Modificar
                      </Button>
                    )}

                    <Typography variant='body1' color='textSecondary'>
                      Email:
                    </Typography>
                    <Typography variant='h5'>{formData.email}</Typography>

                    <Typography variant='body1' color='textSecondary'>
                      Tipo de usuario:
                    </Typography>
                    <Typography variant='h5'>{info ? userTypeMap[info.typeuser.name]?.label || info.typeuser.name : ''}</Typography>

                    <Typography variant='body1' color='textSecondary'>
                      ¿Qué significa ser {info ? userTypeMap[info.typeuser.name]?.label || info.typeuser.name : ''}?:
                    </Typography>
                    <Typography variant='h5'>{info ? userTypeMap[info.typeuser.name]?.description || info.typeuser.description : ''}</Typography>

                    {/*  Promedio visible solo para proveedores */}
                    {user?.role === 'provider' && (
                      <>
                        <Typography variant='body1' color='textSecondary'>
                          Tu promedio de calificaciones:
                        </Typography>
                        <Typography variant='h5'>{average !== null ? `${average.toFixed(1)} ⭐` : 'Cargando...'}</Typography>
                      </>
                    )}
                  </CardContent>
                </BlankCard>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ProfilePage;
