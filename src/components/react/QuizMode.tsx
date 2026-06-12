import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Stack,
    Typography,
    IconButton,
    Button,
    LinearProgress,
    Card,
    CardContent,
    Divider,
    Chip,
} from '@mui/material';
import type { Question, QuestionPerformance } from '../../lib/banks';
import {
    CheckCircle,
    XCircle,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trophy,
    RotateCcw,
    HelpCircle,
} from 'lucide-react';
import { getOptionDisplayText } from '../../lib/textFormatting';
import { FormattedText } from './FormattedText';
import { hasOptionImages, OptionImagesGrid } from './OptionImagesGrid';
import { resolveAssetPath } from '../../lib/assets';

// Helper function to check if explanation has meaningful content
const hasExplanation = (explanation: string): boolean => {
    return explanation.trim().replace(/\n/g, '').length > 0;
};

const getOptionIndexFromKey = (
    key: string,
    optionCount: number
): number | null => {
    if (/^[1-9]$/.test(key)) {
        const index = parseInt(key, 10) - 1;
        return index < optionCount ? index : null;
    }

    const lower = key.toLowerCase();
    if (/^[a-z]$/.test(lower)) {
        const index = lower.charCodeAt(0) - 'a'.charCodeAt(0);
        return index < optionCount ? index : null;
    }

    return null;
};

interface QuizModeProps {
    questions: Question[];
    currentIndex: number;
    onAnswer: (isCorrect: boolean) => void;
    onNext: () => void;
    onPrevious: () => void;
    performance: Map<string, QuestionPerformance>;
    variant?: 'quiz' | 'review';
}

export const QuizMode: React.FC<QuizModeProps> = ({
    questions,
    currentIndex,
    onAnswer,
    onNext,
    onPrevious,
    performance,
    variant = 'quiz',
}) => {
    const isReview = variant === 'review';
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);

    const currentQuestion = questions[currentIndex];
    const currentPerformance = performance.get(currentQuestion?.id);

    const isMultiAnswer = currentQuestion.answer.length > 1;

    const getCorrectOptionIndexes = useCallback(() => {
        const letterToIndex: { [key: string]: number } = {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
            E: 4,
            F: 5,
            G: 6,
        };

        return currentQuestion.answer
            .map(answerLetter => {
                const normalized = answerLetter.trim().toUpperCase();
                return letterToIndex[normalized];
            })
            .filter((index): index is number => index !== undefined);
    }, [currentQuestion]);

    const handleOptionSelect = useCallback(
        (optionIndex: number) => {
            if (showAnswer) {
                return;
            }

            if (isMultiAnswer) {
                setSelectedOptions(prev => {
                    if (prev.includes(optionIndex)) {
                        return prev.filter(option => option !== optionIndex);
                    }
                    return [...prev, optionIndex];
                });
            } else {
                setSelectedOptions([optionIndex]);
            }
        },
        [showAnswer, isMultiAnswer]
    );

    const handleRevealAnswer = useCallback(() => {
        setShowAnswer(true);

        // Automatically determine if the answer is correct
        const correctOptionIndexes = getCorrectOptionIndexes();
        const isCorrect =
            selectedOptions.length === correctOptionIndexes.length &&
            selectedOptions.every(option =>
                correctOptionIndexes.includes(option)
            );

        // Automatically call onAnswer with the result
        onAnswer(isCorrect);
    }, [getCorrectOptionIndexes, selectedOptions, onAnswer]);

    useEffect(() => {
        if (!currentQuestion) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                return;
            }

            if (event.key === 'Enter') {
                if (!showAnswer && selectedOptions.length > 0) {
                    event.preventDefault();
                    handleRevealAnswer();
                }
                return;
            }

            if (showAnswer) {
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
    }, [
        currentQuestion,
        showAnswer,
        selectedOptions,
        handleOptionSelect,
        handleRevealAnswer,
    ]);

    const handleNext = useCallback(() => {
        setShowAnswer(false);
        setSelectedOptions([]);
        onNext();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [onNext]);

    const handlePrevious = useCallback(() => {
        setShowAnswer(false);
        setSelectedOptions([]);
        onPrevious();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [onPrevious]);

    if (!currentQuestion) {
        return (
            <Box sx={{ maxWidth: 720, mx: 'auto', px: 2 }}>
                <Card>
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'center' }}>
                            {isReview ? (
                                <RotateCcw size={48} />
                            ) : (
                                <Trophy size={48} />
                            )}
                            <Typography
                                variant="h5"
                                sx={{ textAlign: 'center' }}
                            >
                                {isReview
                                    ? 'Review Complete! Great job!'
                                    : 'Quiz Complete! Great job!'}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => window.location.reload()}
                                startIcon={<RotateCcw size={16} />}
                            >
                                Start Over
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const correctOptionIndexes = getCorrectOptionIndexes();
    const isCorrect =
        selectedOptions.length === correctOptionIndexes.length &&
        selectedOptions.every(option => correctOptionIndexes.includes(option));

    return (
        <Box sx={{ maxWidth: 720, mx: 'auto', px: 2 }}>
            <Stack spacing={2}>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <IconButton
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        aria-label="Previous question"
                    >
                        <ChevronLeft size={24} />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                        Question {currentIndex + 1} of {questions.length}
                    </Typography>
                    <IconButton
                        onClick={handleNext}
                        disabled={currentIndex === questions.length - 1}
                        aria-label="Next question"
                    >
                        <ChevronRight size={24} />
                    </IconButton>
                </Stack>
                <LinearProgress
                    variant="determinate"
                    value={((currentIndex + 1) / questions.length) * 100}
                    sx={{ height: 6, borderRadius: 999 }}
                />
                <Card
                    sx={{
                        overflow: 'hidden',
                        ...(isReview
                            ? {
                                  borderLeft: '4px solid',
                                  borderColor: 'warning.main',
                              }
                            : {}),
                    }}
                >
                    <CardContent sx={{ overflow: 'hidden' }}>
                        <Stack spacing={2}>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Stack direction="row" spacing={1}>
                                    <HelpCircle size={18} />
                                    <Typography variant="subtitle1">
                                        Question
                                    </Typography>
                                </Stack>
                                {currentPerformance && (
                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            size="small"
                                            icon={<CheckCircle size={14} />}
                                            label={
                                                currentPerformance.correctCount
                                            }
                                            color="success"
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            icon={<XCircle size={14} />}
                                            label={
                                                currentPerformance.incorrectCount
                                            }
                                            color="error"
                                            variant="outlined"
                                        />
                                    </Stack>
                                )}
                            </Stack>
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
                            <Stack spacing={2}>
                                {hasOptionImages(
                                    currentQuestion.optionImages
                                ) ? (
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
                                                currentQuestion.optionImages ??
                                                []
                                            }
                                        />
                                    </Box>
                                ) : null}
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2">
                                        Choose the correct answer:
                                    </Typography>
                                    <Stack spacing={1}>
                                        {currentQuestion.options.map(
                                            (option, index) => {
                                                const isSelected =
                                                    selectedOptions.includes(
                                                        index
                                                    );
                                                const isCorrectOption =
                                                    correctOptionIndexes.includes(
                                                        index
                                                    );
                                                const isIncorrectSelection =
                                                    showAnswer &&
                                                    isSelected &&
                                                    !isCorrectOption;
                                                const isCorrectSelection =
                                                    showAnswer &&
                                                    isCorrectOption;
                                                return (
                                                    <Button
                                                        key={index}
                                                        onClick={() =>
                                                            handleOptionSelect(
                                                                index
                                                            )
                                                        }
                                                        variant="outlined"
                                                        disabled={showAnswer}
                                                        sx={{
                                                            justifyContent:
                                                                'flex-start',
                                                            textTransform:
                                                                'none',
                                                            gap: 2,
                                                            alignItems:
                                                                'flex-start',
                                                            whiteSpace:
                                                                'normal',
                                                            textAlign: 'left',
                                                            width: '100%',
                                                            borderColor:
                                                                isCorrectSelection
                                                                    ? 'success.main'
                                                                    : isIncorrectSelection
                                                                      ? 'error.main'
                                                                      : isSelected
                                                                        ? 'primary.main'
                                                                        : 'divider',
                                                            bgcolor:
                                                                isCorrectSelection
                                                                    ? 'success.light'
                                                                    : isIncorrectSelection
                                                                      ? 'error.light'
                                                                      : isSelected
                                                                        ? 'primary.light'
                                                                        : 'transparent',
                                                        }}
                                                        title={`Select option ${String.fromCharCode(
                                                            65 + index
                                                        )} (${index + 1})`}
                                                    >
                                                        <Chip
                                                            label={String.fromCharCode(
                                                                65 + index
                                                            )}
                                                            size="small"
                                                            sx={{
                                                                flexShrink: 0,
                                                                bgcolor:
                                                                    isSelected
                                                                        ? 'primary.main'
                                                                        : 'divider',
                                                                color: isSelected
                                                                    ? 'common.white'
                                                                    : 'text.secondary',
                                                            }}
                                                        />
                                                        <Box
                                                            sx={{
                                                                minWidth: 0,
                                                                flex: 1,
                                                                width: '100%',
                                                            }}
                                                        >
                                                            <FormattedText
                                                                text={getOptionDisplayText(
                                                                    option,
                                                                    index
                                                                )}
                                                                variant="body2"
                                                                color="text.primary"
                                                            />
                                                        </Box>
                                                    </Button>
                                                );
                                            }
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>
                            {showAnswer && (
                                <>
                                    <Divider />
                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={1}>
                                            <CheckCircle size={18} />
                                            <Typography variant="subtitle1">
                                                Explanation
                                            </Typography>
                                        </Stack>
                                        <FormattedText
                                            text={`Correct Answer: ${currentQuestion.answer.join(', ')}`}
                                            variant="body1"
                                            component="div"
                                            sx={{ fontWeight: 700 }}
                                        />
                                        {hasExplanation(
                                            currentQuestion.explanation
                                        ) && (
                                            <Box
                                                sx={{
                                                    bgcolor: 'primary.light',
                                                    p: 2,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <FormattedText
                                                    text={
                                                        currentQuestion.explanation
                                                    }
                                                    variant="body2"
                                                />
                                            </Box>
                                        )}
                                        {selectedOptions.length > 0 && (
                                            <Box
                                                sx={{
                                                    bgcolor: isCorrect
                                                        ? 'success.light'
                                                        : 'error.light',
                                                    p: 2,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    {isCorrect ? (
                                                        <CheckCircle
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <XCircle size={20} />
                                                    )}
                                                    <FormattedText
                                                        text={
                                                            isCorrect
                                                                ? 'Correct! Well done.'
                                                                : `Incorrect. The correct answer was ${currentQuestion.answer.join(', ')}.`
                                                        }
                                                        variant="body2"
                                                        component="span"
                                                    />
                                                </Stack>
                                            </Box>
                                        )}
                                    </Stack>
                                </>
                            )}
                            <Box>
                                {!showAnswer ? (
                                    <Button
                                        variant="contained"
                                        onClick={handleRevealAnswer}
                                        disabled={selectedOptions.length === 0}
                                        startIcon={<Eye size={16} />}
                                    >
                                        Reveal Answer
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        startIcon={<ArrowRight size={20} />}
                                    >
                                        Next Question
                                    </Button>
                                )}
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};
