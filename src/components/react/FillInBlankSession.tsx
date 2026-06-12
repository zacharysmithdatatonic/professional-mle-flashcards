import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Container,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';
import type { Question, QuestionPerformance } from '../../lib/banks';
import { loadQuestionsFromJSON } from '../../lib/questionParser';
import {
    createInitialPerformance,
    loadPerformanceFromStorage,
    savePerformanceToStorage,
    updatePerformance,
    weightedShuffle,
} from '../../lib/performance';
import {
    getIndexFromURL,
    getQuestionIdFromURL,
    resolveStartIndex,
    syncSessionToURL,
} from '../../lib/sessionUrl';
import { ReactProviders } from './ReactProviders';
import { FillInTheBlankMode } from './FillInTheBlankMode';

interface FillInBlankSessionProps {
    bankKey: string;
    dataset: string;
}

function FillInBlankSessionContent({
    bankKey,
    dataset,
}: FillInBlankSessionProps) {
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [performance, setPerformance] = useState<
        Map<string, QuestionPerformance>
    >(new Map());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const parsedQuestions = await loadQuestionsFromJSON(
                    dataset,
                    bankKey
                );

                const savedPerformance = loadPerformanceFromStorage(bankKey);
                const updatedPerformance = new Map(savedPerformance);
                parsedQuestions.forEach((question: Question) => {
                    if (!updatedPerformance.has(question.id)) {
                        updatedPerformance.set(
                            question.id,
                            createInitialPerformance(question.id)
                        );
                    }
                });
                setPerformance(updatedPerformance);

                const shuffled = weightedShuffle(
                    parsedQuestions,
                    updatedPerformance
                );
                setCurrentQuestions(shuffled);
                setCurrentIndex(
                    resolveStartIndex(
                        shuffled,
                        getQuestionIdFromURL(),
                        getIndexFromURL()
                    )
                );
            } catch (error) {
                console.error('Error loading fill-in-blank session:', error);
            } finally {
                setIsLoading(false);
                setHasInitialized(true);
            }
        };

        loadData();
    }, [bankKey, dataset]);

    useEffect(() => {
        if (!hasInitialized) return;
        const currentQuestionId = currentQuestions[currentIndex]?.id ?? null;
        syncSessionToURL(currentIndex, currentQuestionId);
    }, [currentIndex, currentQuestions, hasInitialized]);

    useEffect(() => {
        if (performance.size > 0) {
            savePerformanceToStorage(performance, bankKey);
        }
    }, [performance, bankKey]);

    const handleAnswer = useCallback(
        (isCorrect: boolean) => {
            const currentQuestion = currentQuestions[currentIndex];
            if (!currentQuestion) return;

            const currentPerf =
                performance.get(currentQuestion.id) ||
                createInitialPerformance(currentQuestion.id);
            const updatedPerf = updatePerformance(
                currentPerf,
                isCorrect,
                currentIndex
            );

            setPerformance(
                prev => new Map(prev.set(currentQuestion.id, updatedPerf))
            );

            if (!isCorrect && updatedPerf.scheduledNext !== null) {
                setCurrentQuestions(prev => {
                    const newQuestions = [...prev];
                    const insertIndex = Math.min(
                        updatedPerf.scheduledNext!,
                        newQuestions.length
                    );
                    newQuestions.splice(insertIndex, 0, currentQuestion);
                    return newQuestions;
                });
            }
        },
        [currentQuestions, currentIndex, performance]
    );

    const handleNext = useCallback(() => {
        if (currentIndex < currentQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            window.location.href = window.location.pathname.replace(
                /\/fill-in-blank\/?$/,
                '/'
            );
        }
    }, [currentIndex, currentQuestions.length]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    if (isLoading) {
        return (
            <Stack
                spacing={2}
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                }}
            >
                <LinearProgress sx={{ width: 200 }} />
                <Typography variant="body1">Loading questions...</Typography>
            </Stack>
        );
    }

    if (currentQuestions.length === 0) {
        return (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
                No questions available for this certification.
            </Typography>
        );
    }

    return (
        <Container sx={{ flex: 1, py: 4, maxWidth: 1000 }} maxWidth={false}>
            <FillInTheBlankMode
                questions={currentQuestions}
                currentIndex={currentIndex}
                onAnswer={handleAnswer}
                onNext={handleNext}
                onPrevious={handlePrevious}
                performance={performance}
            />
        </Container>
    );
}

export function FillInBlankSession(props: FillInBlankSessionProps) {
    return (
        <ReactProviders>
            <Box sx={{ flex: 1 }}>
                <FillInBlankSessionContent {...props} />
            </Box>
        </ReactProviders>
    );
}
