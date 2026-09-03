import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { getQuestionTotals } from '../../lib/performance';
import {
    studyCardContentSx,
    studyCardSx,
    studyCardWrapperSx,
} from '../../lib/studyCardStyles';
import { getOptionDisplayText } from '../../lib/textFormatting';
import {
    createDisplayOrder,
    indexToLetter,
    remapAnswerLabels,
    remapOptionLetters,
} from '../../lib/optionLetters';
import { useStudySettings } from './useStudySettings';
import { StudySettingsMenu } from './StudySettingsMenu';
import { FormattedText } from './FormattedText';
import { CaseStudyCallout } from './CaseStudyCallout';
import { ExplanationLinks } from './ExplanationLinks';
import { ReportQuestionIssueButton } from './ReportQuestionIssueButton';
import { hasOptionImages, OptionImagesGrid } from './OptionImagesGrid';
import { AnswerOptionButton } from './AnswerOptionButton';
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
    bankKey: string;
    variant?: 'quiz' | 'review';
}

export const QuizMode: React.FC<QuizModeProps> = ({
    questions,
    currentIndex,
    onAnswer,
    onNext,
    onPrevious,
    performance,
    bankKey,
    variant = 'quiz',
}) => {
    const isReview = variant === 'review';
    const { settings: studySettings } = useStudySettings();
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [struckOptions, setStruckOptions] = useState<number[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);

    const currentQuestion = questions[currentIndex];
    const currentPerformance = performance.get(currentQuestion?.id);
    const questionTotals = useMemo(
        () => getQuestionTotals(questions),
        [questions]
    );

    // Toggling the shuffle setting mid-session has to rebuild the order too,
    // since selections are tracked by display position.
    const questionKey = currentQuestion
        ? `${currentIndex}:${currentQuestion.id}:${studySettings.shuffleOptions}`
        : '';
    const [orderKey, setOrderKey] = useState(questionKey);
    const [optionOrder, setOptionOrder] = useState<number[]>(() =>
        currentQuestion
            ? createDisplayOrder(
                  currentQuestion.options.length,
                  studySettings.shuffleOptions
              )
            : []
    );

    if (questionKey !== orderKey) {
        setOrderKey(questionKey);
        setOptionOrder(
            currentQuestion
                ? createDisplayOrder(
                      currentQuestion.options.length,
                      studySettings.shuffleOptions
                  )
                : []
        );
        setSelectedOptions([]);
        setStruckOptions([]);
    }

    const originalCorrectIndexes = useMemo(() => {
        const letterToIndex: { [key: string]: number } = {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
            E: 4,
            F: 5,
            G: 6,
        };

        return (currentQuestion?.answer ?? [])
            .map(answerLetter => {
                const normalized = answerLetter.trim().toUpperCase();
                return letterToIndex[normalized];
            })
            .filter((index): index is number => index !== undefined);
    }, [currentQuestion]);

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

    const correctDisplayIndexes = useMemo(
        () =>
            originalCorrectIndexes
                .map(originalIndex => optionOrder.indexOf(originalIndex))
                .filter(index => index >= 0),
        [originalCorrectIndexes, optionOrder]
    );

    const correctAnswerLabels = useMemo(
        () => remapAnswerLabels(currentQuestion?.answer ?? [], optionOrder),
        [currentQuestion, optionOrder]
    );

    const explanationText = useMemo(
        () =>
            remapOptionLetters(currentQuestion?.explanation ?? '', optionOrder),
        [currentQuestion, optionOrder]
    );

    // Fall back to one so an unparseable answer key cannot lock the button.
    const requiredCount = Math.max(originalCorrectIndexes.length, 1);
    const isMultiAnswer = requiredCount > 1;
    const remainingSelections = Math.max(
        requiredCount - selectedOptions.length,
        0
    );
    const isReadyToReveal = remainingSelections === 0;
    const revealLabel = isReadyToReveal
        ? 'Reveal Answer'
        : `Select ${remainingSelections} answer${
              remainingSelections === 1 ? '' : 's'
          }`;

    const handleOptionSelect = useCallback(
        (optionIndex: number) => {
            if (showAnswer) {
                return;
            }

            if (struckOptions.includes(optionIndex)) {
                setStruckOptions(prev =>
                    prev.filter(option => option !== optionIndex)
                );
                if (isMultiAnswer) {
                    setSelectedOptions(prev => {
                        if (prev.includes(optionIndex)) {
                            return prev;
                        }
                        if (prev.length >= requiredCount) {
                            return prev;
                        }
                        return [...prev, optionIndex];
                    });
                } else {
                    setSelectedOptions([optionIndex]);
                }
                return;
            }

            if (isMultiAnswer) {
                setSelectedOptions(prev => {
                    if (prev.includes(optionIndex)) {
                        return prev.filter(option => option !== optionIndex);
                    }
                    if (prev.length >= requiredCount) {
                        return prev;
                    }
                    return [...prev, optionIndex];
                });
            } else {
                setSelectedOptions([optionIndex]);
            }
        },
        [showAnswer, isMultiAnswer, requiredCount, struckOptions]
    );

    const handleToggleStrike = useCallback(
        (optionIndex: number) => {
            if (showAnswer || selectedOptions.includes(optionIndex)) {
                return;
            }
            setStruckOptions(prev =>
                prev.includes(optionIndex)
                    ? prev.filter(option => option !== optionIndex)
                    : [...prev, optionIndex]
            );
        },
        [showAnswer, selectedOptions]
    );

    const handleRevealAnswer = useCallback(() => {
        const isCorrect =
            selectedOptions.length === correctDisplayIndexes.length &&
            selectedOptions.every(option =>
                correctDisplayIndexes.includes(option)
            );

        setShowAnswer(true);
        onAnswer(isCorrect);
    }, [correctDisplayIndexes, selectedOptions, onAnswer]);

    useEffect(() => {
        if (!currentQuestion) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                return;
            }

            if (event.key === 'Enter') {
                if (!showAnswer && isReadyToReveal) {
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
        isReadyToReveal,
        handleOptionSelect,
        handleRevealAnswer,
    ]);

    const handleNext = useCallback(() => {
        setShowAnswer(false);
        setSelectedOptions([]);
        setStruckOptions([]);
        onNext();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [onNext]);

    const handlePrevious = useCallback(() => {
        setShowAnswer(false);
        setSelectedOptions([]);
        setStruckOptions([]);
        onPrevious();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [onPrevious]);

    if (!currentQuestion) {
        return (
            <Box sx={{ maxWidth: 720, mx: 'auto', px: 2 }}>
                <StudySettingsMenu />
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

    const isCorrect =
        selectedOptions.length === correctDisplayIndexes.length &&
        selectedOptions.every(option => correctDisplayIndexes.includes(option));

    return (
        <Box sx={studyCardWrapperSx}>
            <StudySettingsMenu />
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
                        Question {currentIndex + 1} of {questionTotals.unique}
                        {questionTotals.repeats > 0
                            ? ` +${questionTotals.repeats}`
                            : ''}
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
                <Card sx={studyCardSx(isReview ? 'warning' : undefined)}>
                    <CardContent sx={studyCardContentSx}>
                        <Stack spacing={2}>
                            {currentPerformance && (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Chip
                                        size="small"
                                        icon={<CheckCircle size={14} />}
                                        label={currentPerformance.correctCount}
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
                                    {displayOptions.map((option, index) => {
                                        const isSelected =
                                            selectedOptions.includes(index);
                                        const isCorrectOption =
                                            correctDisplayIndexes.includes(
                                                index
                                            );
                                        const isIncorrectSelection =
                                            showAnswer &&
                                            isSelected &&
                                            !isCorrectOption;
                                        const isCorrectSelection =
                                            showAnswer && isCorrectOption;
                                        const correctness = isCorrectSelection
                                            ? 'correct'
                                            : isIncorrectSelection
                                              ? 'incorrect'
                                              : 'none';
                                        const showLetter =
                                            showAnswer ||
                                            !studySettings.hideOptionLabels;
                                        return (
                                            <AnswerOptionButton
                                                key={
                                                    optionOrder[index] ?? index
                                                }
                                                letter={
                                                    showLetter
                                                        ? indexToLetter(index)
                                                        : undefined
                                                }
                                                selected={isSelected}
                                                struck={struckOptions.includes(
                                                    index
                                                )}
                                                disabled={showAnswer}
                                                correctness={correctness}
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
                                        );
                                    })}
                                </Stack>
                            </Stack>
                            {showAnswer && (
                                <>
                                    <Divider />
                                    <Stack spacing={1}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{ alignItems: 'center' }}
                                        >
                                            <CheckCircle size={18} />
                                            <Typography variant="subtitle1">
                                                Explanation
                                            </Typography>
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                alignItems: 'center',
                                                minWidth: 0,
                                            }}
                                        >
                                            <FormattedText
                                                text={`Correct Answer: ${correctAnswerLabels}`}
                                                variant="body1"
                                                component="div"
                                                sx={{ fontWeight: 700 }}
                                            />
                                            <ReportQuestionIssueButton
                                                bankKey={bankKey}
                                                question={currentQuestion}
                                            />
                                        </Stack>
                                        {(hasExplanation(
                                            currentQuestion.explanation
                                        ) ||
                                            !!currentQuestion.explanationLinks
                                                ?.length) && (
                                            <Box
                                                sx={{
                                                    bgcolor: 'primary.light',
                                                    p: 2,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Stack spacing={1.5}>
                                                    {hasExplanation(
                                                        currentQuestion.explanation
                                                    ) && (
                                                        <FormattedText
                                                            text={
                                                                explanationText
                                                            }
                                                            variant="body2"
                                                        />
                                                    )}
                                                    {currentQuestion
                                                        .explanationLinks
                                                        ?.length ? (
                                                        <ExplanationLinks
                                                            links={
                                                                currentQuestion.explanationLinks
                                                            }
                                                        />
                                                    ) : null}
                                                </Stack>
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
                                                                : `Incorrect. The correct answer was ${correctAnswerLabels}.`
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
                                        disabled={!isReadyToReveal}
                                        startIcon={
                                            isReadyToReveal ? (
                                                <Eye size={16} />
                                            ) : undefined
                                        }
                                    >
                                        {revealLabel}
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
