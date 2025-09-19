"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppProvider } from '@/context/AppContext';
import './global.css'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <ThemeProvider theme={baselightTheme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
