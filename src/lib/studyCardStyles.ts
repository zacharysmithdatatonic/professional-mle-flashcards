import type { SxProps, Theme } from '@mui/material';

/**
 * Phones drop the card frame so question and answer text can reflow across the
 * full page width instead of sitting inside nested boxes. The framed look is
 * untouched from the `sm` breakpoint upwards.
 *
 * @param accent palette colour for the card's left edge on larger screens
 */
export const studyCardSx =
    (accent?: 'warning' | 'error') => (theme: Theme) => ({
        overflow: 'hidden',
        ...(accent
            ? { borderLeft: `4px solid ${theme.palette[accent].main}` }
            : {}),
        [theme.breakpoints.down('sm')]: {
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            backgroundColor: 'transparent',
        },
    });

/**
 * Strips the card's inner padding on phones. The `:last-child` rule has to be
 * restated because the theme sets a matching bottom padding at that specificity.
 */
export const studyCardContentSx = (theme: Theme) => ({
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        padding: 0,
        '&:last-child': {
            paddingBottom: 0,
        },
    },
});

/**
 * Memorise mode keeps its card frames on phones because they separate the
 * browsable list of questions, so only the inner padding is tightened.
 */
export const memoriseCardContentSx = (theme: Theme) => ({
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.5),
        '&:last-child': {
            paddingBottom: theme.spacing(1.5),
        },
    },
});

/** Outer inset for a study card; phones rely on the page container's gutters. */
export const studyCardWrapperSx = {
    maxWidth: 720,
    mx: 'auto',
    px: { xs: 0, sm: 2 },
} satisfies SxProps<Theme>;

/** Answer options need tighter side padding to leave room for their text. */
export const studyOptionPaddingSx = {
    px: { xs: 1.5, sm: 3 },
    gap: { xs: 1.5, sm: 2 },
} satisfies SxProps<Theme>;
