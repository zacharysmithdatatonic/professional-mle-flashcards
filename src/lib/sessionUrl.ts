export const getIndexFromURL = (): number | null => {
    const indexParam = new URLSearchParams(window.location.search).get('index');
    if (!indexParam) return null;
    const parsed = Number.parseInt(indexParam, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const getQuestionIdFromURL = (): string | null => {
    const questionId = new URLSearchParams(window.location.search).get(
        'questionId'
    );
    return questionId && questionId.trim().length > 0 ? questionId : null;
};

export const syncSessionToURL = (
    index: number | null,
    questionId: string | null
) => {
    const url = new URL(window.location.href);
    if (index !== null) {
        url.searchParams.set('index', String(index));
    } else {
        url.searchParams.delete('index');
    }
    if (questionId) {
        url.searchParams.set('questionId', questionId);
    } else {
        url.searchParams.delete('questionId');
    }
    window.history.replaceState({}, '', url.toString());
};

export const resolveStartIndex = (
    questions: { id: string }[],
    startQuestionId?: string | null,
    startIndex?: number | null
): number => {
    const matchedIndex = startQuestionId
        ? questions.findIndex(question => question.id === startQuestionId)
        : -1;
    const resolvedIndex =
        matchedIndex >= 0
            ? matchedIndex
            : typeof startIndex === 'number'
              ? startIndex
              : 0;
    return Math.min(
        Math.max(resolvedIndex, 0),
        Math.max(questions.length - 1, 0)
    );
};
