import type { Question, QuestionPerformance } from './banks';

export const createInitialPerformance = (
    questionId: string
): QuestionPerformance => ({
    questionId,
    correctCount: 0,
    incorrectCount: 0,
    lastAnswered: null,
    lastCorrect: null,
    scheduledNext: null,
});

export const updatePerformance = (
    performance: QuestionPerformance,
    isCorrect: boolean,
    currentIndex: number
): QuestionPerformance => {
    const updated = {
        ...performance,
        lastAnswered: new Date(),
        lastCorrect: isCorrect,
    };

    if (isCorrect) {
        updated.correctCount++;
        updated.scheduledNext = null; // Remove from repeat scheduling
    } else {
        updated.incorrectCount++;
        // Schedule to reappear within 4-10 questions
        updated.scheduledNext =
            currentIndex + Math.floor(Math.random() * 7) + 4;
    }

    return updated;
};

export const getPerformanceStats = (
    performance: Map<string, QuestionPerformance>,
    questions: Question[]
) => {
    const currentQuestionIds = new Set(questions.map(q => q.id));
    const stats = {
        totalQuestions: questions.length,
        totalAnswered: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        accuracy: 0,
    };

    performance.forEach((perf, id) => {
        // Only include stats for questions in the current bank
        if (currentQuestionIds.has(id)) {
            if (perf.lastAnswered) {
                stats.totalAnswered++;
            }
            stats.totalCorrect += perf.correctCount;
            stats.totalIncorrect += perf.incorrectCount;
        }
    });

    if (stats.totalCorrect + stats.totalIncorrect > 0) {
        stats.accuracy =
            (stats.totalCorrect / (stats.totalCorrect + stats.totalIncorrect)) *
            100;
    }

    return stats;
};

export const getQuestionsForReview = (
    questions: Question[],
    performance: Map<string, QuestionPerformance>
): Question[] => {
    return questions.filter(q => {
        const perf = performance.get(q.id);
        return !perf || perf.lastCorrect === false || perf.lastCorrect === null;
    });
};

/**
 * Splits a session queue into the number of distinct questions and the number
 * of repeats, since answering incorrectly re-inserts a question into the queue.
 */
export const getQuestionTotals = (
    questions: Question[]
): { unique: number; repeats: number } => {
    const unique = new Set(questions.map(question => question.id)).size;
    return { unique, repeats: questions.length - unique };
};

export const shuffleQuestions = (questions: Question[]): Question[] => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/** Fisher–Yates permutation of 0..length-1 for reshuffling answer options. */
export const createShuffledOrder = (length: number): number[] => {
    const order = Array.from({ length }, (_, index) => index);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
};

export const weightedShuffle = (
    questions: Question[],
    performance: Map<string, QuestionPerformance>
): Question[] => {
    const correct: Question[] = [];
    const incorrect: Question[] = [];
    const unseen: Question[] = [];

    questions.forEach(q => {
        const perf = performance.get(q.id);
        if (!perf || perf.lastCorrect === null) {
            unseen.push(q);
        } else if (perf.lastCorrect === false) {
            incorrect.push(q);
        } else {
            correct.push(q);
        }
    });

    // Shuffle each category
    const shuffledIncorrect = shuffleQuestions(incorrect);
    const shuffledUnseen = shuffleQuestions(unseen);
    const shuffledCorrect = shuffleQuestions(correct);

    // Combine with weighted distribution
    // Incorrect and unseen questions are more likely to appear early
    const result: Question[] = [];

    // First third: mainly incorrect and unseen
    const firstThird = Math.floor(questions.length / 3);
    let incorrectIndex = 0;
    let unseenIndex = 0;
    let correctIndex = 0;

    for (let i = 0; i < firstThird; i++) {
        const rand = Math.random();
        if (rand < 0.5 && incorrectIndex < shuffledIncorrect.length) {
            result.push(shuffledIncorrect[incorrectIndex++]);
        } else if (rand < 0.8 && unseenIndex < shuffledUnseen.length) {
            result.push(shuffledUnseen[unseenIndex++]);
        } else if (correctIndex < shuffledCorrect.length) {
            result.push(shuffledCorrect[correctIndex++]);
        }
    }

    // Add remaining questions
    result.push(...shuffledIncorrect.slice(incorrectIndex));
    result.push(...shuffledUnseen.slice(unseenIndex));
    result.push(...shuffledCorrect.slice(correctIndex));

    return result;
};

export const savePerformanceToStorage = (
    performance: Map<string, QuestionPerformance>,
    bankKey?: string
) => {
    const serialized = Array.from(performance.entries()).map(([id, perf]) => [
        id,
        {
            ...perf,
            lastAnswered: perf.lastAnswered?.toISOString() || null,
        },
    ]);
    const key = bankKey
        ? `flashcard-performance-${bankKey}`
        : 'flashcard-performance';
    localStorage.setItem(key, JSON.stringify(serialized));
};

export const loadPerformanceFromStorage = (
    bankKey?: string
): Map<string, QuestionPerformance> => {
    try {
        const key = bankKey
            ? `flashcard-performance-${bankKey}`
            : 'flashcard-performance';
        const stored = localStorage.getItem(key);
        if (!stored) return new Map();

        const parsed = JSON.parse(stored);
        const performance = new Map<string, QuestionPerformance>();

        parsed.forEach(
            ([id, perf]: [
                string,
                Omit<QuestionPerformance, 'lastAnswered'> & {
                    lastAnswered: string | null;
                },
            ]) => {
                // Migrate old IDs (q-1, q-2) to new format (bankKey-q-1, bankKey-q-2)
                // if they don't already have the bank prefix
                let migratedId = id;
                if (
                    bankKey &&
                    id.startsWith('q-') &&
                    !id.startsWith(`${bankKey}-`)
                ) {
                    migratedId = `${bankKey}-${id}`;
                }

                performance.set(migratedId, {
                    ...perf,
                    questionId: migratedId, // Also update the questionId field
                    lastAnswered: perf.lastAnswered
                        ? new Date(perf.lastAnswered)
                        : null,
                });
            }
        );

        return performance;
    } catch (error) {
        console.error('Error loading performance from storage:', error);
        return new Map();
    }
};
