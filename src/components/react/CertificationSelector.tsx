import React from 'react';
import { Box, Container, Typography, Stack, Button, Chip } from '@mui/material';
import type { QuestionBank, CertificationTier } from '../../lib/banks';
import {
    CERTIFICATION_TIERS,
    getBankBasePath,
    getBanksByTier,
} from '../../lib/banks';
import { getAssetUrl } from '../../lib/assets';
import { Lock } from 'lucide-react';
import { getCertificationIcon } from '../../lib/certificationIcons';
import { ReactProviders } from './ReactProviders';

const CertificationItem: React.FC<{ bank: QuestionBank }> = ({ bank }) => {
    const href = bank.available ? getBankBasePath(bank) : undefined;

    return (
        <Button
            component={href ? 'a' : 'button'}
            href={href}
            disabled={!bank.available}
            variant="text"
            sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                padding: '0.35rem 0',
                minHeight: 32,
                overflow: 'hidden',
                alignItems: 'center',
                color: bank.available ? 'text.primary' : 'text.disabled',
                '& .MuiButton-startIcon': {
                    marginLeft: 1,
                    marginRight: 1,
                },
            }}
            startIcon={
                <Box
                    sx={{
                        color: bank.available ? bank.color : 'text.disabled',
                    }}
                >
                    {getCertificationIcon(bank.key, 18)}
                </Box>
            }
        >
            <Stack spacing={0.25} sx={{ alignItems: 'flex-start' }}>
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: 'center' }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {bank.name}
                    </Typography>
                    {bank.beta && (
                        <Chip
                            label="Beta"
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                bgcolor: '#e8f0fe',
                                color: '#1a73e8',
                                border: '1px solid #cce0ff',
                                '& .MuiChip-label': {
                                    px: 0.6,
                                },
                            }}
                        />
                    )}
                </Stack>
                {!bank.available && (
                    <Typography variant="caption" color="text.secondary">
                        <Lock size={12} /> Coming soon
                    </Typography>
                )}
            </Stack>
        </Button>
    );
};

const TierColumn: React.FC<{
    tier: CertificationTier;
    banks: QuestionBank[];
}> = ({ tier, banks }) => {
    const tierInfo = CERTIFICATION_TIERS[tier];

    return (
        <Box
            sx={{
                borderLeft: '4px solid',
                borderColor: tierInfo.color,
                pl: 2,
                py: 1,
            }}
        >
            <Stack spacing={1.5}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {tierInfo.name} certification
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {tierInfo.description}
                    </Typography>
                </Box>
                <Typography variant="overline" color="text.secondary">
                    Role
                </Typography>
                <Stack spacing={0.5}>
                    {banks.map(bank => (
                        <CertificationItem key={bank.key} bank={bank} />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
};

function CertificationSelectorContent() {
    const tiers: CertificationTier[] = [
        'foundational',
        'associate',
        'professional',
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    <Stack spacing={2} sx={{ alignItems: 'center' }}>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: 'center' }}
                        >
                            <Box
                                component="img"
                                src={getAssetUrl('/logo.png')}
                                alt="Certification Flashcards logo"
                                sx={{ width: 40, height: 40 }}
                            />
                            <Box>
                                <Typography variant="h4">
                                    Google Cloud
                                </Typography>
                                <Typography variant="h5" color="text.secondary">
                                    Certification Flashcards
                                </Typography>
                            </Box>
                        </Stack>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ textAlign: 'center', maxWidth: 700 }}
                        >
                            Choose your certification track to start studying
                            with focused flashcards tailored to the exam.
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            display: 'grid',
                            gap: 3,
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(3, 1fr)',
                            },
                        }}
                    >
                        {tiers.map(tier => (
                            <TierColumn
                                key={tier}
                                tier={tier}
                                banks={getBanksByTier(tier)}
                            />
                        ))}
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export function CertificationSelector() {
    return (
        <ReactProviders>
            <CertificationSelectorContent />
        </ReactProviders>
    );
}
