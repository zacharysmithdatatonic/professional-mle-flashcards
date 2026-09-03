import { createShuffledOrder } from './performance';

export const identityOrder = (length: number): number[] =>
    Array.from({ length }, (_, index) => index);

export const createDisplayOrder = (
    length: number,
    shuffle: boolean
): number[] => (shuffle ? createShuffledOrder(length) : identityOrder(length));

export const isIdentityOrder = (optionOrder: number[]): boolean =>
    optionOrder.every(
        (originalIndex, displayIndex) => originalIndex === displayIndex
    );

export const indexToLetter = (index: number): string =>
    String.fromCharCode(65 + index);

const placeholder = (originalIndex: number): string =>
    `\uE000${originalIndex}\uE001`;

export const remapOriginalLetter = (
    originalLetter: string,
    optionOrder: number[]
): string => {
    const originalIndex =
        originalLetter.trim().toUpperCase().charCodeAt(0) - 65;
    const displayIndex = optionOrder.indexOf(originalIndex);
    if (displayIndex < 0) {
        return originalLetter.trim().toUpperCase();
    }
    return indexToLetter(displayIndex);
};

export const remapAnswerLabels = (
    answers: string[],
    optionOrder: number[]
): string =>
    answers
        .map(letter => letter.trim())
        .filter(Boolean)
        .map(letter => remapOriginalLetter(letter, optionOrder))
        .join(', ');

const letterClassFor = (optionCount: number): string => {
    const maxLetter = indexToLetter(Math.max(optionCount - 1, 0));
    return `[A-${maxLetter}]`;
};

/**
 * Rewrites option-letter references in explanation text so they match a
 * shuffled display order. Avoids replacing English articles such as
 * "A Google Cloud…".
 */
export const remapOptionLetters = (
    text: string,
    optionOrder: number[]
): string => {
    if (!text || optionOrder.length === 0 || isIdentityOrder(optionOrder)) {
        return text;
    }

    const letterClass = letterClassFor(optionOrder.length);
    const toPlaceholder = (letter: string) =>
        placeholder(letter.toUpperCase().charCodeAt(0) - 65);

    let result = text;

    result = result.replace(
        new RegExp(`\\b([Oo]ption)\\s+(${letterClass})\\b`, 'g'),
        (_match, prefix: string, letter: string) =>
            `${prefix} ${toPlaceholder(letter)}`
    );

    result = result.replace(
        new RegExp(`\\b([Aa]nswers?)\\s+(${letterClass})\\b`, 'g'),
        (_match, prefix: string, letter: string) =>
            `${prefix} ${toPlaceholder(letter)}`
    );

    result = result.replace(
        new RegExp(`(^|[.!?\\n]\\s+)(${letterClass})(?=\\s+[a-z])`, 'gm'),
        (_match, prefix: string, letter: string) =>
            `${prefix}${toPlaceholder(letter)}`
    );

    result = result.replace(
        new RegExp(`(^|\\n)(${letterClass})(?=\\))`, 'g'),
        (_match, prefix: string, letter: string) =>
            `${prefix}${toPlaceholder(letter)}`
    );

    const remapLetterRun = (value: string) =>
        value.replace(new RegExp(letterClass, 'g'), toPlaceholder);

    result = result.replace(
        new RegExp(
            `\\b(${letterClass})((?:,\\s*(?:and\\s+|or\\s+)?${letterClass})+)\\b`,
            'g'
        ),
        remapLetterRun
    );

    result = result.replace(
        new RegExp(
            `\\b(${letterClass})(\\s+(?:and|or)\\s+${letterClass})\\b`,
            'g'
        ),
        remapLetterRun
    );

    for (
        let originalIndex = 0;
        originalIndex < optionOrder.length;
        originalIndex++
    ) {
        const displayIndex = optionOrder.indexOf(originalIndex);
        if (displayIndex < 0) {
            continue;
        }
        result = result
            .split(placeholder(originalIndex))
            .join(indexToLetter(displayIndex));
    }

    return result;
};
