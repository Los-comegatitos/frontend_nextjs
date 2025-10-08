"use client";

import React, { JSX, useState } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Stack, CircularProgress } from '@mui/material';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import Swal from 'sweetalert2';
import { redirect } from 'next/navigation';

interface registerType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

type Props = {
  subtext: JSX.Element,
  subtitle: JSX.Element
}

const AuthRegister = <PROPS extends Props, >({ ...rest }: PROPS): JSX.Element =>  {
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    birthdate: "",
    phone: "",
    password: "",
    userType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.id === "phone") {
      const regex = /^$|^0$|^0[24][0-9]*$/;
      if (!regex.test(e.target.value) || e.target.value.length > 11) return;
    }

    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });

    console.log(formData);
    
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
      setLoading(false);
      return;
    }

    if (formData.phone.length != 11) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Su número telefónico está incompleto.",
        confirmButtonColor: "#1976d2",
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
        telephone: formData.phone, 
        birthDate: formData.birthdate, 
        password: formData.password, 
        user_Typeid: formData.userType
      }),
    });
    

    if (data.ok) {
      await Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "¡Tus datos fueron enviados correctamente!",
        confirmButtonColor: "#1976d2",
      });
      setLoading(false);
      // console.log("Datos enviados:", formData);
      redirect('/')
    } else {
      const final = await data.json()
      Swal.fire({
        icon: "error",
        title: "¡Oh no! Ha sucedido un error",
        text: final.body || "Inténtalo de nuevo más tarde.",
        confirmButtonColor: "#1976d2",
      });
      setLoading(false);

    }
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

      {subtext}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack mb={3}>
          <Typography fontWeight={600} component="label" htmlFor="name" mb="5px">
            Nombres
          </Typography>
          <CustomTextField id="name" variant="outlined" fullWidth value={formData.name} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="lastname" mb="5px" mt="25px">
            Apellidos
          </Typography>
          <CustomTextField id="lastname" variant="outlined" fullWidth value={formData.lastname} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="email" mb="5px" mt="25px">
            Correo electrónico
          </Typography>
          <CustomTextField id="email" variant="outlined" fullWidth value={formData.email} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="birthdate" mb="5px" mt="25px">
            Fecha de nacimiento
          </Typography>
          <CustomTextField id="birthdate" type="date" variant="outlined" fullWidth value={formData.birthdate} onChange={handleChange} InputLabelProps={{ shrink: true }}/>

          <Typography fontWeight={600} component="label" htmlFor="phone" mb="5px" mt="25px">
            Número telefónico
          </Typography>
          <CustomTextField id="phone" variant="outlined" fullWidth value={formData.phone} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="userType" mb="5px" mt="25px">
            Tipo de usuario
          </Typography>
          <Select id="userType" fullWidth value={formData.userType} onChange={(e) =>
                setFormData({
                ...formData,
                userType: e.target.value,
                })
            }
            >
                <MenuItem value="">Selecciona un tipo</MenuItem>
                <MenuItem value="2">Proveedor</MenuItem>
                <MenuItem value="3">Organizador</MenuItem>
          </Select>

          <Typography fontWeight={600} component="label" htmlFor="password" mb="5px" mt="25px">
            Contraseña
          </Typography>
          <CustomTextField id="password" type="password" variant="outlined" fullWidth value={formData.password} onChange={handleChange} />
        </Stack>

        <Button color="primary" variant="contained" size="large" fullWidth type="submit">
          Registrar
          {loading && <CircularProgress size='15px' className={'ml-2'} color="secondary" />}
        </Button>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;
