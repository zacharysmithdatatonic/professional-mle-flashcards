import React from 'react';
import {
    Box,
    Button,
    Card,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Flag } from 'lucide-react';
import { studyCardWrapperSx } from '../../lib/studyCardStyles';
import { ExamNavHeader } from './ExamNavHeader';

interface ExamFlagReviewProps {
    questionCount: number;
    flaggedIds: Set<string>;
    questionIds: string[];
    locked: boolean;
    remainingMs: number;
    onPrevious: () => void;
    onJumpToQuestion: (index: number) => void;
    onSubmit: () => void;
}

export const ExamFlagReview: React.FC<ExamFlagReviewProps> = ({
    questionCount,
    flaggedIds,
    questionIds,
    locked,
    remainingMs,
    onPrevious,
    onJumpToQuestion,
    onSubmit,
}) => {
    return (
        <Box sx={studyCardWrapperSx}>
            <Stack spacing={2}>
                <ExamNavHeader
                    label="Final Review"
                    remainingMs={remainingMs}
                    progress={100}
                    previousDisabled={locked}
                    nextDisabled
                    skipDisabled
                    onPrevious={onPrevious}
                    onNext={() => undefined}
                    onSkipToEnd={() => undefined}
                />
                <Typography variant="body2" color="text.secondary">
                    {locked
                        ? 'Time is up. Your answers are locked.'
                        : 'Review your answers and flags, then submit the exam. Click a question number to go back and change an answer.'}
                </Typography>
                <Card>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Question</TableCell>
                                <TableCell>Flagged</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questionIds.map((id, index) => {
                                const isFlagged = flaggedIds.has(id);
                                return (
                                    <TableRow
                                        key={id}
                                        hover={!locked}
                                        onClick={
                                            locked
                                                ? undefined
                                                : () => onJumpToQuestion(index)
                                        }
                                        sx={{
                                            cursor: locked
                                                ? 'default'
                                                : 'pointer',
                                        }}
                                    >
                                        <TableCell>
                                            {locked ? (
                                                index + 1
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        onJumpToQuestion(index);
                                                    }}
                                                >
                                                    {index + 1}
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isFlagged ? (
                                                <Stack
                                                    direction="row"
                                                    spacing={0.75}
                                                    sx={{
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Flag size={14} />
                                                    <span>Yes</span>
                                                </Stack>
                                            ) : (
                                                'No'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
                <Box>
                    <Button variant="contained" onClick={onSubmit}>
                        {locked ? 'See results' : 'Submit Exam'}
                    </Button>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {questionCount} questions
                </Typography>
            </Stack>
        </Box>
    );
};
