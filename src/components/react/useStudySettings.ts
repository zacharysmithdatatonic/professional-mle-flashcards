import { useCallback, useEffect, useState } from 'react';
import {
    loadStudySettings,
    saveStudySettings,
    subscribeToStudySettings,
    type StudySettings,
} from '../../lib/studySettings';

/**
 * Reads the stored settings and stays in sync with the settings menu, which may
 * live in a separate React root in the page header.
 */
export const useStudySettings = () => {
    const [settings, setSettings] = useState<StudySettings>(loadStudySettings);

    useEffect(() => subscribeToStudySettings(setSettings), []);

    const setSetting = useCallback(
        (key: keyof StudySettings, value: boolean) => {
            setSettings(previous => {
                const next = { ...previous, [key]: value };
                saveStudySettings(next);
                return next;
            });
        },
        []
    );

    return { settings, setSetting };
};
