'use client';
import { Typography, Grid, CardContent, Container, Button } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { showFormalDate } from '@/utils/Formats';
import { Notification } from '@/interfaces/Notification';
import { showErrorAlert } from '@/app/lib/swal';
import { useRouter } from 'next/navigation';


const NotificationsPage = () => {
    const { token, hasNotifications } = useAppContext();
    const [info, setInfo] = useState<Notification[]>([]);
    const [selectedId, setSelectedId] = useState(0)
    const router = useRouter()

    const obtainNotifications = React.useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch('/api/notification', { headers: { token: token as string } });
            if (!response.ok) {
                const errorData = await response.json();
                showErrorAlert(errorData.message?.description || 'Error al buscar tus notificaciones');
                return;
            }
            const data = await response.json();
            console.log(data);
            setInfo(data?.data)
        } catch (error) {
            console.error(error);
            await showErrorAlert('Error interno al buscar tus notificaciones');
        }
    }, [token])

    useEffect(() => {
        obtainNotifications();
    }, [obtainNotifications]);

    useEffect(() => {
        if (!selectedId || !token) return
        async function selectingNotification() {
            try {
                const response = await fetch(`/api/notification/${selectedId}`, { 
                    method: 'PATCH', 
                    headers: { token: token as string } 
                });
            if (!response.ok) {
                const errorData = await response.json();
                showErrorAlert(errorData.message?.description || 'Error al marcar como vista tu noficación');
                return;
            }
            await obtainNotifications()
            } catch (error) {
                console.error(error);
                await showErrorAlert('Error interno al marcar como vista tu notificación');
            } finally {
                setSelectedId(0)
            }
        }
        selectingNotification()
    }, [selectedId, token, obtainNotifications])

  return (
    <PageContainer title="Notificaciones" description="Notificación recientes">
      <Grid container spacing={3}>
        <Grid
          size={{
            sm: 12
          }}>
          <DashboardCard title="Notificaciones recientes">
            <Grid container spacing={3}>
              <Grid
                size={{
                  sm: 12
                }}>
                {
                    (hasNotifications) ?
                    info.map((e) => (
                        <BlankCard key={e.id}>
                            <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Container sx={{
                                    ":hover": {
                                        textDecorationLine: 'underline', 
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => {
                                    router.push(e.url)
                                }}>
                                    <Typography variant='h3'>{e.name}</Typography> <br/>
                                    <Typography>{e.description}</Typography>
                                    <Typography variant='caption'>{showFormalDate(e.date)}</Typography>
                                </Container>
                                <Button onClick={(a) => {
                                    a.currentTarget.disabled = true
                                    setSelectedId(e.id)
                                }}>
                                    Eliminar
                                </Button>
                            </CardContent>
                        </BlankCard>
                    ))
                    :
                    <Typography>No tienes ninguna notificación... aún</Typography>
                }
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default NotificationsPage;