import React from 'react';
import {
    Box,
    IconButton,
    LinearProgress,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { ArrowRightToLine, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRemainingTime } from '../../lib/exam';

interface ExamNavHeaderProps {
    label: string;
    remainingMs: number;
    progress: number;
    previousDisabled?: boolean;
    nextDisabled?: boolean;
    skipDisabled?: boolean;
    nextAriaLabel?: string;
    onPrevious: () => void;
    onNext: () => void;
    onSkipToEnd: () => void;
}

export const ExamNavHeader: React.FC<ExamNavHeaderProps> = ({
    label,
    remainingMs,
    progress,
    previousDisabled = false,
    nextDisabled = false,
    skipDisabled = false,
    nextAriaLabel = 'Next question',
    onPrevious,
    onNext,
    onSkipToEnd,
}) => {
    const timerColor =
        remainingMs <= 60_000
            ? 'error.main'
            : remainingMs <= 5 * 60_000
              ? 'warning.main'
              : 'text.secondary';

    return (
        <Stack spacing={2}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                }}
            >
                <IconButton
                    onClick={onPrevious}
                    disabled={previousDisabled}
                    aria-label="Previous question"
                    sx={{ justifySelf: 'start' }}
                >
                    <ChevronLeft size={24} />
                </IconButton>
                <Stack sx={{ alignItems: 'center' }} spacing={0.25}>
                    <Typography variant="body2" color="text.secondary">
                        {label}
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: timerColor,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {formatRemainingTime(remainingMs)}
                    </Typography>
                </Stack>
                <Stack
                    direction="row"
                    sx={{ justifySelf: 'end', alignItems: 'center' }}
                >
                    <IconButton
                        onClick={onNext}
                        disabled={nextDisabled}
                        aria-label={nextAriaLabel}
                    >
                        <ChevronRight size={24} />
                    </IconButton>
                    <Tooltip title="Skip to end">
                        <span>
                            <IconButton
                                onClick={onSkipToEnd}
                                disabled={skipDisabled}
                                aria-label="Skip to end"
                            >
                                <ArrowRightToLine size={24} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Box>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 999 }}
            />
        </Stack>
    );
};
