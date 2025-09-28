"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Stack, Select, MenuItem } from "@mui/material";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import Swal from "sweetalert2";
import { redirect } from "next/navigation";

interface registerType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const emptyFields = Object.entries(formData).filter(([_, value]) => !value);

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor, llena todos los campos antes de continuar.",
        confirmButtonColor: "#1976d2",
      });
      return;
    }

    if (formData.phone.length != 11) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Su número telefónico está incompleto.",
        confirmButtonColor: "#1976d2",
      });
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
      console.log("Datos enviados:", formData);
      redirect('/')
    } else {
      const final = await data.json()
      Swal.fire({
        icon: "error",
        title: "¡Oh no! Ha sucedido un error",
        text: final.body || "Inténtalo de nuevo más tarde.",
        confirmButtonColor: "#1976d2",
      });
    }
  };

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
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
          Registar
        </Button>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;
