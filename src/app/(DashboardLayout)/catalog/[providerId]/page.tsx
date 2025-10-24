"use client";

import { showErrorAlert } from "@/app/lib/swal";
import { useAppContext } from "@/context/AppContext";
import { AuxiliarType } from "@/interfaces/AuxiliarType";
import { Catalog } from "@/interfaces/Catalog";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import PageContainer from "../../components/container/PageContainer";
import DashboardCard from "../../components/shared/DashboardCard";
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Row } from "@/components/catalog/catalogRows";
import { User } from "@/interfaces/User";

export default function CatalogView() {

    const router = useRouter()
    const { token } = useAppContext();
    const { providerId } = useParams<{ providerId: string }>();
    const [serviceTypes, setServiceTypes] = useState<AuxiliarType[]>([]);
    // const [serviceTypesSelect, setServiceTypesSelect] = useState<AuxiliarType[]>([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [userInfo, setUserInfo] = useState<User | null>(null);

    const obtainInfo = React.useCallback(async () => {
        if (!token || !providerId) return;
        try {
            setLoadingTable(true);
            const res = await fetch(`/api/catalog/${providerId}`, { headers: { token: token as string } });
            const data = await res.json();

            if (data.message.code === '000') {
                console.log('algo');
                console.log(data);
                setCatalog(data.data.catalog);
                setServiceTypes(data.data.serviceTypes);
                setUserInfo(data.data.user);
                setLoadingTable(false);
            } else {
                showErrorAlert(data.message.description);
                setLoadingTable(false);
                router.push('/')
            }
        } catch (error) {
            showErrorAlert('Ha sucedido un error al obtener el catálogo.');
            setLoadingTable(false);
            console.error(error);
            router.push('/')
        }
    }, [token, providerId]);

    useEffect(() => {
        obtainInfo();
    }, [obtainInfo]);

    return (
        <PageContainer title='Catálogo' description='Página de catálogo'>
            <DashboardCard title={`Catálogo ${(!userInfo) ? '' : `de ${userInfo?.firstName} ${userInfo?.lastName}`}`}>
                <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
        
                    <Typography variant='h6' fontWeight={600} mb={2}>
                        Descripción
                    </Typography>
                    {catalog && (
                        <Typography color='gray' mb={3}>
                            {catalog.description ? catalog.description : 'Este proveedor aún no ha añadido su descripción'}
                        </Typography>
                )}
        
                    {loadingTable ? (
                        <Box sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress size='55px' className='mb-2' />
                        </Box>
                    ) : (
                    <>
                      <TableContainer component={Paper}>
                        <Table aria-label='collapsible table'>
                          <TableHead>
                            <TableRow>
                              <TableCell />
                              <TableCell>Tipo de servicio</TableCell>
                              <TableCell>Descripción</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {serviceTypes.map((type) => (
                              <Row key={type.id} type={type} services={catalog!.services.filter((s) => parseInt(s.serviceTypeId) === parseInt(type.id))} onServiceClick={() => {}} />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
        
                            {catalog?.services.length === 0 && (
                                <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: '100px',
                                }}
                                >
                                    <Typography className='text' variant='subtitle2' fontWeight={600}>
                                        No hay servicios en tu catálogo, ¡haz click Añadir Servicio para agregar uno!
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </DashboardCard>
        </PageContainer>
    );
}