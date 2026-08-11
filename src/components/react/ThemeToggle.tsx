import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { mode, systemMode, setMode } = useColorScheme();
    const isDark =
        mode === 'dark' || (mode === 'system' && systemMode === 'dark');
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

    return (
        <Tooltip title={label}>
            <IconButton
                aria-label={label}
                color="inherit"
                onClick={() => setMode(isDark ? 'light' : 'dark')}
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
        </Tooltip>
    );
}
