import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { theme } from '../../lib/theme';

interface ReactProvidersProps {
    children: React.ReactNode;
}

export function ReactProviders({ children }: ReactProvidersProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toaster />
            {children}
        </ThemeProvider>
    );
}
