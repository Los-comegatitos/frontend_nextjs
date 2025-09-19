"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Stack, Select, MenuItem } from "@mui/material";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import Swal from "sweetalert2";

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
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: "¡Tus datos fueron enviados correctamente!",
      confirmButtonColor: "#1976d2",
    });

    console.log("Datos enviados:", formData);
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
            Name
          </Typography>
          <CustomTextField id="name" variant="outlined" fullWidth value={formData.name} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="lastname" mb="5px" mt="25px">
            Lastname
          </Typography>
          <CustomTextField id="lastname" variant="outlined" fullWidth value={formData.lastname} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="email" mb="5px" mt="25px">
            Email Address
          </Typography>
          <CustomTextField id="email" variant="outlined" fullWidth value={formData.email} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="birthdate" mb="5px" mt="25px">
            Birthdate
          </Typography>
          <CustomTextField id="birthdate" type="date" variant="outlined" fullWidth value={formData.birthdate} onChange={handleChange} InputLabelProps={{ shrink: true }}/>

          <Typography fontWeight={600} component="label" htmlFor="phone" mb="5px" mt="25px">
            Phone
          </Typography>
          <CustomTextField id="phone" variant="outlined" fullWidth value={formData.phone} onChange={handleChange} />

          <Typography fontWeight={600} component="label" htmlFor="userType" mb="5px" mt="25px">
            User Type
          </Typography>
          <Select id="userType" fullWidth value={formData.userType} onChange={(e) =>
                setFormData({
                ...formData,
                userType: e.target.value,
                })
            }
            >
                <MenuItem value="">Select a user type</MenuItem>
                <MenuItem value="proveedor">Supplier</MenuItem>
                <MenuItem value="organizador">Organizer</MenuItem>
          </Select>

          <Typography fontWeight={600} component="label" htmlFor="password" mb="5px" mt="25px">
            Password
          </Typography>
          <CustomTextField id="password" type="password" variant="outlined" fullWidth value={formData.password} onChange={handleChange} />
        </Stack>

        <Button color="primary" variant="contained" size="large" fullWidth type="submit">
          Sign Up
        </Button>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;
