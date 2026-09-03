import type { ExamSpec, Question, QuestionPerformance } from './banks';
import { identityOrder } from './optionLetters';
import {
    createInitialPerformance,
    shuffleQuestions,
    updatePerformance,
} from './performance';

export type ExamPhase = 'intro' | 'taking' | 'flag-review' | 'results';

export interface ExamPlan {
    questionCount: number;
    durationMinutes: number;
}

export interface ExamQuestionResult {
    question: Question;
    questionNumber: number;
    selectedOriginal: number[];
    correctOriginal: number[];
    isCorrect: boolean;
    isUnanswered: boolean;
}

export interface ExamGrade {
    correctCount: number;
    totalCount: number;
    percent: number;
    results: ExamQuestionResult[];
}

export interface PersistedExamSession {
    version: 1;
    phase: Exclude<ExamPhase, 'intro'>;
    questionIds: string[];
    optionOrders: Record<string, number[]>;
    selections: Record<string, number[]>;
    strikes: Record<string, number[]>;
    flaggedIds: string[];
    currentIndex: number;
    deadline: number;
    durationMinutes: number;
    locked: boolean;
    scored: boolean;
}

const storageKey = (bankKey: string) => `exam-session-${bankKey}`;

export const getCorrectOriginalIndexes = (question: Question): number[] =>
    (question.answer ?? [])
        .map(letter => {
            const normalized = letter.trim().toUpperCase();
            if (!/^[A-Z]$/.test(normalized)) {
                return undefined;
            }
            return normalized.charCodeAt(0) - 'A'.charCodeAt(0);
        })
        .filter((index): index is number => index !== undefined);

export const isSelectionCorrect = (
    selectedOriginal: number[],
    correctOriginal: number[]
): boolean => {
    if (selectedOriginal.length !== correctOriginal.length) {
        return false;
    }
    return selectedOriginal.every(index => correctOriginal.includes(index));
};

export const getExamPlan = (exam: ExamSpec, bankSize: number): ExamPlan => {
    if (bankSize <= 0) {
        return { questionCount: 0, durationMinutes: 1 };
    }
    if (bankSize > exam.questionCountMax) {
        return {
            questionCount: exam.questionCountMax,
            durationMinutes: exam.durationMinutes,
        };
    }
    if (bankSize >= exam.questionCountMin) {
        return {
            questionCount: bankSize,
            durationMinutes: exam.durationMinutes,
        };
    }
    return {
        questionCount: bankSize,
        durationMinutes: Math.max(
            1,
            Math.round(
                (exam.durationMinutes * bankSize) / exam.questionCountMin
            )
        ),
    };
};

export const selectExamQuestions = (
    questions: Question[],
    count: number
): Question[] => shuffleQuestions(questions).slice(0, count);

/**
 * Exam mode presents options in the authored order to mirror the real exam;
 * the map is still kept so persisted attempts can be graded and reviewed
 * against whatever order they were taken in.
 */
export const createExamOptionOrders = (
    questions: Question[]
): Record<string, number[]> => {
    const orders: Record<string, number[]> = {};
    questions.forEach(question => {
        orders[question.id] = identityOrder(question.options.length);
    });
    return orders;
};

export const gradeExam = (
    questions: Question[],
    selections: Record<string, number[]>
): ExamGrade => {
    const results = questions.map((question, index) => {
        const selectedOriginal = selections[question.id] ?? [];
        const correctOriginal = getCorrectOriginalIndexes(question);
        const isUnanswered = selectedOriginal.length === 0;
        const isCorrect =
            !isUnanswered &&
            isSelectionCorrect(selectedOriginal, correctOriginal);
        return {
            question,
            questionNumber: index + 1,
            selectedOriginal,
            correctOriginal,
            isCorrect,
            isUnanswered,
        };
    });
    const correctCount = results.filter(result => result.isCorrect).length;
    const totalCount = questions.length;
    return {
        correctCount,
        totalCount,
        percent: totalCount === 0 ? 0 : (correctCount / totalCount) * 100,
        results,
    };
};

export const applyExamResultsToPerformance = (
    performance: Map<string, QuestionPerformance>,
    grade: ExamGrade
): Map<string, QuestionPerformance> => {
    const next = new Map(performance);
    grade.results.forEach((result, index) => {
        const current =
            next.get(result.question.id) ||
            createInitialPerformance(result.question.id);
        next.set(
            result.question.id,
            updatePerformance(current, result.isCorrect, index)
        );
    });
    return next;
};

export const formatRemainingTime = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const formatDurationMinutes = (minutes: number): string => {
    if (minutes === 1) {
        return '1 minute';
    }
    if (minutes < 60) {
        return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (remainder === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    const hourLabel = hours === 1 ? '1 hour' : `${hours} hours`;
    return `${hourLabel} ${remainder} minute${remainder === 1 ? '' : 's'}`;
};

export const loadExamSession = (
    bankKey: string
): PersistedExamSession | null => {
    if (typeof sessionStorage === 'undefined') {
        return null;
    }
    try {
        const stored = sessionStorage.getItem(storageKey(bankKey));
        if (!stored) {
            return null;
        }
        const parsed = JSON.parse(stored) as PersistedExamSession;
        if (parsed.version !== 1 || !Array.isArray(parsed.questionIds)) {
            return null;
        }
        return parsed;
    } catch (error) {
        console.error('Error loading exam session:', error);
        return null;
    }
};

export const saveExamSession = (
    bankKey: string,
    session: PersistedExamSession
) => {
    if (typeof sessionStorage === 'undefined') {
        return;
    }
    sessionStorage.setItem(storageKey(bankKey), JSON.stringify(session));
};

export const clearExamSession = (bankKey: string) => {
    if (typeof sessionStorage === 'undefined') {
        return;
    }
    sessionStorage.removeItem(storageKey(bankKey));
};

export const reconstructExamQuestions = (
    allQuestions: Question[],
    questionIds: string[]
): Question[] | null => {
    const byId = new Map(allQuestions.map(question => [question.id, question]));
    const reconstructed: Question[] = [];
    for (const id of questionIds) {
        const question = byId.get(id);
        if (!question) {
            return null;
        }
        reconstructed.push(question);
    }
    return reconstructed;
};

export const getOptionIndexFromKey = (
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

export const hasExplanation = (explanation: string): boolean =>
    explanation.trim().replace(/\n/g, '').length > 0;
