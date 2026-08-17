import type { Question } from './banks';
import { getAssetUrl } from './assets';

interface RawQuestionLegacy {
    Question: string;
    'Possible answers': string;
    'Correct answer & Explanation': string;
}

interface RawCaseStudy {
    name?: string;
    url?: string;
}

interface RawQuestionNormalized {
    question: string;
    options: string[];
    answer: string[] | string;
    explanation: string;
    caseStudy?: RawCaseStudy | null;
    explanationLinks?: string[];
    questionImages?: string[];
    optionImages?: Array<string | null>;
}

const normalizeCaseStudy = (
    caseStudy?: RawCaseStudy | null
): Question['caseStudy'] | undefined => {
    if (!caseStudy) return undefined;
    const name = caseStudy.name?.trim();
    const url = caseStudy.url?.trim();
    if (!name || !url) return undefined;
    return { name, url };
};

const normalizeExplanationLinks = (links?: string[]): string[] | undefined => {
    if (!Array.isArray(links)) return undefined;
    const normalized = links
        .map(link => (typeof link === 'string' ? link.trim() : ''))
        .filter(Boolean);
    return normalized.length > 0 ? normalized : undefined;
};

const parseOptions = (possibleAnswers: string): string[] => {
    const lines = possibleAnswers.split('\n').filter(line => line.trim());
    const options: string[] = [];

    for (const line of lines) {
        const match = line.match(/^([A-D])\)(.*)/);
        if (match) {
            const optionText = match[2].trim().replace(/,$/, '');
            options.push(optionText);
        }
    }

    return options;
};

const parseCorrectAnswerAndExplanation = (
    content: string
): { answer: string; explanation: string } => {
    const answerMatch = content.match(/Correct Answer:\s*([A-D])/i);
    const answer = answerMatch ? answerMatch[1].toUpperCase() : '';

    const explanationMatch = content.match(/Explanation:\s*([\s\S]*)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';

    return { answer, explanation };
};

const normalizeAnswer = (answer: string[] | string): string[] => {
    if (Array.isArray(answer)) {
        return answer.map(item => item.trim()).filter(Boolean);
    }

    const trimmed = answer.trim();
    return trimmed ? [trimmed] : [];
};

export const parseJSON = (
    jsonContent: string,
    bankKey?: string
): Question[] => {
    const questions: Question[] = [];
    const idPrefix = bankKey ? `${bankKey}-` : '';

    try {
        const rawQuestions: Array<RawQuestionLegacy | RawQuestionNormalized> =
            JSON.parse(jsonContent);
        for (let i = 0; i < rawQuestions.length; i++) {
            const rawQuestion = rawQuestions[i];

            try {
                if ('Question' in rawQuestion) {
                    if (
                        !rawQuestion.Question ||
                        !rawQuestion['Possible answers'] ||
                        !rawQuestion['Correct answer & Explanation']
                    ) {
                        console.warn(
                            `Skipping question ${i}: Missing required fields`
                        );
                        continue;
                    }

                    const options = parseOptions(
                        rawQuestion['Possible answers']
                    );
                    if (options.length < 2) {
                        console.warn(
                            `Skipping question ${i}: Could not parse enough options`
                        );
                        continue;
                    }

                    const { answer, explanation } =
                        parseCorrectAnswerAndExplanation(
                            rawQuestion['Correct answer & Explanation']
                        );
                    if (!answer) {
                        console.warn(
                            `Skipping question ${i}: Could not find correct answer`
                        );
                        continue;
                    }

                    questions.push({
                        id: `${idPrefix}q-${i + 1}`,
                        question: rawQuestion.Question.trim(),
                        options,
                        answer: normalizeAnswer(answer),
                        explanation,
                    });
                    continue;
                }

                const hasPrompt =
                    rawQuestion.question?.trim() ||
                    (rawQuestion.questionImages &&
                        rawQuestion.questionImages.length > 0);

                if (
                    !hasPrompt ||
                    !rawQuestion.options ||
                    !rawQuestion.answer ||
                    !Array.isArray(rawQuestion.options) ||
                    rawQuestion.options.length < 2
                ) {
                    console.warn(
                        `Skipping question ${i}: Missing required fields`
                    );
                    continue;
                }

                const normalizedAnswer = normalizeAnswer(rawQuestion.answer);
                if (normalizedAnswer.length === 0) {
                    console.warn(
                        `Skipping question ${i}: Missing correct answer`
                    );
                    continue;
                }

                questions.push({
                    id: `${idPrefix}q-${i + 1}`,
                    question: rawQuestion.question?.trim() || '',
                    options: rawQuestion.options,
                    answer: normalizedAnswer,
                    explanation: rawQuestion.explanation || '',
                    caseStudy: normalizeCaseStudy(rawQuestion.caseStudy),
                    explanationLinks: normalizeExplanationLinks(
                        rawQuestion.explanationLinks
                    ),
                    questionImages: rawQuestion.questionImages,
                    optionImages: rawQuestion.optionImages,
                });
            } catch (error) {
                console.warn(`Error parsing question ${i}:`, error);
            }
        }

        if (questions.length === 0) {
            console.error(
                'No questions were parsed! Check the JSON format and structure.'
            );
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }

    return questions;
};

export const loadQuestionsFromJSON = async (
    datasetPath?: string,
    bankKey?: string
): Promise<Question[]> => {
    try {
        const path = datasetPath || '/pmle.json';
        const response = await fetch(getAssetUrl(path));
        if (!response.ok) {
            throw new Error(
                `Failed to load dataset: ${response.status} ${response.statusText}`
            );
        }

        const jsonContent = await response.text();
        return parseJSON(jsonContent, bankKey);
    } catch (error) {
        console.error('Error loading questions from JSON:', error);
        throw error;
    }
};

export const parseCSV = parseJSON;
export const loadQuestionsFromCSV = loadQuestionsFromJSON;
