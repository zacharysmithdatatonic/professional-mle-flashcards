import { Question, QuestionPerformance } from '../types';

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
    performance: Map<string, QuestionPerformance>
) => {
    const stats = {
        totalQuestions: performance.size,
        totalAnswered: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        accuracy: 0,
        needsReview: 0,
    };

    performance.forEach(perf => {
        if (perf.lastAnswered) {
            stats.totalAnswered++;
        }
        stats.totalCorrect += perf.correctCount;
        stats.totalIncorrect += perf.incorrectCount;

        if (perf.lastCorrect === false || perf.lastCorrect === null) {
            stats.needsReview++;
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

export const shuffleQuestions = (questions: Question[]): Question[] => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
        let stored = localStorage.getItem(key);
        // Backwards compatibility: if per-bank key not found, fall back to global key
        if (!stored && bankKey) {
            stored = localStorage.getItem('flashcard-performance');
        }
        if (!stored) return new Map();

        const parsed = JSON.parse(stored);
        const performance = new Map<string, QuestionPerformance>();

        parsed.forEach(([id, perf]: [string, any]) => {
            performance.set(id, {
                ...perf,
                lastAnswered: perf.lastAnswered
                    ? new Date(perf.lastAnswered)
                    : null,
            });
        });

        return performance;
    } catch (error) {
        console.error('Error loading performance from storage:', error);
        return new Map();
    }
};
