import React from 'react';
import { Box, Link, Stack, Typography } from '@mui/material';
import { BookOpen, ExternalLink } from 'lucide-react';
import type { CaseStudy } from '../../lib/banks';

interface CaseStudyCalloutProps {
    caseStudy: CaseStudy;
}

export const CaseStudyCallout: React.FC<CaseStudyCalloutProps> = ({
    caseStudy,
}) => (
    <Box
        sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
        }}
    >
        <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'flex-start', minWidth: 0 }}
        >
            <BookOpen size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography variant="body2" color="text.secondary" component="div">
                For this question, refer to the{' '}
                <Link
                    href={caseStudy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: 600,
                    }}
                >
                    {caseStudy.name} case study
                    <ExternalLink size={12} />
                </Link>
                .
            </Typography>
        </Stack>
    </Box>
);
