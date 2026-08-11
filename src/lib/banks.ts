export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: string[];
    explanation: string;
    questionImages?: string[];
    optionImages?: Array<string | null>;
}

export interface QuestionPerformance {
    questionId: string;
    correctCount: number;
    incorrectCount: number;
    lastAnswered: Date | null;
    lastCorrect: boolean | null;
    scheduledNext: number | null;
}

export type StudyMode = 'quiz' | 'review' | 'memorise' | 'fill-in-blank';

export type CertificationTier = 'foundational' | 'associate' | 'professional';

export interface QuestionBank {
    key: string;
    name: string;
    shortName: string;
    tier: CertificationTier;
    dataset: string | null;
    available: boolean;
    color: string;
}

export const CERTIFICATION_TIERS: Record<
    CertificationTier,
    { name: string; color: string; description: string }
> = {
    foundational: {
        name: 'Foundational',
        color: '#34A853',
        description:
            'Validates broad knowledge of cloud concepts and Google Cloud products, services, and tools.',
    },
    associate: {
        name: 'Associate',
        color: '#FBBC05',
        description:
            'Validates fundamental skills to deploy and maintain cloud projects.',
    },
    professional: {
        name: 'Professional',
        color: '#4285F4',
        description:
            'Validates advanced skills in design, implementation, and management.',
    },
};

export const QUESTION_BANKS: QuestionBank[] = [
    {
        key: 'cdl',
        name: 'Cloud Digital Leader',
        shortName: 'CDL',
        tier: 'foundational',
        dataset: '/cdl.json',
        available: true,
        color: '#34A853',
    },
    {
        key: 'genai',
        name: 'Generative AI Leader',
        shortName: 'GenAI',
        tier: 'foundational',
        dataset: '/genai.json',
        available: true,
        color: '#34A853',
    },
    {
        key: 'ace',
        name: 'Cloud Engineer',
        shortName: 'ACE',
        tier: 'associate',
        dataset: null,
        available: false,
        color: '#FBBC05',
    },
    {
        key: 'adp',
        name: 'Data Practitioner',
        shortName: 'ADP',
        tier: 'associate',
        dataset: null,
        available: false,
        color: '#FBBC05',
    },
    {
        key: 'agwa',
        name: 'Google Workspace Administrator',
        shortName: 'AGWA',
        tier: 'associate',
        dataset: null,
        available: false,
        color: '#FBBC05',
    },
    {
        key: 'pca',
        name: 'Cloud Architect',
        shortName: 'PCA',
        tier: 'professional',
        dataset: null,
        available: false,
        color: '#4285F4',
    },
    {
        key: 'pcde',
        name: 'Cloud Database Engineer',
        shortName: 'PCDE',
        tier: 'professional',
        dataset: null,
        available: false,
        color: '#4285F4',
    },
    {
        key: 'pcd',
        name: 'Cloud Developer',
        shortName: 'PCD',
        tier: 'professional',
        dataset: '/pcd.json',
        available: true,
        color: '#4285F4',
    },
    {
        key: 'pde',
        name: 'Data Engineer',
        shortName: 'PDE',
        tier: 'professional',
        dataset: '/pde.json',
        available: true,
        color: '#4285F4',
    },
    {
        key: 'pcdo',
        name: 'Cloud DevOps Engineer',
        shortName: 'PCDO',
        tier: 'professional',
        dataset: null,
        available: false,
        color: '#4285F4',
    },
    {
        key: 'pcse',
        name: 'Cloud Security Engineer',
        shortName: 'PCSE',
        tier: 'professional',
        dataset: null,
        available: false,
        color: '#4285F4',
    },
    {
        key: 'pcne',
        name: 'Cloud Network Engineer',
        shortName: 'PCNE',
        tier: 'professional',
        dataset: null,
        available: false,
        color: '#4285F4',
    },
    {
        key: 'pmle',
        name: 'Machine Learning Engineer',
        shortName: 'PMLE',
        tier: 'professional',
        dataset: '/pmle.json',
        available: true,
        color: '#4285F4',
    },
    {
        key: 'psoe',
        name: 'Security Operations Engineer',
        shortName: 'PSOE',
        tier: 'professional',
        dataset: null,
        available: false,
        color: '#4285F4',
    },
];

export const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const getBankFromParams = (
    tier: string | undefined,
    slug: string | undefined
): QuestionBank | null => {
    if (!tier || !slug) return null;
    if (!['foundational', 'associate', 'professional'].includes(tier)) {
        return null;
    }
    return (
        QUESTION_BANKS.find(
            bank =>
                bank.tier === (tier as CertificationTier) &&
                toSlug(bank.name) === slug &&
                bank.available
        ) || null
    );
};

export const getStaticBankPaths = () =>
    QUESTION_BANKS.filter(b => b.available).map(bank => ({
        params: { tier: bank.tier, slug: toSlug(bank.name) },
        props: { bank },
    }));

export const getBankBasePath = (bank: QuestionBank) =>
    `${import.meta.env.BASE_URL}${bank.tier}/${toSlug(bank.name)}/`;

export const getBankModePath = (bank: QuestionBank, mode: StudyMode) => {
    const modeSegment = mode === 'fill-in-blank' ? 'fill-in-blank' : mode;
    return `${import.meta.env.BASE_URL}${bank.tier}/${toSlug(bank.name)}/${modeSegment}`;
};

export const getBanksByTier = (tier: CertificationTier) =>
    QUESTION_BANKS.filter(bank => bank.tier === tier).sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return 0;
    });

export const MODE_LABELS: Record<StudyMode, string> = {
    quiz: 'Quiz Mode',
    review: 'Review Mode',
    memorise: 'Memorise Mode',
    'fill-in-blank': 'Fill-in-Blank Mode',
};

export const MODE_SHORT_LABELS: Record<StudyMode, string> = {
    quiz: 'Quiz',
    review: 'Review',
    memorise: 'Memorise',
    'fill-in-blank': 'Fill-in-Blank',
};
