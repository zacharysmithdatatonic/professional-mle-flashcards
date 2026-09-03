import React from 'react';
import {
    BookOpen,
    Bot,
    Brain,
    ClipboardCheck,
    Cloud,
    Code,
    Database,
    Edit3,
    List,
    Network,
    RotateCcw,
    Settings,
    Shield,
    Sparkles,
    Users,
    type LucideIcon,
} from 'lucide-react';
import type { StudyMode } from './banks';

const CERTIFICATION_ICONS: Record<string, LucideIcon> = {
    cdl: Cloud,
    genai: Sparkles,
    ace: Cloud,
    adp: Database,
    agwa: Users,
    pca: Cloud,
    pcde: Database,
    pcd: Code,
    pde: Database,
    pcdo: Settings,
    pcse: Shield,
    pcne: Network,
    pmle: Brain,
    paa: Bot,
    psoe: Shield,
};

const STUDY_MODE_ICONS: Record<StudyMode, LucideIcon> = {
    quiz: Brain,
    exam: ClipboardCheck,
    review: RotateCcw,
    memorise: List,
    'fill-in-blank': Edit3,
};

/** Icon component for a certification, for callers that need the type itself. */
export const getCertificationIconComponent = (key: string): LucideIcon =>
    CERTIFICATION_ICONS[key] ?? BookOpen;

export const getStudyModeIconComponent = (mode: StudyMode): LucideIcon =>
    STUDY_MODE_ICONS[mode];

export const getCertificationIcon = (key: string, size: number = 24) => {
    const Icon = getCertificationIconComponent(key);
    return <Icon size={size} strokeWidth={1.5} />;
};
