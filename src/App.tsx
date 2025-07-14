import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuestionPerformance, StudyMode } from './types';
import { loadQuestionsFromJSON } from './utils/questionParser';
import {
    createInitialPerformance,
    updatePerformance,
    getPerformanceStats,
    getQuestionsForReview,
    weightedShuffle,
    savePerformanceToStorage,
    loadPerformanceFromStorage,
} from './utils/performance';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { ReviewMode } from './components/ReviewMode';
import { MemoriseMode } from './components/MemoriseMode';
import { FillInTheBlankMode } from './components/FillInTheBlankMode';
import { PomodoroTimer } from './components/PomodoroTimer';
import {
    BookOpen,
    Brain,
    XCircle,
    RotateCcw,
    List,
    BarChart3,
    ArrowLeft,
    Target,
    CheckCircle,
    AlertCircle,
    FileText,
    TrendingUp,
    Heart,
    Edit3,
} from 'lucide-react';
import './App.css';

// Accuracy Display Component
const AccuracyDisplay: React.FC<{
    performance: Map<string, QuestionPerformance>;
}> = ({ performance }) => {
    let totalCorrect = 0;
    let totalIncorrect = 0;

    performance.forEach(perf => {
        totalCorrect += perf.correctCount;
        totalIncorrect += perf.incorrectCount;
    });

    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy =
        totalAttempts > 0
            ? Math.round((totalCorrect / totalAttempts) * 100)
            : 0;

    return (
        <div className="header-accuracy">
            <BarChart3 size={16} />
            <span className="accuracy-title">Average Accuracy:</span>
            <span className="accuracy-percentage">{accuracy}%</span>
            <span className="accuracy-details">
                ({totalCorrect}{' '}
                <CheckCircle className="correct-icon" size={16} /> |{' '}
                {totalAttempts} <XCircle className="incorrect-icon" size={16} />
                )
            </span>
        </div>
    );
};

// Progress Bar Component
const ProgressBar: React.FC<{
    current: number;
    total: number;
    className?: string;
}> = ({ current, total, className = '' }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;

    return (
        <div className={`header-progress-container ${className}`}>
            <div className="header-progress-bar">
                <div
                    className="header-progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="header-progress-text">
                <TrendingUp size={14} />
                {current} of {total} questions answered
            </p>
        </div>
    );
};

// URL parameter utilities
const getModeFromURL = (): StudyMode | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') as StudyMode;
    return mode &&
        ['flashcard', 'quiz', 'review', 'memorise', 'fill-in-blank'].includes(
            mode
        )
        ? mode
        : null;
};

const setModeInURL = (mode: StudyMode | null) => {
    const url = new URL(window.location.href);
    if (mode) {
        url.searchParams.set('mode', mode);
    } else {
        url.searchParams.delete('mode');
    }
    window.history.replaceState({}, '', url.toString());
};

function App() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [performance, setPerformance] = useState<
        Map<string, QuestionPerformance>
    >(new Map());
    const [currentMode, setCurrentMode] = useState<StudyMode | null>(null);
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasInitializedMode, setHasInitializedMode] = useState(false);

    // Load questions and performance on app start
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load JSON data from public folder
                const parsedQuestions = await loadQuestionsFromJSON();
                setQuestions(parsedQuestions);

                // Load performance from localStorage
                const savedPerformance = loadPerformanceFromStorage();

                // Initialize performance for new questions
                const updatedPerformance = new Map(savedPerformance);
                parsedQuestions.forEach((q: Question) => {
                    if (!updatedPerformance.has(q.id)) {
                        updatedPerformance.set(
                            q.id,
                            createInitialPerformance(q.id)
                        );
                    }
                });

                setPerformance(updatedPerformance);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading data:', error);
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const startMode = useCallback(
        (mode: StudyMode) => {
            let questionsToUse: Question[] = [];

            switch (mode) {
                case 'review':
                    questionsToUse = getQuestionsForReview(
                        questions,
                        performance
                    );
                    if (questionsToUse.length === 0) {
                        alert(
                            'No questions need review! All questions have been answered correctly.'
                        );
                        return;
                    }
                    break;
                case 'memorise':
                    questionsToUse = questions;
                    break;
                default:
                    questionsToUse = weightedShuffle(questions, performance);
            }

            setCurrentMode(mode);
            setCurrentQuestions(questionsToUse);
            setCurrentIndex(0);
        },
        [questions, performance]
    );

    // On initial load, set mode from URL if present (after questions are loaded)
    useEffect(() => {
        if (!isLoading && questions.length > 0 && !hasInitializedMode) {
            const modeFromURL = getModeFromURL();
            if (modeFromURL) {
                startMode(modeFromURL);
            }
            setHasInitializedMode(true);
        }
    }, [isLoading, questions.length, hasInitializedMode, startMode]);

    // Handle URL parameter changes (popstate) after questions are loaded
    useEffect(() => {
        if (isLoading || questions.length === 0) return;
        const handleURLChange = () => {
            const modeFromURL = getModeFromURL();
            if (modeFromURL && modeFromURL !== currentMode) {
                startMode(modeFromURL);
            } else if (!modeFromURL && currentMode) {
                setCurrentMode(null);
                setCurrentQuestions([]);
                setCurrentIndex(0);
            }
        };

        window.addEventListener('popstate', handleURLChange);
        return () => {
            window.removeEventListener('popstate', handleURLChange);
        };
    }, [isLoading, questions.length, currentMode, startMode]);

    // Save performance to localStorage whenever it changes
    useEffect(() => {
        if (performance.size > 0) {
            savePerformanceToStorage(performance);
        }
    }, [performance]);

    // Sync URL when currentMode changes (but not during initial load)
    useEffect(() => {
        if (hasInitializedMode) {
            setModeInURL(currentMode);
        }
    }, [currentMode, hasInitializedMode]);

    const handleAnswer = (isCorrect: boolean) => {
        const currentQuestion = currentQuestions[currentIndex];
        if (!currentQuestion) return;

        const currentPerf =
            performance.get(currentQuestion.id) ||
            createInitialPerformance(currentQuestion.id);
        const updatedPerf = updatePerformance(
            currentPerf,
            isCorrect,
            currentIndex
        );

        setPerformance(
            prev => new Map(prev.set(currentQuestion.id, updatedPerf))
        );

        // If answer was incorrect, schedule it to reappear
        if (!isCorrect && updatedPerf.scheduledNext !== null) {
            const newQuestions = [...currentQuestions];
            const insertIndex = Math.min(
                updatedPerf.scheduledNext,
                newQuestions.length
            );
            newQuestions.splice(insertIndex, 0, currentQuestion);
            setCurrentQuestions(newQuestions);
        }
    };

    const handleNext = () => {
        if (currentIndex < currentQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Session complete
            setCurrentMode(null);
            setCurrentIndex(0);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleBackToMenu = () => {
        setCurrentMode(null);
        setCurrentIndex(0);
    };

    const stats = getPerformanceStats(performance);
    const reviewQuestions = getQuestionsForReview(questions, performance);

    if (isLoading) {
        return (
            <div className="app">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading questions...</p>
                </div>
            </div>
        );
    }

    if (currentMode === 'memorise') {
        return (
            <div className="app">
                <header className="app-header">
                    <div className="header-left">
                        <button
                            onClick={handleBackToMenu}
                            className="back-button"
                        >
                            <ArrowLeft size={16} />
                            Back to Menu
                        </button>
                    </div>
                    <div className="header-right">
                        <AccuracyDisplay performance={performance} />
                        <ProgressBar
                            current={stats.totalAnswered}
                            total={questions.length}
                        />
                        <PomodoroTimer />
                    </div>
                </header>
                <MemoriseMode questions={questions} performance={performance} />
            </div>
        );
    }

    if (currentMode && currentQuestions.length > 0) {
        return (
            <div className="app">
                <header className="app-header">
                    <div className="header-left">
                        <button
                            onClick={handleBackToMenu}
                            className="back-button"
                        >
                            <ArrowLeft size={16} />
                            Back to Menu
                        </button>
                        <div className="mode-indicator">
                            {currentMode === 'flashcard' && (
                                <>
                                    <BookOpen size={16} />
                                    Flashcard Mode
                                </>
                            )}
                            {currentMode === 'quiz' && (
                                <>
                                    <Brain size={16} />
                                    Quiz Mode
                                </>
                            )}
                            {currentMode === 'review' && (
                                <>
                                    <RotateCcw size={16} />
                                    Review Mode
                                </>
                            )}
                            {currentMode === 'fill-in-blank' && (
                                <>
                                    <Edit3 size={16} />
                                    Fill-in-the-Blank Mode
                                </>
                            )}
                        </div>
                    </div>
                    <div className="header-right">
                        <AccuracyDisplay performance={performance} />
                        <ProgressBar
                            current={stats.totalAnswered}
                            total={questions.length}
                        />
                        <PomodoroTimer />
                    </div>
                </header>

                <main className="app-main">
                    {currentMode === 'flashcard' ? (
                        <FlashcardMode
                            questions={currentQuestions}
                            currentIndex={currentIndex}
                            onAnswer={handleAnswer}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            performance={performance}
                        />
                    ) : currentMode === 'review' ? (
                        <ReviewMode
                            questions={currentQuestions}
                            currentIndex={currentIndex}
                            onAnswer={handleAnswer}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            performance={performance}
                        />
                    ) : currentMode === 'fill-in-blank' ? (
                        <FillInTheBlankMode
                            questions={currentQuestions}
                            currentIndex={currentIndex}
                            onAnswer={handleAnswer}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            performance={performance}
                        />
                    ) : (
                        <QuizMode
                            questions={currentQuestions}
                            currentIndex={currentIndex}
                            onAnswer={handleAnswer}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            performance={performance}
                        />
                    )}
                </main>
            </div>
        );
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-left">
                    <h1>
                        <Brain size={24} />
                        PMLE Flashcards
                    </h1>
                </div>
                <div className="header-right">
                    <AccuracyDisplay performance={performance} />
                    <ProgressBar
                        current={stats.totalAnswered}
                        total={questions.length}
                    />
                    <PomodoroTimer />
                </div>
            </header>

            <main className="app-main">
                <div className="stats-overview">
                    <h2>Progress Overview</h2>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <FileText size={20} />
                            <h3>Questions</h3>
                            <p className="stat-number">{questions.length}</p>
                        </div>
                        <div className="stat-card">
                            <CheckCircle size={20} />
                            <h3>Answered</h3>
                            <p className="stat-number">{stats.totalAnswered}</p>
                        </div>
                        <div className="stat-card">
                            <Target size={20} />
                            <h3>Accuracy</h3>
                            <p className="stat-number">
                                {stats.accuracy.toFixed(1)}%
                            </p>
                        </div>
                        <div className="stat-card">
                            <AlertCircle size={20} />
                            <h3>Need Review</h3>
                            <p className="stat-number">
                                {reviewQuestions.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mode-selection">
                    <h2>Choose Study Mode</h2>

                    <div className="mode-grid">
                        <button
                            onClick={() => startMode('flashcard')}
                            className="mode-button flashcard-mode"
                        >
                            <BookOpen size={32} />
                            <h3>Flashcard Mode</h3>
                            <p>
                                Study questions one at a time. See the question,
                                then reveal the answer.
                            </p>
                        </button>

                        <button
                            onClick={() => startMode('quiz')}
                            className="mode-button quiz-mode"
                        >
                            <Brain size={32} />
                            <h3>Quiz Mode</h3>
                            <p>
                                Test your knowledge with multiple choice
                                questions.
                            </p>
                        </button>

                        <button
                            onClick={() => startMode('review')}
                            className="mode-button review-mode"
                            disabled={reviewQuestions.length === 0}
                        >
                            <RotateCcw size={32} />
                            <h3>Review Mode</h3>
                            <p>
                                Focus on questions you got wrong or haven't
                                answered yet.
                            </p>
                            {reviewQuestions.length === 0 && (
                                <span className="mode-disabled">
                                    No questions need review
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => startMode('memorise')}
                            className="mode-button memorise-mode"
                        >
                            <List size={32} />
                            <h3>Memorise Mode</h3>
                            <p>
                                Browse all questions and answers with
                                performance tracking.
                            </p>
                        </button>

                        <button
                            onClick={() => startMode('fill-in-blank')}
                            className="mode-button fill-in-blank-mode"
                        >
                            <Edit3 size={32} />
                            <h3>Fill-in-the-Blank Mode</h3>
                            <p>
                                Complete answers by filling in missing technical
                                keywords.
                            </p>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="app-footer">
                <Heart size={16} />
                <p>
                    Keep practicing to improve your machine learning knowledge!
                </p>
            </footer>
        </div>
    );
}

export default App;
