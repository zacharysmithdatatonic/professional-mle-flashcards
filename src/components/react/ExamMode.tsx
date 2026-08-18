import React, { useCallback, useEffect, useMemo } from 'react';
import {
    Box,
    Stack,
    Typography,
    IconButton,
    Button,
    Tooltip,
    Card,
    CardContent,
} from '@mui/material';
import type { Question } from '../../lib/banks';
import { ArrowRight, Flag } from 'lucide-react';
import {
    studyCardContentSx,
    studyCardSx,
    studyCardWrapperSx,
} from '../../lib/studyCardStyles';
import { getOptionDisplayText } from '../../lib/textFormatting';
import { FormattedText } from './FormattedText';
import { CaseStudyCallout } from './CaseStudyCallout';
import { hasOptionImages, OptionImagesGrid } from './OptionImagesGrid';
import { AnswerOptionButton } from './AnswerOptionButton';
import { ExamNavHeader } from './ExamNavHeader';
import { resolveAssetPath } from '../../lib/assets';
import {
    getCorrectOriginalIndexes,
    getOptionIndexFromKey,
} from '../../lib/exam';

interface ExamModeProps {
    questions: Question[];
    currentIndex: number;
    optionOrder: number[];
    selectedOriginal: number[];
    struckOriginal: number[];
    flagged: boolean;
    remainingMs: number;
    onSelectOriginal: (originalIndex: number) => void;
    onUnstrikeAndSelectOriginal: (originalIndex: number) => void;
    onToggleStrikeOriginal: (originalIndex: number) => void;
    onToggleFlag: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSkipToEnd: () => void;
}

export const ExamMode: React.FC<ExamModeProps> = ({
    questions,
    currentIndex,
    optionOrder,
    selectedOriginal,
    struckOriginal,
    flagged,
    remainingMs,
    onSelectOriginal,
    onUnstrikeAndSelectOriginal,
    onToggleStrikeOriginal,
    onToggleFlag,
    onNext,
    onPrevious,
    onSkipToEnd,
}) => {
    const currentQuestion = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const requiredCount = Math.max(
        currentQuestion ? getCorrectOriginalIndexes(currentQuestion).length : 1,
        1
    );
    const isMultiAnswer = requiredCount > 1;
    const remainingSelections = Math.max(
        requiredCount - selectedOriginal.length,
        0
    );

    const displayOptions = useMemo(
        () =>
            optionOrder.map(
                originalIndex => currentQuestion?.options[originalIndex] ?? ''
            ),
        [optionOrder, currentQuestion]
    );

    const displayOptionImages = useMemo(() => {
        if (!currentQuestion?.optionImages?.length) {
            return undefined;
        }
        return optionOrder.map(
            originalIndex =>
                currentQuestion.optionImages?.[originalIndex] ?? null
        );
    }, [optionOrder, currentQuestion]);

    const selectedDisplay = useMemo(
        () =>
            selectedOriginal
                .map(originalIndex => optionOrder.indexOf(originalIndex))
                .filter(index => index >= 0),
        [selectedOriginal, optionOrder]
    );

    const struckDisplay = useMemo(
        () =>
            new Set(
                struckOriginal
                    .map(originalIndex => optionOrder.indexOf(originalIndex))
                    .filter(index => index >= 0)
            ),
        [struckOriginal, optionOrder]
    );

    const handleOptionSelect = useCallback(
        (displayIndex: number) => {
            const originalIndex = optionOrder[displayIndex];
            if (originalIndex === undefined) {
                return;
            }
            if (struckDisplay.has(displayIndex)) {
                onUnstrikeAndSelectOriginal(originalIndex);
                return;
            }
            onSelectOriginal(originalIndex);
        },
        [
            optionOrder,
            struckDisplay,
            onSelectOriginal,
            onUnstrikeAndSelectOriginal,
        ]
    );

    const handleToggleStrike = useCallback(
        (displayIndex: number) => {
            const originalIndex = optionOrder[displayIndex];
            if (originalIndex === undefined) {
                return;
            }
            onToggleStrikeOriginal(originalIndex);
        },
        [optionOrder, onToggleStrikeOriginal]
    );

    const handleNext = useCallback(() => {
        onNext();
    }, [onNext]);

    const handlePrevious = useCallback(() => {
        onPrevious();
    }, [onPrevious]);

    const handleSkipToEnd = useCallback(() => {
        onSkipToEnd();
    }, [onSkipToEnd]);

    useEffect(() => {
        if (!currentQuestion) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                handleNext();
                return;
            }

            const optionIndex = getOptionIndexFromKey(
                event.key,
                currentQuestion.options.length
            );
            if (optionIndex === null) {
                return;
            }

            event.preventDefault();
            handleOptionSelect(optionIndex);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestion, handleNext, handleOptionSelect]);

    if (!currentQuestion) {
        return null;
    }

    return (
        <Box sx={studyCardWrapperSx}>
            <Stack spacing={2}>
                <ExamNavHeader
                    label={`Question ${currentIndex + 1} of ${questions.length}`}
                    remainingMs={remainingMs}
                    progress={((currentIndex + 1) / questions.length) * 100}
                    previousDisabled={currentIndex === 0}
                    nextAriaLabel={
                        isLast ? 'Go to end of exam' : 'Next question'
                    }
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSkipToEnd={handleSkipToEnd}
                />
                <Card sx={studyCardSx()}>
                    <CardContent sx={studyCardContentSx}>
                        <Stack spacing={2}>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                            >
                                <Tooltip
                                    title={
                                        flagged
                                            ? 'Remove flag'
                                            : 'Flag for review'
                                    }
                                >
                                    <IconButton
                                        size="small"
                                        onClick={onToggleFlag}
                                        aria-label={
                                            flagged
                                                ? 'Remove flag'
                                                : 'Flag for review'
                                        }
                                        aria-pressed={flagged}
                                        sx={{
                                            p: 0.5,
                                            color: flagged
                                                ? 'error.main'
                                                : 'text.primary',
                                        }}
                                    >
                                        <Flag
                                            size={16}
                                            fill={
                                                flagged
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                            {currentQuestion.caseStudy ? (
                                <CaseStudyCallout
                                    caseStudy={currentQuestion.caseStudy}
                                />
                            ) : null}
                            <FormattedText text={currentQuestion.question} />
                            {currentQuestion.questionImages?.length ? (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ flexWrap: 'wrap' }}
                                >
                                    {currentQuestion.questionImages.map(
                                        (image, index) => (
                                            <Box
                                                key={`${currentQuestion.id}-qimg-${index}`}
                                                component="img"
                                                src={resolveAssetPath(image)}
                                                alt=""
                                                sx={{
                                                    maxWidth: '100%',
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            />
                                        )
                                    )}
                                </Stack>
                            ) : null}
                            {isMultiAnswer ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {remainingSelections > 0
                                        ? `Select ${remainingSelections} answer${
                                              remainingSelections === 1
                                                  ? ''
                                                  : 's'
                                          }`
                                        : `Select ${requiredCount} answers`}
                                </Typography>
                            ) : null}
                            <Stack spacing={2}>
                                {hasOptionImages(displayOptionImages) ? (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: 'grey.50',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <OptionImagesGrid
                                            optionImages={
                                                displayOptionImages ?? []
                                            }
                                        />
                                    </Box>
                                ) : null}
                                <Stack spacing={1}>
                                    {displayOptions.map((option, index) => (
                                        <AnswerOptionButton
                                            key={optionOrder[index] ?? index}
                                            letter={String.fromCharCode(
                                                65 + index
                                            )}
                                            selected={selectedDisplay.includes(
                                                index
                                            )}
                                            struck={struckDisplay.has(index)}
                                            onSelect={() =>
                                                handleOptionSelect(index)
                                            }
                                            onToggleStrike={() =>
                                                handleToggleStrike(index)
                                            }
                                        >
                                            <FormattedText
                                                text={getOptionDisplayText(
                                                    option,
                                                    index
                                                )}
                                                variant="body2"
                                                color="text.primary"
                                            />
                                        </AnswerOptionButton>
                                    ))}
                                </Stack>
                            </Stack>
                            {isLast ? null : (
                                <Box>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        startIcon={<ArrowRight size={20} />}
                                    >
                                        Next Question
                                    </Button>
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};
