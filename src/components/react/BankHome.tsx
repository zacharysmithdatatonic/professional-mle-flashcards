import React, { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Container,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';
import { RotateCcw } from 'lucide-react';
import type {
    Question,
    QuestionPerformance,
    QuestionBank,
} from '../../lib/banks';
import { loadQuestionsFromJSON } from '../../lib/questionParser';
import {
    clearPerformanceFromStorage,
    createInitialPerformance,
    getPerformanceStats,
    getQuestionsForReview,
    loadPerformanceFromStorage,
} from '../../lib/performance';
import { ReactProviders } from './ReactProviders';
import { ModePickerCards } from './ModePicker';
import { ConfirmModal } from './ConfirmModal';

interface BankHomeProps {
    bank: QuestionBank;
}

function BankHomeContent({ bank }: BankHomeProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [performance, setPerformance] = useState<
        Map<string, QuestionPerformance>
    >(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [confirmResetOpen, setConfirmResetOpen] = useState(false);

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
    const hasProgress =
        stats.totalAnswered > 0 ||
        stats.totalCorrect > 0 ||
        stats.totalIncorrect > 0;

    const handleResetProgress = useCallback(() => {
        clearPerformanceFromStorage(bank.key);
        const resetPerformance = new Map<string, QuestionPerformance>();
        questions.forEach(question => {
            resetPerformance.set(
                question.id,
                createInitialPerformance(question.id)
            );
        });
        setPerformance(resetPerformance);
        setConfirmResetOpen(false);
    }, [bank.key, questions]);

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
                                alignItems: 'center',
                                gap: 2,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                            >
                                <Typography variant="subtitle2">
                                    Progress
                                </Typography>
                                <Button
                                    size="small"
                                    color="inherit"
                                    disabled={!hasProgress}
                                    onClick={() => setConfirmResetOpen(true)}
                                    startIcon={<RotateCcw size={14} />}
                                    sx={{
                                        color: 'text.secondary',
                                        minWidth: 0,
                                        px: 1,
                                        py: 0.25,
                                        fontSize: '0.75rem',
                                        fontWeight: 400,
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    Reset
                                </Button>
                            </Stack>
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

            <ConfirmModal
                open={confirmResetOpen}
                title="Reset progress?"
                message={`This will clear all saved answers and accuracy for ${bank.name}. This cannot be undone.`}
                confirmText="Reset progress"
                cancelText="Cancel"
                destructive
                onConfirm={handleResetProgress}
                onCancel={() => setConfirmResetOpen(false)}
            />
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
