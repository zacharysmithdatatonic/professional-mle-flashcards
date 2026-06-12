import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Card,
    CardContent,
    CardActionArea,
} from '@mui/material';
import { Brain, Edit3, List, RotateCcw } from 'lucide-react';
import type { QuestionBank, StudyMode } from '../../lib/banks';
import { getBankModePath } from '../../lib/banks';
import { ReactProviders } from './ReactProviders';

interface ModePickerProps {
    bank: QuestionBank;
    reviewQuestionCount?: number;
}

const MODES: Array<{
    key: StudyMode;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    disabled?: (reviewQuestionCount: number) => boolean;
    badge?: (reviewQuestionCount: number) => string | undefined;
}> = [
    {
        key: 'quiz',
        label: 'Quiz Mode',
        description: 'Test your knowledge with multiple choice questions.',
        icon: <Brain size={28} />,
        color: '#1e8e3e',
    },
    {
        key: 'review',
        label: 'Review Mode',
        description:
            "Focus on questions you got wrong or haven't answered yet.",
        icon: <RotateCcw size={28} />,
        color: '#f9ab00',
        disabled: count => count === 0,
        badge: count => (count === 0 ? 'No questions need review' : undefined),
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

function ModePickerCards({ bank, reviewQuestionCount = 0 }: ModePickerProps) {
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
                {MODES.map(mode => {
                    const isDisabled = mode.disabled?.(reviewQuestionCount);
                    const badge = mode.badge?.(reviewQuestionCount);

                    return (
                        <Card
                            key={mode.key}
                            sx={{
                                borderLeft: `4px solid ${mode.color}`,
                                opacity: isDisabled ? 0.6 : 1,
                                minHeight: 160,
                            }}
                        >
                            <CardActionArea
                                component={isDisabled ? 'div' : 'a'}
                                href={
                                    isDisabled
                                        ? undefined
                                        : getBankModePath(bank, mode.key)
                                }
                                disabled={isDisabled}
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
                                        {badge ? (
                                            <Typography
                                                variant="caption"
                                                color="error"
                                            >
                                                {badge}
                                            </Typography>
                                        ) : null}
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    );
                })}
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
