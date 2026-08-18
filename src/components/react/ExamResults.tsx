import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { CheckCircle, XCircle } from 'lucide-react';
import {
    studyCardContentSx,
    studyCardSx,
    studyCardWrapperSx,
} from '../../lib/studyCardStyles';
import { getOptionDisplayText } from '../../lib/textFormatting';
import { FormattedText } from './FormattedText';
import { CaseStudyCallout } from './CaseStudyCallout';
import { ExplanationLinks } from './ExplanationLinks';
import { ReportQuestionIssueButton } from './ReportQuestionIssueButton';
import { hasOptionImages, OptionImagesGrid } from './OptionImagesGrid';
import { AnswerOptionButton } from './AnswerOptionButton';
import { resolveAssetPath } from '../../lib/assets';
import {
    hasExplanation,
    type ExamGrade,
    type ExamQuestionResult,
} from '../../lib/exam';

interface ExamResultsProps {
    grade: ExamGrade;
    optionOrders: Record<string, number[]>;
    strikes: Record<string, number[]>;
    bankKey: string;
}

const IncorrectQuestionCard: React.FC<{
    result: ExamQuestionResult;
    optionOrder: number[];
    struckOriginal: number[];
    bankKey: string;
}> = ({ result, optionOrder, struckOriginal, bankKey }) => {
    const { question, selectedOriginal, correctOriginal } = result;
    const displayOptions = useMemo(
        () =>
            optionOrder.map(
                originalIndex => question.options[originalIndex] ?? ''
            ),
        [optionOrder, question]
    );
    const displayOptionImages = useMemo(() => {
        if (!question.optionImages?.length) {
            return undefined;
        }
        return optionOrder.map(
            originalIndex => question.optionImages?.[originalIndex] ?? null
        );
    }, [optionOrder, question]);
    const selectedDisplay = useMemo(
        () =>
            new Set(
                selectedOriginal
                    .map(originalIndex => optionOrder.indexOf(originalIndex))
                    .filter(index => index >= 0)
            ),
        [selectedOriginal, optionOrder]
    );
    const correctDisplay = useMemo(
        () =>
            new Set(
                correctOriginal
                    .map(originalIndex => optionOrder.indexOf(originalIndex))
                    .filter(index => index >= 0)
            ),
        [correctOriginal, optionOrder]
    );
    const struckDisplay = useMemo(
        () =>
            new Set(
                struckOriginal
                    .map(originalIndex => optionOrder.indexOf(originalIndex))
                    .filter(index => index >= 0)
            ),
        [struckOriginal, optionOrder]
    );
    const correctAnswerLabels = useMemo(
        () =>
            [...correctDisplay]
                .sort((a, b) => a - b)
                .map(index => String.fromCharCode(65 + index))
                .join(', '),
        [correctDisplay]
    );

    return (
        <Card sx={studyCardSx('error')}>
            <CardContent sx={studyCardContentSx}>
                <Stack spacing={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Question {result.questionNumber}
                        {result.isUnanswered ? ' · Unanswered' : ''}
                    </Typography>
                    {question.caseStudy ? (
                        <CaseStudyCallout caseStudy={question.caseStudy} />
                    ) : null}
                    <FormattedText text={question.question} />
                    {question.questionImages?.length ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ flexWrap: 'wrap' }}
                        >
                            {question.questionImages.map((image, index) => (
                                <Box
                                    key={`${question.id}-qimg-${index}`}
                                    component="img"
                                    src={resolveAssetPath(image)}
                                    alt=""
                                    sx={{
                                        maxWidth: '100%',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                />
                            ))}
                        </Stack>
                    ) : null}
                    <Stack spacing={2}>
                        {hasOptionImages(displayOptionImages) ? (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'grey.50',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <OptionImagesGrid
                                    optionImages={displayOptionImages ?? []}
                                />
                            </Box>
                        ) : null}
                        <Stack spacing={1}>
                            {displayOptions.map((option, index) => {
                                const isSelected = selectedDisplay.has(index);
                                const isCorrectOption =
                                    correctDisplay.has(index);
                                const correctness = isCorrectOption
                                    ? 'correct'
                                    : isSelected
                                      ? 'incorrect'
                                      : 'none';
                                return (
                                    <AnswerOptionButton
                                        key={optionOrder[index] ?? index}
                                        letter={String.fromCharCode(65 + index)}
                                        selected={isSelected}
                                        struck={struckDisplay.has(index)}
                                        disabled
                                        correctness={correctness}
                                        onSelect={() => undefined}
                                    >
                                        <FormattedText
                                            text={getOptionDisplayText(
                                                option,
                                                index
                                            )}
                                            variant="body2"
                                            color="text.primary"
                                        />
                                    </AnswerOptionButton>
                                );
                            })}
                        </Stack>
                    </Stack>
                    <Divider />
                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center' }}
                        >
                            <CheckCircle size={18} />
                            <Typography variant="subtitle1">
                                Explanation
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', minWidth: 0 }}
                        >
                            <FormattedText
                                text={`Correct Answer: ${correctAnswerLabels}`}
                                variant="body1"
                                component="div"
                                sx={{ fontWeight: 700 }}
                            />
                            <ReportQuestionIssueButton
                                bankKey={bankKey}
                                question={question}
                            />
                        </Stack>
                        {(hasExplanation(question.explanation) ||
                            !!question.explanationLinks?.length) && (
                            <Box
                                sx={{
                                    bgcolor: 'primary.light',
                                    p: 2,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                <Stack spacing={1.5}>
                                    {hasExplanation(question.explanation) && (
                                        <FormattedText
                                            text={question.explanation}
                                            variant="body2"
                                        />
                                    )}
                                    {question.explanationLinks?.length ? (
                                        <ExplanationLinks
                                            links={question.explanationLinks}
                                        />
                                    ) : null}
                                </Stack>
                            </Box>
                        )}
                        <Box
                            sx={{
                                bgcolor: 'error.light',
                                p: 2,
                                borderRadius: 2,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                            >
                                <XCircle size={20} />
                                <FormattedText
                                    text={
                                        result.isUnanswered
                                            ? `Unanswered. The correct answer was ${correctAnswerLabels}.`
                                            : `Incorrect. The correct answer was ${correctAnswerLabels}.`
                                    }
                                    variant="body2"
                                    component="span"
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export const ExamResults: React.FC<ExamResultsProps> = ({
    grade,
    optionOrders,
    strikes,
    bankKey,
}) => {
    const incorrect = grade.results.filter(result => !result.isCorrect);
    const percentLabel = `${Math.round(grade.percent)}%`;

    return (
        <Box sx={studyCardWrapperSx}>
            <Stack spacing={3}>
                <Card>
                    <CardContent>
                        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                            <Typography variant="h5">Exam complete</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 500 }}>
                                {grade.correctCount} / {grade.totalCount}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {percentLabel}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
                {incorrect.length > 0 ? (
                    <Stack spacing={2}>
                        <Typography variant="h6">
                            Incorrect questions ({incorrect.length})
                        </Typography>
                        {incorrect.map(result => (
                            <IncorrectQuestionCard
                                key={result.question.id}
                                result={result}
                                optionOrder={
                                    optionOrders[result.question.id] ??
                                    result.question.options.map(
                                        (_, index) => index
                                    )
                                }
                                struckOriginal={
                                    strikes[result.question.id] ?? []
                                }
                                bankKey={bankKey}
                            />
                        ))}
                    </Stack>
                ) : (
                    <Typography
                        variant="body1"
                        sx={{ textAlign: 'center' }}
                        color="text.secondary"
                    >
                        You answered every question correctly.
                    </Typography>
                )}
            </Stack>
        </Box>
    );
};
