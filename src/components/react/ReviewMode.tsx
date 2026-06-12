import React from 'react';
import type { Question, QuestionPerformance } from '../../lib/banks';
import { QuizMode } from './QuizMode';

interface ReviewModeProps {
    questions: Question[];
    currentIndex: number;
    onAnswer: (isCorrect: boolean) => void;
    onNext: () => void;
    onPrevious: () => void;
    performance: Map<string, QuestionPerformance>;
}

export const ReviewMode: React.FC<ReviewModeProps> = props => (
    <QuizMode {...props} variant="review" />
);
