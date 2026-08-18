import React from 'react';
import { Box, Button, Chip } from '@mui/material';
import { studyOptionPaddingSx } from '../../lib/studyCardStyles';

export type OptionCorrectness = 'none' | 'correct' | 'incorrect';

interface AnswerOptionButtonProps {
    letter: string;
    selected: boolean;
    struck?: boolean;
    disabled?: boolean;
    correctness?: OptionCorrectness;
    onSelect: () => void;
    onToggleStrike?: () => void;
    children: React.ReactNode;
}

export const AnswerOptionButton: React.FC<AnswerOptionButtonProps> = ({
    letter,
    selected,
    struck = false,
    disabled = false,
    correctness = 'none',
    onSelect,
    onToggleStrike,
    children,
}) => {
    const isCorrectSelection = correctness === 'correct';
    const isIncorrectSelection = correctness === 'incorrect';

    return (
        <Button
            onClick={onSelect}
            onContextMenu={event => {
                if (disabled || !onToggleStrike) {
                    return;
                }
                event.preventDefault();
                if (selected) {
                    return;
                }
                onToggleStrike();
            }}
            variant="outlined"
            disabled={disabled}
            sx={{
                ...studyOptionPaddingSx,
                justifyContent: 'flex-start',
                textTransform: 'none',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                textAlign: 'left',
                width: '100%',
                userSelect: 'none',
                opacity: struck ? 0.55 : 1,
                textDecoration: struck ? 'line-through' : 'none',
                borderColor: isCorrectSelection
                    ? 'success.main'
                    : isIncorrectSelection
                      ? 'error.main'
                      : selected
                        ? 'primary.main'
                        : 'divider',
                bgcolor: isCorrectSelection
                    ? 'success.light'
                    : isIncorrectSelection
                      ? 'error.light'
                      : selected
                        ? 'primary.light'
                        : 'transparent',
            }}
            title={`Select option ${letter}`}
        >
            <Chip
                label={letter}
                size="small"
                sx={{
                    flexShrink: 0,
                    bgcolor: selected ? 'primary.main' : 'divider',
                    color: selected ? 'common.white' : 'text.secondary',
                }}
            />
            <Box
                sx={{
                    minWidth: 0,
                    flex: 1,
                    width: '100%',
                    textDecoration: struck ? 'line-through' : 'none',
                }}
            >
                {children}
            </Box>
        </Button>
    );
};
