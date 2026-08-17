import type { Question, QuestionBank } from './banks';
import { QUESTION_BANKS } from './banks';

const ISSUES_NEW_URL =
    'https://github.com/zacharysmithdatatonic/google-cloud-certification-flashcards/issues/new';

const QUESTION_ANSWER_TEMPLATE = 'question-answer.yml';

const truncate = (value: string, maxLength: number) => {
    const trimmed = value.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

export const getBankByKey = (bankKey: string): QuestionBank | undefined =>
    QUESTION_BANKS.find(bank => bank.key === bankKey);

export const buildQuestionAnswerIssueUrl = ({
    bankKey,
    question,
    pageUrl,
}: {
    bankKey: string;
    question: Question;
    pageUrl?: string;
}): string => {
    const bank = getBankByKey(bankKey);
    const certification = bank ? `${bank.name} (${bank.shortName})` : bankKey;
    const params = new URLSearchParams({
        template: QUESTION_ANSWER_TEMPLATE,
        title: `[Q&A] ${bank?.shortName ?? bankKey}: ${question.id}`,
        certification,
        'question-id': question.id,
        'question-prompt': truncate(
            question.question || '(image-only question)',
            600
        ),
        'recorded-answer': question.answer.join(', '),
    });

    if (pageUrl) {
        params.set('page-url', pageUrl);
    }

    return `${ISSUES_NEW_URL}?${params.toString()}`;
};
