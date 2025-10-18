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
import Swal from 'sweetalert2';

const ProfilePage = () => {
  const { token, user } = useAppContext();
  const [info, setInfo] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    birthDate: '',
  });
  const [editable, setEditable] = useState(true);
  const [average, setAverage] = useState<number | null>(null); 

  const obtainProfile = React.useCallback(async () => {
    if (!token) return;
    const response = await fetch('/api/profile', { headers: { token: token as string } });
    const data = await response.json();
    setFormData({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      telephone: data.telephone || '',
      birthDate: data.birthDate || '',
    });
    setInfo(data);
    setEditable(true);
  }, [token]);

  const obtainAverage = React.useCallback(async () => {
    if (!token || user?.role !== 'provider') return;
    try {
      const res = await fetch(`/api/providers/${user.id}/average`, {
        headers: { token },
      });
      if (res.ok) {
        const data = await res.json();
        setAverage(data?.average ?? 0);
      } else {
        setAverage(0);
      }
    } catch (error) {
      console.error('Error al obtener el promedio del proveedor:', error);
      setAverage(0);
    }
  }, [token, user]);

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
      await Swal.fire({
        icon: 'error',
        title: '¡Oh no! Tus campos están incompletos',
        text: 'Los campos de nombre y apellido son obligatorios.',
        confirmButtonColor: '#1976d2',
      });
      await obtainProfile();
    }
    if (formData.telephone && formData.telephone.length < 11) {
      await Swal.fire({
        icon: 'error',
        title: '¡Oh no! El número de teléfono es inválido',
        text: 'El número de teléfono debe tener al menos 11 dígitos.',
        confirmButtonColor: '#1976d2',
      });
      return;
    }
    formData.birthDate = new Date(formData.birthDate).toISOString();
    const response = await fetch(`/api/profile/${user?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        token: token as string,
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    console.log(data);
    await obtainProfile();
  };

  return (
    <PageContainer title="Perfil" description="Este es el perfil">
      <Grid container spacing={3}>
        <Grid size={{ sm: 12 }}>
          <DashboardCard title="Tus datos básicos">
            <Grid container spacing={3}>
              <Grid size={{ sm: 12 }}>
                <BlankCard>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Typography variant="body1" color="textSecondary">
                      Nombres:
                    </Typography>
                    <CustomTextField id='firstName' type='text' variant='outlined' fullWidth value={formData.firstName} disabled={editable} onChange={handleChange} required />
                    <Typography variant="body1" color="textSecondary">
                      Apellidos:
                    </Typography>
                    <CustomTextField id='lastName' type='text' variant='outlined' fullWidth value={formData.lastName} disabled={editable} onChange={handleChange} required />
                    <Typography variant="body1" color="textSecondary">
                      Fecha de nacimiento:
                    </Typography>
                    <CustomTextField id='birthDate' type='date' variant='outlined' fullWidth value={showDateInput(formData.birthDate)} disabled={editable} onChange={handleChange} />
                    <Typography variant="body1" color="textSecondary">
                      Teléfono:
                    </Typography>
                    <CustomTextField id='telephone' type='tel' variant='outlined' fullWidth value={formData.telephone} disabled={editable} onChange={handleChange} />
                    {editable ? (
                      <Button variant="outlined" color="primary" onClick={() => setEditable(!editable)}>
                        🖋️
                      </Button>
                    ) : (
                      <Button variant="outlined" color="primary" onClick={handleUpdate}>
                        Modificar
                      </Button>
                    )}
                    <Typography variant="body1" color="textSecondary">
                      Email:
                    </Typography>
                    <Typography variant="h5">{formData.email}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      Tipo de usuario:
                    </Typography>
                    <Typography variant="h5">{info?.typeuser.name}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      ¿Qué significa ser {info?.typeuser.name}?:
                    </Typography>
                    <Typography variant="h5">{info?.typeuser.description}</Typography>

                    {/* ⭐ Mostrar promedio solo si es proveedor */}
                    {user?.role === 'provider' && (
                      <>
                        <Typography variant="body1" color="textSecondary">
                          Tu promedio de calificaciones:
                        </Typography>
                        <Typography variant="h5">
                          {average !== null ? `${average.toFixed(1)} ⭐` : 'Cargando...'}
                        </Typography>
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