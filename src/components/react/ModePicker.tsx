import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Card,
    CardContent,
    CardActionArea,
} from '@mui/material';
import { Brain, Edit3, List } from 'lucide-react';
import type { QuestionBank, StudyMode } from '../../lib/banks';
import { getBankModePath } from '../../lib/banks';
import { ReactProviders } from './ReactProviders';

interface ModePickerProps {
    bank: QuestionBank;
}

const MODES: Array<{
    key: StudyMode;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}> = [
    {
        key: 'quiz',
        label: 'Quiz Mode',
        description: 'Test your knowledge with multiple choice questions.',
        icon: <Brain size={28} />,
        color: '#1e8e3e',
    },
    {
        key: 'memorise',
        label: 'Memorise Mode',
        description:
            'Browse all questions and answers with performance tracking.',
        icon: <List size={28} />,
        color: '#9334e6',
    },
    {
        key: 'fill-in-blank',
        label: 'Fill-in-the-Blank Mode',
        description:
            'Complete answers by filling in missing technical keywords.',
        icon: <Edit3 size={28} />,
        color: '#ea4335',
    },
];

function ModePickerCards({ bank }: ModePickerProps) {
    return (
        <Box>
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
                Choose Study Mode
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                    },
                }}
            >
                {MODES.map(mode => (
                    <Card
                        key={mode.key}
                        sx={{
                            borderLeft: `4px solid ${mode.color}`,
                            minHeight: 160,
                        }}
                    >
                        <CardActionArea
                            component="a"
                            href={getBankModePath(bank, mode.key)}
                            sx={{ height: '100%' }}
                        >
                            <CardContent sx={{ height: '100%' }}>
                                <Stack spacing={1} sx={{ height: '100%' }}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        {mode.icon}
                                        <Typography variant="h6">
                                            {mode.label}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {mode.description}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export function ModePicker(props: ModePickerProps) {
    return (
        <ReactProviders>
            <ModePickerCards {...props} />
        </ReactProviders>
    );
}

export { ModePickerCards };
