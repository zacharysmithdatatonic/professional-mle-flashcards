import React, { useState, useEffect, useRef } from 'react';
import {
    Timer,
    Settings,
    Pause,
    Play,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    X,
} from 'lucide-react';

interface PomodoroStats {
    completedPomodoros: number;
    totalStudyTime: number; // in minutes
    currentStreak: number;
}

interface TimerSettings {
    workTime: number;
    breakTime: number;
    longBreakTime: number;
    sessionsUntilLongBreak: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
    workTime: 25 * 60,
    breakTime: 5 * 60,
    longBreakTime: 15 * 60,
    sessionsUntilLongBreak: 4,
};

export const PomodoroTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workTime);
    const [isRunning, setIsRunning] = useState(false);
    const [isWorkMode, setIsWorkMode] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [stats, setStats] = useState<PomodoroStats>({
        completedPomodoros: 0,
        totalStudyTime: 0,
        currentStreak: 0,
    });

    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        handleTimerComplete();
                        return isWorkMode
                            ? settings.breakTime
                            : settings.workTime;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, isWorkMode, settings]);

    const handleTimerComplete = () => {
        if (isWorkMode) {
            setStats(prev => ({
                completedPomodoros: prev.completedPomodoros + 1,
                totalStudyTime:
                    prev.totalStudyTime + Math.floor(settings.workTime / 60),
                currentStreak: prev.currentStreak + 1,
            }));
        }
        setIsWorkMode(!isWorkMode);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(isWorkMode ? settings.workTime : settings.breakTime);
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSettingChange = (key: keyof TimerSettings, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
            setSettings(prev => ({
                ...prev,
                [key]:
                    key === 'sessionsUntilLongBreak' ? numValue : numValue * 60,
            }));
        }
    };

    const closeSettings = () => {
        setIsSettingsOpen(false);
        resetTimer(); // Reset timer with new settings
    };

    return (
        <div className="pomodoro-container">
            <div
                className={`pomodoro-timer ${isMenuOpen ? 'expanded' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <div className="timer-display">
                    <Timer size={16} />
                    <span className="time">{formatTime(timeLeft)}</span>
                    <button
                        className="play-pause-btn"
                        onClick={e => {
                            e.stopPropagation();
                            toggleTimer();
                        }}
                    >
                        {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    {isMenuOpen ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </div>
            </div>

            {isMenuOpen && (
                <div className="pomodoro-menu">
                    {!isSettingsOpen ? (
                        <>
                            <div className="menu-header">
                                <h3>
                                    {isWorkMode ? 'Work Session' : 'Break Time'}
                                </h3>
                                <div className="timer-controls">
                                    <button onClick={toggleTimer}>
                                        {isRunning ? (
                                            <Pause size={16} />
                                        ) : (
                                            <Play size={16} />
                                        )}
                                    </button>
                                    <button onClick={resetTimer}>
                                        <RotateCcw size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsSettingsOpen(true)}
                                    >
                                        <Settings size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="stats-container">
                                <div className="stat-item">
                                    <span className="stat-label">
                                        Completed
                                    </span>
                                    <span className="stat-value">
                                        {stats.completedPomodoros}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">
                                        Study Time
                                    </span>
                                    <span className="stat-value">
                                        {stats.totalStudyTime} min
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Streak</span>
                                    <span className="stat-value">
                                        {stats.currentStreak}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="settings-menu">
                            <div className="settings-header">
                                <h3>Timer Settings</h3>
                                <button
                                    className="close-settings"
                                    onClick={closeSettings}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="settings-content">
                                <div className="setting-item">
                                    <label htmlFor="workTime">
                                        Work Time (minutes)
                                    </label>
                                    <input
                                        id="workTime"
                                        type="number"
                                        min="1"
                                        value={Math.floor(
                                            settings.workTime / 60
                                        )}
                                        onChange={e =>
                                            handleSettingChange(
                                                'workTime',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="setting-item">
                                    <label htmlFor="breakTime">
                                        Break Time (minutes)
                                    </label>
                                    <input
                                        id="breakTime"
                                        type="number"
                                        min="1"
                                        value={Math.floor(
                                            settings.breakTime / 60
                                        )}
                                        onChange={e =>
                                            handleSettingChange(
                                                'breakTime',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="setting-item">
                                    <label htmlFor="longBreakTime">
                                        Long Break Time (minutes)
                                    </label>
                                    <input
                                        id="longBreakTime"
                                        type="number"
                                        min="1"
                                        value={Math.floor(
                                            settings.longBreakTime / 60
                                        )}
                                        onChange={e =>
                                            handleSettingChange(
                                                'longBreakTime',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="setting-item">
                                    <label htmlFor="sessionsUntilLongBreak">
                                        Sessions Until Long Break
                                    </label>
                                    <input
                                        id="sessionsUntilLongBreak"
                                        type="number"
                                        min="1"
                                        value={settings.sessionsUntilLongBreak}
                                        onChange={e =>
                                            handleSettingChange(
                                                'sessionsUntilLongBreak',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
