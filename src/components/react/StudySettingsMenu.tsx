import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Divider,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Switch,
    Typography,
} from '@mui/material';
import { Settings } from 'lucide-react';
import type { StudySettings } from '../../lib/studySettings';
import { useStudySettings } from './useStudySettings';

const SETTINGS: Array<{
    key: keyof StudySettings;
    label: string;
    description: string;
}> = [
    {
        key: 'shuffleOptions',
        label: 'Shuffle answer order',
        description:
            'Reorders the options for each question so answer positions cannot be memorised.',
    },
    {
        key: 'hideOptionLabels',
        label: 'Hide answer labels',
        description: 'Hides the A/B/C/D labels until the answer is revealed.',
    },
];

/**
 * Renders into the header slot provided by BankLayout for quiz and review, so
 * the cog mirrors the position of the back arrow.
 */
export const StudySettingsMenu: React.FC = () => {
    const [slot, setSlot] = useState<Element | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { settings, setSetting } = useStudySettings();

    useEffect(() => {
        setSlot(document.querySelector('[data-mode-settings]'));
    }, []);

    if (!slot) {
        return null;
    }

    return createPortal(
        <>
            <IconButton
                aria-label="Study options"
                title="Study options"
                aria-haspopup="true"
                aria-expanded={anchorEl ? true : undefined}
                onClick={event => setAnchorEl(event.currentTarget)}
                sx={{
                    width: '1.75rem',
                    height: '1.75rem',
                    p: 0,
                    color: 'inherit',
                }}
            >
                <Settings size={18} strokeWidth={1.5} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { maxWidth: 320 } } }}
            >
                <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ display: 'block', px: 2, pt: 0.5 }}
                >
                    Study options
                </Typography>
                <Divider sx={{ mt: 0.5 }} />
                {SETTINGS.map(setting => (
                    <MenuItem
                        key={setting.key}
                        onClick={() =>
                            setSetting(setting.key, !settings[setting.key])
                        }
                        sx={{ gap: 2, whiteSpace: 'normal', py: 1 }}
                    >
                        <ListItemText
                            primary={setting.label}
                            secondary={setting.description}
                            sx={{ my: 0 }}
                            slotProps={{
                                primary: { variant: 'body2' },
                                secondary: { variant: 'caption' },
                            }}
                        />
                        <Switch
                            size="small"
                            checked={settings[setting.key]}
                            tabIndex={-1}
                            disableRipple
                            sx={{ pointerEvents: 'none', flexShrink: 0 }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>,
        slot
    );
};
