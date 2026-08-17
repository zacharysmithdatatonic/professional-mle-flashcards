import React, { useMemo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import type { Question } from '../../lib/banks';
import { buildQuestionAnswerIssueUrl } from '../../lib/githubIssues';

interface ReportQuestionIssueButtonProps {
    bankKey: string;
    question: Question;
}

export const ReportQuestionIssueButton: React.FC<
    ReportQuestionIssueButtonProps
> = ({ bankKey, question }) => {
    const href = useMemo(() => {
        const pageUrl =
            typeof window !== 'undefined' ? window.location.href : undefined;
        return buildQuestionAnswerIssueUrl({ bankKey, question, pageUrl });
    }, [bankKey, question]);

    return (
        <Tooltip title="Report a problem with this question">
            <IconButton
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                aria-label="Report a problem with this question"
                sx={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'transparent',
                    borderRadius: 1,
                    width: 28,
                    height: 28,
                    opacity: 0.7,
                    transition:
                        'opacity 0.15s ease, color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
                    '&:hover': {
                        opacity: 1,
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                    },
                }}
            >
                !?
            </IconButton>
        </Tooltip>
    );
};
