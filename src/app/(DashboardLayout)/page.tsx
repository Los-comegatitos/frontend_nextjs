'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components
// import SalesOverview from '@/app/(DashboardLayout)/components/dashboard/SalesOverview';
import YearlyBreakup from '@/app/(DashboardLayout)/components/dashboard/YearlyBreakup';
import RecentTransactions from '@/app/(DashboardLayout)/components/dashboard/RecentTransactions';
import ProductPerformance from '@/app/(DashboardLayout)/components/dashboard/ProductPerformance';
import Blog from '@/app/(DashboardLayout)/components/dashboard/Blog';
import MonthlyEarnings from '@/app/(DashboardLayout)/components/dashboard/MonthlyEarnings';
// import { useState } from 'react';
// import { useAppContext } from '@/context/AppContext';

const Dashboard = () => {
  // const { user } = useAppContext();
  // const [user, setUser] = useState()
  // console.log('en el principal es así');
  
  // console.log(user);
  
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      {/* <p>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</p>
      <p>este es el email{ user?.email }</p> */}
      <Box>
        <Grid container spacing={3}>
          {/* <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <SalesOverview />
          </Grid> */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <YearlyBreakup />
              </Grid>
              <Grid size={12}>
                <MonthlyEarnings />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <RecentTransactions />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <ProductPerformance />
          </Grid>
          <Grid size={12}>
            <Blog />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}

export default Dashboard;
