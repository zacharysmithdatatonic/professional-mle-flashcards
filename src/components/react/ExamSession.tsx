import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';
import { ArrowLeft, ClipboardCheck, X } from 'lucide-react';
import type {
    Question,
    QuestionBank,
    QuestionPerformance,
} from '../../lib/banks';
import { loadQuestionsFromJSON } from '../../lib/questionParser';
import {
    createInitialPerformance,
    loadPerformanceFromStorage,
    savePerformanceToStorage,
} from '../../lib/performance';
import {
    applyExamResultsToPerformance,
    clearExamSession,
    createExamOptionOrders,
    formatDurationMinutes,
    getCorrectOriginalIndexes,
    getExamPlan,
    gradeExam,
    loadExamSession,
    reconstructExamQuestions,
    saveExamSession,
    selectExamQuestions,
    type ExamPhase,
    type PersistedExamSession,
} from '../../lib/exam';
import { ReactProviders } from './ReactProviders';
import { ExamMode } from './ExamMode';
import { ExamFlagReview } from './ExamFlagReview';
import { ExamResults } from './ExamResults';
import { ConfirmModal } from './ConfirmModal';

interface ExamSessionProps {
    bank: QuestionBank;
    dataset: string;
    bankBasePath: string;
}

function toggleNumberInList(list: number[], value: number): number[] {
    return list.includes(value)
        ? list.filter(item => item !== value)
        : [...list, value];
}

function ExamSessionContent({ bank, dataset, bankBasePath }: ExamSessionProps) {
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [performance, setPerformance] = useState<
        Map<string, QuestionPerformance>
    >(new Map());
    const [phase, setPhase] = useState<ExamPhase>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [optionOrders, setOptionOrders] = useState<Record<string, number[]>>(
        {}
    );
    const [selections, setSelections] = useState<Record<string, number[]>>({});
    const [strikes, setStrikes] = useState<Record<string, number[]>>({});
    const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
    const [deadline, setDeadline] = useState<number | null>(null);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [locked, setLocked] = useState(false);
    const [scored, setScored] = useState(false);
    const [remainingMs, setRemainingMs] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    const lockedRef = useRef(false);
    const scoredRef = useRef(false);
    const allowLeaveRef = useRef(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [exitSlot, setExitSlot] = useState<Element | null>(null);

    const currentQuestion = questions[currentIndex];
    const plan = useMemo(
        () => getExamPlan(bank.exam, allQuestions.length),
        [bank.exam, allQuestions.length]
    );

    const persistable = useMemo((): PersistedExamSession | null => {
        if (phase === 'intro' || !deadline) {
            return null;
        }
        return {
            version: 1,
            phase,
            questionIds: questions.map(question => question.id),
            optionOrders,
            selections,
            strikes,
            flaggedIds: Array.from(flaggedIds),
            currentIndex,
            deadline,
            durationMinutes,
            locked,
            scored,
        };
    }, [
        phase,
        questions,
        optionOrders,
        selections,
        strikes,
        flaggedIds,
        currentIndex,
        deadline,
        durationMinutes,
        locked,
        scored,
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const parsedQuestions = await loadQuestionsFromJSON(
                    dataset,
                    bank.key
                );
                setAllQuestions(parsedQuestions);

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

                const saved = loadExamSession(bank.key);
                if (saved) {
                    const restored = reconstructExamQuestions(
                        parsedQuestions,
                        saved.questionIds
                    );
                    if (restored && restored.length > 0) {
                        setQuestions(restored);
                        setOptionOrders(saved.optionOrders);
                        setSelections(saved.selections);
                        setStrikes(saved.strikes);
                        setFlaggedIds(new Set(saved.flaggedIds));
                        setCurrentIndex(
                            Math.min(saved.currentIndex, restored.length - 1)
                        );
                        setDeadline(saved.deadline);
                        setDurationMinutes(saved.durationMinutes);
                        setLocked(saved.locked);
                        setScored(saved.scored);
                        lockedRef.current = saved.locked;
                        scoredRef.current = saved.scored;

                        const timeUp = Date.now() >= saved.deadline;
                        if (saved.phase === 'results' || saved.scored) {
                            setPhase('results');
                        } else if (timeUp || saved.locked) {
                            setLocked(true);
                            lockedRef.current = true;
                            setRemainingMs(0);
                            setPhase('flag-review');
                        } else {
                            setPhase(saved.phase);
                            setRemainingMs(
                                Math.max(0, saved.deadline - Date.now())
                            );
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading exam session:', error);
            } finally {
                setIsLoading(false);
                setHasInitialized(true);
            }
        };

        loadData();
    }, [bank.key, dataset]);

    useEffect(() => {
        if (!hasInitialized) {
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [phase, currentIndex, hasInitialized]);

    useEffect(() => {
        if (!hasInitialized || !persistable) {
            return;
        }
        saveExamSession(bank.key, persistable);
    }, [bank.key, hasInitialized, persistable]);

    useEffect(() => {
        if (performance.size > 0) {
            savePerformanceToStorage(performance, bank.key);
        }
    }, [performance, bank.key]);

    const writeResults = useCallback(() => {
        if (scoredRef.current) {
            return;
        }
        const grade = gradeExam(questions, selections);
        const updated = applyExamResultsToPerformance(performance, grade);
        setPerformance(updated);
        scoredRef.current = true;
        setScored(true);
    }, [questions, selections, performance]);

    useEffect(() => {
        if (phase === 'results' && questions.length > 0 && !scoredRef.current) {
            writeResults();
        }
    }, [phase, questions.length, writeResults]);

    const goToResults = useCallback(() => {
        writeResults();
        setPhase('results');
    }, [writeResults]);

    const handleTimeout = useCallback(() => {
        if (lockedRef.current) {
            return;
        }
        lockedRef.current = true;
        setLocked(true);
        setRemainingMs(0);
        setPhase('flag-review');
    }, []);

    useEffect(() => {
        if (phase !== 'taking' && phase !== 'flag-review') {
            return;
        }
        if (!deadline || locked) {
            return;
        }

        const tick = () => {
            const remaining = deadline - Date.now();
            setRemainingMs(Math.max(0, remaining));
            if (remaining <= 0) {
                handleTimeout();
            }
        };

        tick();
        const id = window.setInterval(tick, 250);
        return () => window.clearInterval(id);
    }, [phase, deadline, locked, handleTimeout]);

    useEffect(() => {
        setExitSlot(document.querySelector('[data-exam-exit]'));
    }, []);

    useEffect(() => {
        if (phase !== 'taking' && phase !== 'flag-review') {
            return;
        }
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (allowLeaveRef.current) {
                return;
            }
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [phase]);

    const handleStart = useCallback(() => {
        clearExamSession(bank.key);
        const selected = selectExamQuestions(allQuestions, plan.questionCount);
        const orders = createExamOptionOrders(selected);
        const nextDeadline = Date.now() + plan.durationMinutes * 60_000;
        lockedRef.current = false;
        scoredRef.current = false;
        setQuestions(selected);
        setOptionOrders(orders);
        setSelections({});
        setStrikes({});
        setFlaggedIds(new Set());
        setCurrentIndex(0);
        setDurationMinutes(plan.durationMinutes);
        setDeadline(nextDeadline);
        setRemainingMs(plan.durationMinutes * 60_000);
        setLocked(false);
        setScored(false);
        setPhase('taking');
    }, [allQuestions, bank.key, plan]);

    const handleSelectOriginal = useCallback(
        (originalIndex: number) => {
            if (!currentQuestion || lockedRef.current) {
                return;
            }
            const requiredCount = Math.max(
                getCorrectOriginalIndexes(currentQuestion).length,
                1
            );
            const isMultiAnswer = requiredCount > 1;
            const id = currentQuestion.id;
            setSelections(prev => {
                const current = prev[id] ?? [];
                if (isMultiAnswer) {
                    if (current.includes(originalIndex)) {
                        return {
                            ...prev,
                            [id]: current.filter(
                                item => item !== originalIndex
                            ),
                        };
                    }
                    if (current.length >= requiredCount) {
                        return prev;
                    }
                    return { ...prev, [id]: [...current, originalIndex] };
                }
                return { ...prev, [id]: [originalIndex] };
            });
        },
        [currentQuestion]
    );

    const handleUnstrikeAndSelectOriginal = useCallback(
        (originalIndex: number) => {
            if (!currentQuestion || lockedRef.current) {
                return;
            }
            const requiredCount = Math.max(
                getCorrectOriginalIndexes(currentQuestion).length,
                1
            );
            const isMultiAnswer = requiredCount > 1;
            const id = currentQuestion.id;
            setStrikes(prev => ({
                ...prev,
                [id]: (prev[id] ?? []).filter(item => item !== originalIndex),
            }));
            setSelections(prev => {
                const current = prev[id] ?? [];
                if (current.includes(originalIndex)) {
                    return prev;
                }
                if (isMultiAnswer) {
                    if (current.length >= requiredCount) {
                        return prev;
                    }
                    return { ...prev, [id]: [...current, originalIndex] };
                }
                return { ...prev, [id]: [originalIndex] };
            });
        },
        [currentQuestion]
    );

    const handleToggleStrikeOriginal = useCallback(
        (originalIndex: number) => {
            if (!currentQuestion || lockedRef.current) {
                return;
            }
            const id = currentQuestion.id;
            if ((selections[id] ?? []).includes(originalIndex)) {
                return;
            }
            setStrikes(prev => ({
                ...prev,
                [id]: toggleNumberInList(prev[id] ?? [], originalIndex),
            }));
        },
        [currentQuestion, selections]
    );

    const handleToggleFlag = useCallback(() => {
        if (!currentQuestion || lockedRef.current) {
            return;
        }
        const id = currentQuestion.id;
        setFlaggedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, [currentQuestion]);

    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return;
        }
        setPhase('flag-review');
    }, [currentIndex, questions.length]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleSkipToEnd = useCallback(() => {
        if (lockedRef.current) {
            return;
        }
        setPhase('flag-review');
    }, []);

    const handleJumpToQuestion = useCallback((index: number) => {
        if (lockedRef.current) {
            return;
        }
        setCurrentIndex(index);
        setPhase('taking');
    }, []);

    const handleReturnFromReview = useCallback(() => {
        if (lockedRef.current) {
            return;
        }
        setCurrentIndex(Math.max(questions.length - 1, 0));
        setPhase('taking');
    }, [questions.length]);

    const leaveExam = useCallback(() => {
        allowLeaveRef.current = true;
        clearExamSession(bank.key);
        window.location.href = bankBasePath;
    }, [bank.key, bankBasePath]);

    const requestLeave = useCallback(() => {
        if (phase === 'taking' || phase === 'flag-review') {
            setLeaveOpen(true);
            return;
        }
        leaveExam();
    }, [phase, leaveExam]);

    const handleSubmitFromFlags = useCallback(() => {
        goToResults();
    }, [goToResults]);

    const grade = useMemo(
        () => (phase === 'results' ? gradeExam(questions, selections) : null),
        [phase, questions, selections]
    );

    let content: React.ReactNode;
    if (isLoading) {
        content = (
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
    } else if (allQuestions.length === 0) {
        content = (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
                No questions available for this certification.
            </Typography>
        );
    } else if (phase === 'intro') {
        content = (
            <Box sx={{ maxWidth: 560, mx: 'auto', px: 2 }}>
                <Card>
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'center' }}>
                            <ClipboardCheck size={40} />
                            <Typography variant="h5">Exam Mode</Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ textAlign: 'center' }}
                            >
                                {plan.questionCount} question
                                {plan.questionCount === 1 ? '' : 's'} ·{' '}
                                {formatDurationMinutes(plan.durationMinutes)}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: 'center' }}
                            >
                                Answers are not scored until the end. You can
                                flag questions to review before submitting.
                                Right-click an option to strike it out.
                            </Typography>
                            <Button variant="contained" onClick={handleStart}>
                                Start Exam
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    } else if (phase === 'flag-review') {
        content = (
            <ExamFlagReview
                questionCount={questions.length}
                flaggedIds={flaggedIds}
                questionIds={questions.map(question => question.id)}
                locked={locked}
                remainingMs={remainingMs}
                onPrevious={handleReturnFromReview}
                onJumpToQuestion={handleJumpToQuestion}
                onSubmit={handleSubmitFromFlags}
            />
        );
    } else if (phase === 'results' && grade) {
        content = (
            <ExamResults
                grade={grade}
                optionOrders={optionOrders}
                strikes={strikes}
                bankKey={bank.key}
            />
        );
    } else {
        content = (
            <ExamMode
                questions={questions}
                currentIndex={currentIndex}
                optionOrder={
                    currentQuestion
                        ? (optionOrders[currentQuestion.id] ??
                          currentQuestion.options.map((_, index) => index))
                        : []
                }
                selectedOriginal={
                    currentQuestion
                        ? (selections[currentQuestion.id] ?? [])
                        : []
                }
                struckOriginal={
                    currentQuestion ? (strikes[currentQuestion.id] ?? []) : []
                }
                flagged={
                    currentQuestion ? flaggedIds.has(currentQuestion.id) : false
                }
                remainingMs={remainingMs}
                onSelectOriginal={handleSelectOriginal}
                onUnstrikeAndSelectOriginal={handleUnstrikeAndSelectOriginal}
                onToggleStrikeOriginal={handleToggleStrikeOriginal}
                onToggleFlag={handleToggleFlag}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSkipToEnd={handleSkipToEnd}
            />
        );
    }

    return (
        <>
            {exitSlot
                ? createPortal(
                      <IconButton
                          aria-label={
                              phase === 'results'
                                  ? 'Back to menu'
                                  : 'Leave exam'
                          }
                          title={
                              phase === 'results'
                                  ? 'Back to menu'
                                  : 'Leave exam'
                          }
                          onClick={requestLeave}
                          sx={{
                              width: '1.75rem',
                              height: '1.75rem',
                              p: 0,
                              color: 'inherit',
                          }}
                      >
                          {phase === 'results' ? (
                              <ArrowLeft size={18} strokeWidth={1.5} />
                          ) : (
                              <X size={18} strokeWidth={1.5} />
                          )}
                      </IconButton>,
                      exitSlot
                  )
                : null}
            <ConfirmModal
                open={leaveOpen}
                title="Leave exam?"
                message="Your progress in this attempt will be lost."
                confirmText="Leave exam"
                cancelText="Cancel"
                destructive
                onConfirm={leaveExam}
                onCancel={() => setLeaveOpen(false)}
            />
            {content}
        </>
    );
}

export function ExamSession(props: ExamSessionProps) {
    return (
        <ReactProviders>
            <Box sx={{ flex: 1 }}>
                <Container
                    sx={{ flex: 1, py: 4, maxWidth: 1000 }}
                    maxWidth={false}
                >
                    <ExamSessionContent {...props} />
                </Container>
            </Box>
        </ReactProviders>
    );
}
