import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Stack,
    Chip,
} from '@mui/material';
import { ArrowLeft, Brain, Edit3, List } from 'lucide-react';
import type { QuestionBank, StudyMode } from '../../lib/banks';
import { getBankBasePath, MODE_LABELS } from '../../lib/banks';
import { getCertificationIcon } from '../../lib/certificationIcons';
import { ReactProviders } from './ReactProviders';

interface StudyHeaderProps {
    bank: QuestionBank;
    mode?: StudyMode | null;
}

function StudyHeaderContent({ bank, mode = null }: StudyHeaderProps) {
    const backHref = mode ? getBankBasePath(bank) : import.meta.env.BASE_URL;
    const backLabel = mode ? 'Back to menu' : 'Back to certifications';

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color: 'text.primary',
            }}
        >
            <Toolbar
                sx={{
                    gap: 2,
                    flexWrap: 'wrap',
                    minHeight: 56,
                    px: { xs: 2, md: 3 },
                    py: 1,
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        flex: 1,
                    }}
                >
                    <IconButton
                        component="a"
                        href={backHref}
                        aria-label={backLabel}
                        sx={{ color: 'common.black' }}
                    >
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Stack direction="row" spacing={1}>
                        {getCertificationIcon(bank.key, 24)}
                        <Typography variant="h6">
                            {bank.name} Flashcards
                        </Typography>
                    </Stack>
                    {mode ? (
                        <Chip
                            icon={
                                mode === 'quiz' ? (
                                    <Brain size={16} />
                                ) : mode === 'fill-in-blank' ? (
                                    <Edit3 size={16} />
                                ) : (
                                    <List size={16} />
                                )
                            }
                            label={MODE_LABELS[mode]}
                            color="primary"
                            variant="outlined"
                            sx={{ bgcolor: 'primary.light' }}
                        />
                    ) : null}
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export function StudyHeader(props: StudyHeaderProps) {
    return (
        <ReactProviders>
            <StudyHeaderContent {...props} />
        </ReactProviders>
    );
}
