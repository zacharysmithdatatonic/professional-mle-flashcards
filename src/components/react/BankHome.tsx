import React, { useEffect, useState } from 'react';
import { Container, LinearProgress, Stack, Typography } from '@mui/material';
import type {
    Question,
    QuestionPerformance,
    QuestionBank,
} from '../../lib/banks';
import { loadQuestionsFromJSON } from '../../lib/questionParser';
import {
    createInitialPerformance,
    getPerformanceStats,
    getQuestionsForReview,
    loadPerformanceFromStorage,
} from '../../lib/performance';
import { ReactProviders } from './ReactProviders';
import { ModePickerCards } from './ModePicker';

interface BankHomeProps {
    bank: QuestionBank;
}

function BankHomeContent({ bank }: BankHomeProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [performance, setPerformance] = useState<
        Map<string, QuestionPerformance>
    >(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const parsedQuestions = await loadQuestionsFromJSON(
                    bank.dataset!,
                    bank.key
                );
                setQuestions(parsedQuestions);

                const savedPerformance = loadPerformanceFromStorage(bank.key);
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
            } catch (error) {
                console.error('Error loading bank home data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [bank]);

    const stats = getPerformanceStats(performance, questions);
    const reviewQuestionCount = getQuestionsForReview(
        questions,
        performance
    ).length;
    const progressPercent =
        questions.length > 0
            ? (stats.totalAnswered / questions.length) * 100
            : 0;

    return (
        <Container sx={{ flex: 1, py: 4, maxWidth: 1000 }} maxWidth={false}>
            <Stack spacing={4}>
                {isLoading ? (
                    <Stack spacing={2} sx={{ alignItems: 'center', py: 2 }}>
                        <LinearProgress sx={{ width: 200 }} />
                        <Typography variant="body2" color="text.secondary">
                            Loading progress...
                        </Typography>
                    </Stack>
                ) : (
                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                gap: 2,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Typography variant="subtitle2">
                                Progress
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stats.totalAnswered} of {questions.length}{' '}
                                answered · {stats.accuracy.toFixed(0)}% accuracy
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercent}
                            sx={{
                                height: 8,
                                borderRadius: 999,
                                bgcolor: 'divider',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 999,
                                },
                            }}
                        />
                    </Stack>
                )}

                <ModePickerCards
                    bank={bank}
                    reviewQuestionCount={reviewQuestionCount}
                />
            </Stack>
        </Container>
    );
}

export function BankHome(props: BankHomeProps) {
    return (
        <ReactProviders>
            <BankHomeContent {...props} />
        </ReactProviders>
    );
}
