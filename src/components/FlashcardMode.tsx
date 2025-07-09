import React, { useState } from 'react';
import { Question, QuestionPerformance } from '../types';
import {
    CheckCircle,
    XCircle,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Eye,
    RotateCcw,
    HelpCircle,
    BookOpen,
} from 'lucide-react';
import { formatText } from '../utils/textFormatting';

interface FlashcardModeProps {
    questions: Question[];
    currentIndex: number;
    onAnswer: (isCorrect: boolean) => void;
    onNext: () => void;
    onPrevious: () => void;
    performance: Map<string, QuestionPerformance>;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
    questions,
    currentIndex,
    onAnswer,
    onNext,
    onPrevious,
    performance,
}) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);

    const currentQuestion = questions[currentIndex];
    const currentPerformance = performance.get(currentQuestion?.id);

    const handleRevealAnswer = () => {
        setShowAnswer(true);
    };

    const handleAnswerResponse = (isCorrect: boolean) => {
        setHasAnswered(true);
        onAnswer(isCorrect);
    };

    const handleNext = () => {
        setShowAnswer(false);
        setHasAnswered(false);
        onNext();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevious = () => {
        setShowAnswer(false);
        setHasAnswered(false);
        onPrevious();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!currentQuestion) {
        return (
            <div className="flashcard-container">
                <div className="completion-message">
                    <CheckCircle
                        size={48}
                        style={{ color: 'var(--success-color)' }}
                    />
                    <h2>Great job! You've completed all flashcards!</h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                    >
                        <RotateCcw size={16} />
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flashcard-container">
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    }}
                />
            </div>

            <div className="question-header">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="nav-arrow"
                    title="Previous question"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="question-info">
                    <BookOpen size={16} />
                    <span className="question-counter">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    className="nav-arrow"
                    title="Next question"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="flashcard">
                <div className="flashcard-front">
                    <div className="question-header-card">
                        <h3>
                            <HelpCircle size={18} />
                            Question
                        </h3>
                        {currentPerformance && (
                            <div className="question-performance">
                                <span className="correct-count">
                                    <CheckCircle size={14} />
                                    {currentPerformance.correctCount}
                                </span>
                                <span className="incorrect-count">
                                    <XCircle size={14} />
                                    {currentPerformance.incorrectCount}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="question-text">
                        {formatText(currentQuestion.question)}
                    </p>
                </div>

                {showAnswer && (
                    <div className="flashcard-back">
                        <h3>
                            <CheckCircle size={18} />
                            Answer
                        </h3>
                        <p className="answer-text">
                            <strong>
                                Correct Answer:{' '}
                                {formatText(currentQuestion.answer)}
                            </strong>
                        </p>
                        <div className="explanation">
                            <p>{formatText(currentQuestion.explanation)}</p>
                        </div>
                    </div>
                )}

                <div className="flashcard-actions">
                    {!showAnswer ? (
                        <button
                            onClick={handleRevealAnswer}
                            className="btn btn-primary"
                        >
                            <Eye size={16} />
                            Reveal Answer
                        </button>
                    ) : !hasAnswered ? (
                        <div className="answer-feedback">
                            <p>Did you get this question right?</p>
                            <div className="feedback-buttons">
                                <button
                                    onClick={() => handleAnswerResponse(false)}
                                    className="btn btn-incorrect"
                                >
                                    <XCircle size={20} />
                                    Incorrect
                                </button>
                                <button
                                    onClick={() => handleAnswerResponse(true)}
                                    className="btn btn-correct"
                                >
                                    <CheckCircle size={20} />
                                    Correct
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="btn btn-primary"
                        >
                            <ArrowRight size={20} />
                            Next Question
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
