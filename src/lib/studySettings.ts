const STORAGE_KEY = 'study-settings';
const CHANGE_EVENT = 'study-settings-change';

/**
 * Answer-presentation settings for quiz and review. Exam mode always uses the
 * authored option order and labels so it mirrors the real exam.
 */
export interface StudySettings {
    shuffleOptions: boolean;
    hideOptionLabels: boolean;
}

export const DEFAULT_STUDY_SETTINGS: StudySettings = {
    shuffleOptions: false,
    hideOptionLabels: false,
};

const isBoolean = (value: unknown): value is boolean =>
    typeof value === 'boolean';

export const loadStudySettings = (): StudySettings => {
    if (typeof window === 'undefined') {
        return DEFAULT_STUDY_SETTINGS;
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return DEFAULT_STUDY_SETTINGS;
        }
        const parsed: unknown = JSON.parse(stored);
        if (!parsed || typeof parsed !== 'object') {
            return DEFAULT_STUDY_SETTINGS;
        }
        const record = parsed as Record<string, unknown>;
        return {
            shuffleOptions: isBoolean(record.shuffleOptions)
                ? record.shuffleOptions
                : DEFAULT_STUDY_SETTINGS.shuffleOptions,
            hideOptionLabels: isBoolean(record.hideOptionLabels)
                ? record.hideOptionLabels
                : DEFAULT_STUDY_SETTINGS.hideOptionLabels,
        };
    } catch {
        return DEFAULT_STUDY_SETTINGS;
    }
};

export const saveStudySettings = (settings: StudySettings): void => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

/** Lets an in-progress session react to changes made from the settings menu. */
export const subscribeToStudySettings = (
    onChange: (settings: StudySettings) => void
): (() => void) => {
    if (typeof window === 'undefined') {
        return () => undefined;
    }
    const handleChange = () => onChange(loadStudySettings());
    window.addEventListener(CHANGE_EVENT, handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
        window.removeEventListener(CHANGE_EVENT, handleChange);
        window.removeEventListener('storage', handleChange);
    };
};
