export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface QuestionPerformance {
    questionId: string;
    correctCount: number;
    incorrectCount: number;
    lastAnswered: Date | null;
    lastCorrect: boolean | null;
    scheduledNext: number | null; // For spaced repetition
}

export type StudyMode = 'flashcard' | 'quiz' | 'review' | 'memorise';

export interface AppState {
    questions: Question[];
    performance: Map<string, QuestionPerformance>;
    currentMode: StudyMode;
    currentQuestions: Question[];
    currentIndex: number;
    showAnswer: boolean;
    isLoading: boolean;
}

export interface StudySession {
    mode: StudyMode;
    questions: Question[];
    currentIndex: number;
    completed: boolean;
}
