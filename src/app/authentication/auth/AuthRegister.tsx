'use client';

import React, { JSX, useState } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Stack, CircularProgress } from '@mui/material';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import Swal from 'sweetalert2';
import { redirect } from 'next/navigation';

const steps = ['Seleccionar rol', 'Completar formulario', 'Registro exitoso'];

type Props = {
  subtext: JSX.Element,
  subtitle: JSX.Element
}

const AuthRegister = <PROPS extends Props, >({ ...rest }: PROPS): JSX.Element =>  {
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    userType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleNext = async () => {
    if (activeStep === 1) {
      // Validar y enviar datos solo en el segundo paso
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const emptyFields = Object.entries(formData).filter(([_, value]) => !value);
      // console.log('funciona validacion emptyFields', emptyFields);
      let message = '';
      if (emptyFields.length > 0) message = 'Por favor, llena todos los campos antes de continuar.'
      if (formData.password.length < 8) message = 'La contraseña debe tener al menos 8 caracteres.';
      if (message) {
        Swal.fire({
          icon: 'error',
          title: 'Campos incompletos',
          text: message,
          confirmButtonColor: '#1976d2',
        });
        setLoading(false);
        return;
      }

      const data = await fetch('/api/signin', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.name,
          lastName: formData.lastname,
          email: formData.email,
          password: formData.password,
          user_Typeid: formData.userType,
        }),
      });

      if (data.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: '¡Tus datos fueron enviados correctamente!',
          confirmButtonColor: '#1976d2',
        });
        setLoading(false);
        setActiveStep((prev) => prev + 1);
      } else {
        const final = await data.json();
        Swal.fire({
          icon: 'error',
          title: '¡Oh no! Ha sucedido un error',
          text: final.body || 'Inténtalo de nuevo más tarde.',
          confirmButtonColor: '#1976d2',
        });
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) redirect('/authentication/login');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ width: '100%' }} {...rest}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* step 1 */}
      {activeStep === 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant='h6' mb={2}>
            Selecciona el tipo de usuario
          </Typography>
          <Stack direction='row' spacing={4} justifyContent='center'>
            <Box>
              <Button variant='contained' color={formData.userType === '2' ? 'primary' : 'inherit'} onClick={() => setFormData({ ...formData, userType: '2' })}>
                Proveedor
              </Button>
              <Typography variant='body2' mt={1}>
                Ofrece productos o servicios para los eventos.
              </Typography>
            </Box>
            <Box>
              <Button variant='contained' color={formData.userType === '3' ? 'primary' : 'inherit'} onClick={() => setFormData({ ...formData, userType: '3' })}>
                Organizador
              </Button>
              <Typography variant='body2' mt={1}>
                Planifica y gestiona la organización de los eventos.
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {/* step 2 */}
      {activeStep === 1 && (
        <Box component='form' sx={{ mt: 4 }}>
          <Stack mb={3}>
            <Typography fontWeight={600} component='label' htmlFor='name' mb='5px'>
              Nombres
            </Typography>
            <CustomTextField id='name' variant='outlined' fullWidth value={formData.name} onChange={handleChange} required />

            <Typography fontWeight={600} component='label' htmlFor='lastname' mb='5px' mt='25px'>
              Apellidos
            </Typography>
            <CustomTextField id='lastname' variant='outlined' fullWidth value={formData.lastname} onChange={handleChange} required />

            <Typography fontWeight={600} component='label' htmlFor='email' mb='5px' mt='25px'>
              Correo electrónico
            </Typography>
            <CustomTextField id='email' variant='outlined' fullWidth value={formData.email} onChange={handleChange} required />

            <Typography fontWeight={600} component='label' htmlFor='password' mb='5px' mt='25px'>
              Contraseña
            </Typography>
            <CustomTextField id='password' type='password' variant='outlined' fullWidth value={formData.password} onChange={handleChange} required/>
          </Stack>
        </Box>
      )}

      {/* step 3 */}
      {activeStep === 2 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant='h5' gutterBottom>
            ¡Registro exitoso!
          </Typography>
          <Typography variant='body1' mb={3}>
            Tu cuenta ha sido creada correctamente.
          </Typography>
          <Button variant='contained' color='primary' onClick={() => redirect('/authentication/login')}>
            Iniciar sesión
          </Button>
        </Box>
      )}

      {/* lógica atrás siguiente */}
      {activeStep < steps.length - 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
          <Button color='inherit' onClick={handleBack} sx={{ mr: 1 }}>
            Atrás
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button variant='contained' onClick={handleNext} disabled={activeStep === 0 && !formData.userType}>
            {activeStep === steps.length - 2 ? 'Finalizar' : 'Siguiente'}
            {loading && <CircularProgress size='15px' sx={{ ml: 2 }} />}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AuthRegister;
