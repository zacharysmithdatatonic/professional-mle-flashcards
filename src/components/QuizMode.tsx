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
    Brain,
    Trophy,
} from 'lucide-react';
import { formatText } from '../utils/textFormatting';

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

    const handleOptionSelect = (optionIndex: number) => {
        if (!showAnswer) {
            setSelectedOption(optionIndex);
        }
    };

    const handleRevealAnswer = () => {
        setShowAnswer(true);

        // Automatically determine if the answer is correct
        const correctOptionIndex = getCorrectOptionIndex();
        const isCorrect = selectedOption === correctOptionIndex;

        // Automatically call onAnswer with the result
        onAnswer(isCorrect);
    };

    const handleNext = () => {
        setShowAnswer(false);
        setSelectedOption(null);
        onNext();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevious = () => {
        setShowAnswer(false);
        setSelectedOption(null);
        onPrevious();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getCorrectOptionIndex = () => {
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
    };

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
                    <Brain size={16} />
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
                        <div className="explanation">
                            <p>{formatText(currentQuestion.explanation)}</p>
                        </div>
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

                <div className="quiz-actions">
                    {!showAnswer ? (
                        <button
                            onClick={handleRevealAnswer}
                            className="btn btn-primary"
                            disabled={selectedOption === null}
                        >
                            <Eye size={16} />
                            Reveal Answer
                        </button>
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
