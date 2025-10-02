'use client';
import { Typography, Grid, CardContent } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { User } from '@/interfaces/User';
import { showFormalDate } from '@/utils/Formats';


const ProfilePage = () => {
    const { token } = useAppContext();
    const [user, setUser] = useState<User | null>(null);

    const obtainProfile = React.useCallback(async () => {
        if (!token) return;
        const response = await fetch('/api/profile', { headers: { token: token as string } });
        const data = await response.json();
        console.log(data);
        setUser(data);        
    }, [token])

    useEffect(() => {
        obtainProfile();
    }, [obtainProfile]);

  return (
    <PageContainer title="Perfil" description="Este es el perfil">
      <Grid container spacing={3}>
        <Grid
          size={{
            sm: 12
          }}>
          <DashboardCard title="Tus datos básicos">
            <Grid container spacing={3}>
              <Grid
                size={{
                  sm: 12
                }}>
                <BlankCard>
                  <CardContent>
                    <Typography variant="body1" color="textSecondary">
                      Nombres: 
                    </Typography>
                    <Typography variant="h5">{user?.firstName}</Typography>

                    <Typography variant="body1" color="textSecondary">
                      Apellidos: 
                    </Typography>
                    <Typography variant="h5">{user?.lastName}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      email: 
                    </Typography>
                    <Typography variant="h5">{user?.email}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      Teléfono: 
                    </Typography>
                    <Typography variant="h5">{user?.telephone}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      Tipo de usuario: 
                    </Typography>
                    <Typography variant="h5">{user?.typeuser.name}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      ¿Qué significa ser {user?.typeuser.name}?:
                    </Typography>
                    <Typography variant="h5">{user?.typeuser.description}</Typography>
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