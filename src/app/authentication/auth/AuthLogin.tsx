"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
} from "@mui/material";
import Link from "next/link";

import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import Swal from "sweetalert2";
// import { login } from "@/actions/auth";
import { redirect } from "next/navigation";
import { createJwt } from "@/app/lib/session";
// import { login } from "@/app/actions/auth";
// import { cookies } from "next/headers";
// import Swal from "sweetalert2";
// import { login } from "@/actions/auth";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [formData, setFormData] = useState({
      email: "",
      password: ""
  });
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    
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

      const data = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
  
      if (data.ok) {
        const body = await data.json()
        createJwt(body.body)
        await Swal.fire({
          icon: "success",
          title: "Inicio de sesión exitoso",
          text: "¡Iniciaste sesión correctamente!",
          confirmButtonColor: "#1976d2",
        });
        console.log("Datos enviados:", formData);
        redirect('/')
      } else {
        Swal.fire({
          icon: "error",
          title: "¡Oh no! Ha sucedido un error",
          text: "Por favor, revisa que sean tus datos correctos.",
          confirmButtonColor: "#1976d2",
        });
      }
    };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Stack>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="email"
            mb="5px"
          >
            Correo electrónico
          </Typography>
          <CustomTextField id="email" variant="outlined" fullWidth onChange={handleChange} />
        </Box>
        <Box mt="25px">
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Contraseña
          </Typography>
          <CustomTextField id="password" type="password" variant="outlined" fullWidth onChange={handleChange} />
        </Box>
        <Stack
          justifyContent="space-between"
          direction="row"
          alignItems="center"
          my={2}
        >
          <FormGroup>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Remeber this Device"
            />
          </FormGroup>
          <Typography
            component={Link}
            href="/"
            fontWeight="500"
            sx={{
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </Stack>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          onClick={handleSubmit}
        >
          Inicia sesión
        </Button>
      </Box>
      {subtitle}
    </>
)};

export default AuthLogin;


// 'use client';

// import {
//   Box,
//   Typography,
//   FormGroup,
//   FormControlLabel,
//   Button,
//   Stack,
//   Checkbox,
// } from '@mui/material';
// import Link from 'next/link';
// import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
// import { login } from '@/actions/auth';
// import { useFormStatus } from 'react-dom';

// interface loginType {
//   title?: string;
//   subtitle?: React.ReactNode;
//   subtext?: React.ReactNode;
// }

// function SubmitButton() {
//   const { pending } = useFormStatus();
//   return (
//     <Button
//       color="primary"
//       variant="contained"
//       size="large"
//       fullWidth
//       type="submit"
//       disabled={pending}
//     >
//       {pending ? 'Iniciando sesión...' : 'Inicia sesión'}
//     </Button>
//   );
// }

// export default function AuthLogin({ title, subtitle, subtext }: loginType) {
//   return (
//     <>
//       {title && (
//         <Typography fontWeight="700" variant="h2" mb={1}>
//           {title}
//         </Typography>
//       )}
//       {subtext}

//       <Box component="form" action={login}>
//         <Stack spacing={3}>
//           <Box>
//             <Typography variant="subtitle1" fontWeight={600} mb="5px">
//               Correo electrónico
//             </Typography>
//             <CustomTextField id="email" name="email" variant="outlined" fullWidth required />
//           </Box>
//           <Box>
//             <Typography variant="subtitle1" fontWeight={600} mb="5px">
//               Contraseña
//             </Typography>
//             <CustomTextField
//               id="password"
//               name="password"
//               type="password"
//               variant="outlined"
//               fullWidth
//               required
//             />
//           </Box>
//           <Stack justifyContent="space-between" direction="row" alignItems="center">
//             <FormGroup>
//               <FormControlLabel control={<Checkbox defaultChecked />} label="Recordar dispositivo" />
//             </FormGroup>
//             <Typography
//               component={Link}
//               href="/"
//               fontWeight="500"
//               sx={{ textDecoration: 'none', color: 'primary.main' }}
//             >
//               ¿Olvidaste tu contraseña?
//             </Typography>
//           </Stack>
//           <SubmitButton />
//         </Stack>
//       </Box>
//       {subtitle}
//     </>
//   );
// }