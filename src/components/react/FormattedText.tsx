import React from 'react';
import type { TypographyProps } from '@mui/material/Typography';
import { Typography } from '@mui/material';
import { formatText } from '../../lib/textFormatting';

const wrapSx = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    maxWidth: '100%',
} as const;

interface FormattedTextProps extends TypographyProps {
    text: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
    text,
    sx,
    ...props
}) => (
    <Typography sx={{ ...wrapSx, ...sx }} {...props}>
        {formatText(text)}
    </Typography>
);

export const formattedTextSx = wrapSx;
