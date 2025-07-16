import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuestionPerformance } from '../types';
import {
    CheckCircle,
    XCircle,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trophy,
    RotateCcw,
    HelpCircle,
} from 'lucide-react';
import { formatText } from '../utils/textFormatting';

// Helper function to check if explanation has meaningful content
const hasExplanation = (explanation: string): boolean => {
    return explanation.trim().replace(/\n/g, '').length > 0;
};

interface QuizModeProps {
    questions: Question[];
    currentIndex: number;
    onAnswer: (isCorrect: boolean) => void;
    onNext: () => void;
    onPrevious: () => void;
    performance: Map<string, QuestionPerformance>;
}

export const QuizMode: React.FC<QuizModeProps> = ({
    questions,
    currentIndex,
    onAnswer,
    onNext,
    onPrevious,
    performance,
}) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const currentQuestion = questions[currentIndex];
    const currentPerformance = performance.get(currentQuestion?.id);

    const getCorrectOptionIndex = useCallback(() => {
        // Convert answer letter (A, B, C, D) to index (0, 1, 2, 3)
        const answerLetter = currentQuestion.answer.trim().toUpperCase();
        const letterToIndex: { [key: string]: number } = {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
        };

        return letterToIndex[answerLetter] !== undefined
            ? letterToIndex[answerLetter]
            : -1;
    }, [currentQuestion]);

    const handleOptionSelect = useCallback(
        (optionIndex: number) => {
            if (!showAnswer) {
                setSelectedOption(optionIndex);
            }
        },
        [showAnswer]
    );

    const handleRevealAnswer = useCallback(() => {
        setShowAnswer(true);

        // Automatically determine if the answer is correct
        const correctOptionIndex = getCorrectOptionIndex();
        const isCorrect = selectedOption === correctOptionIndex;

        // Automatically call onAnswer with the result
        onAnswer(isCorrect);
    }, [getCorrectOptionIndex, selectedOption, onAnswer]);

    const handleNext = useCallback(() => {
        setShowAnswer(false);
        setSelectedOption(null);
        onNext();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [onNext]);

    const handlePrevious = useCallback(() => {
        setShowAnswer(false);
        setSelectedOption(null);
        onPrevious();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [onPrevious]);

    // Add keyboard event listeners
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Prevent keyboard shortcuts when user is typing in an input
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    if (currentIndex > 0) {
                        handlePrevious();
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    if (currentIndex < questions.length - 1) {
                        handleNext();
                    }
                    break;
                case '1':
                case 'a':
                case 'A':
                    event.preventDefault();
                    if (!showAnswer) {
                        handleOptionSelect(0);
                    }
                    break;
                case '2':
                case 'b':
                case 'B':
                    event.preventDefault();
                    if (!showAnswer) {
                        handleOptionSelect(1);
                    }
                    break;
                case '3':
                case 'c':
                case 'C':
                    event.preventDefault();
                    if (!showAnswer) {
                        handleOptionSelect(2);
                    }
                    break;
                case '4':
                case 'd':
                case 'D':
                    event.preventDefault();
                    if (!showAnswer) {
                        handleOptionSelect(3);
                    }
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    if (!showAnswer && selectedOption !== null) {
                        handleRevealAnswer();
                    } else if (showAnswer) {
                        handleNext();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [
        currentIndex,
        questions.length,
        showAnswer,
        selectedOption,
        handleNext,
        handlePrevious,
        handleOptionSelect,
        handleRevealAnswer,
    ]);

    if (!currentQuestion) {
        return (
            <div className="quiz-container">
                <div className="completion-message">
                    <Trophy
                        size={48}
                        style={{ color: 'var(--success-color)' }}
                    />
                    <h2>Quiz Complete! Great job!</h2>
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

    const correctOptionIndex = getCorrectOptionIndex();
    const isCorrect = selectedOption === correctOptionIndex;

    return (
        <div className="quiz-container">
            <div className="mode-nav-bar navigation-controls">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="nav-arrow"
                    aria-label="Previous question"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="question-counter">
                    Question {currentIndex + 1} of {questions.length}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    className="nav-arrow"
                    aria-label="Next question"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    }}
                />
            </div>

            <div className="quiz-card">
                <div className="question-section">
                    <div className="question-header-card">
                        <h3 className="question-header-title">
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

                <div className="options-section">
                    <h4>Choose the correct answer:</h4>
                    <div className="options-grid">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                className={`option-button ${
                                    selectedOption === index ? 'selected' : ''
                                } ${
                                    showAnswer && index === correctOptionIndex
                                        ? 'correct'
                                        : ''
                                } ${
                                    showAnswer &&
                                    selectedOption === index &&
                                    index !== correctOptionIndex
                                        ? 'incorrect'
                                        : ''
                                }`}
                                disabled={showAnswer}
                                title={`Select option ${String.fromCharCode(65 + index)} (${index + 1})`}
                            >
                                <span className="option-letter">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="option-text">
                                    {formatText(option)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {showAnswer && (
                    <div className="answer-section">
                        <h4>
                            <CheckCircle size={18} />
                            Explanation
                        </h4>
                        <p className="answer-text">
                            <strong>
                                Correct Answer:{' '}
                                {formatText(currentQuestion.answer)}
                            </strong>
                        </p>
                        {hasExplanation(currentQuestion.explanation) && (
                            <div className="explanation">
                                <p>{formatText(currentQuestion.explanation)}</p>
                            </div>
                        )}
                        {selectedOption !== null && (
                            <div className="result-indicator">
                                {isCorrect ? (
                                    <p className="correct-result">
                                        <CheckCircle
                                            size={20}
                                            style={{
                                                color: 'var(--success-color)',
                                            }}
                                        />
                                        Correct! Well done.
                                    </p>
                                ) : (
                                    <p className="incorrect-result">
                                        <XCircle
                                            size={20}
                                            style={{
                                                color: 'var(--error-color)',
                                            }}
                                        />
                                        Incorrect. The correct answer was{' '}
                                        {formatText(currentQuestion.answer)}.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="mode-action-bar quiz-actions">
                    {!showAnswer ? (
                        <button
                            onClick={handleRevealAnswer}
                            className="btn btn-primary"
                            disabled={selectedOption === null}
                            title="Reveal answer (Space/Enter)"
                        >
                            <Eye size={16} />
                            Reveal Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="btn btn-primary"
                            title="Next question (→)"
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
