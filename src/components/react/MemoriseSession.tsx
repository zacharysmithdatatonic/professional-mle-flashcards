import React, { useEffect, useState } from 'react';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import type { Question, QuestionPerformance } from '../../lib/banks';
import { loadQuestionsFromJSON } from '../../lib/questionParser';
import {
    createInitialPerformance,
    loadPerformanceFromStorage,
    savePerformanceToStorage,
} from '../../lib/performance';
import { ReactProviders } from './ReactProviders';
import { MemoriseMode } from './MemoriseMode';

interface MemoriseSessionProps {
    bankKey: string;
    dataset: string;
}

function MemoriseSessionContent({ bankKey, dataset }: MemoriseSessionProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [performance, setPerformance] = useState<
        Map<string, QuestionPerformance>
    >(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const parsedQuestions = await loadQuestionsFromJSON(
                    dataset,
                    bankKey
                );
                setQuestions(parsedQuestions);

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
            } catch (error) {
                console.error('Error loading memorise session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [bankKey, dataset]);

    useEffect(() => {
        if (performance.size > 0) {
            savePerformanceToStorage(performance, bankKey);
        }
    }, [performance, bankKey]);

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

    return (
        <Box sx={{ flex: 1 }}>
            <MemoriseMode
                questions={questions}
                performance={performance}
                bankKey={bankKey}
            />
        </Box>
    );
}

export function MemoriseSession(props: MemoriseSessionProps) {
    return (
        <ReactProviders>
            <MemoriseSessionContent {...props} />
        </ReactProviders>
    );
}
