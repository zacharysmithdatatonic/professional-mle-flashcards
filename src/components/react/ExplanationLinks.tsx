import React from 'react';
import { Link, Stack, Typography } from '@mui/material';
import { ExternalLink } from 'lucide-react';

interface ExplanationLinksProps {
    links: string[];
}

export const ExplanationLinks: React.FC<ExplanationLinksProps> = ({
    links,
}) => {
    if (!links.length) return null;

    return (
        <Stack spacing={0.75} sx={{ pt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
                Supporting materials
            </Typography>
            <Stack spacing={0.5} component="ul" sx={{ m: 0, pl: 2 }}>
                {links.map(url => (
                    <Typography
                        key={url}
                        component="li"
                        variant="body2"
                        sx={{ wordBreak: 'break-all' }}
                    >
                        <Link
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            {url}
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                        </Link>
                    </Typography>
                ))}
            </Stack>
        </Stack>
    );
};
