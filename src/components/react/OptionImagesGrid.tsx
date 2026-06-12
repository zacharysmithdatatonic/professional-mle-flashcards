import React, { useMemo, useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { resolveAssetPath } from '../../lib/assets';
import { ZoomableImageModal, type ZoomableImage } from './ZoomableImageModal';

interface OptionImagesGridProps {
    optionImages: Array<string | null>;
}

export const hasOptionImages = (optionImages?: Array<string | null>): boolean =>
    optionImages?.some(Boolean) ?? false;

export const OptionImagesGrid: React.FC<OptionImagesGridProps> = ({
    optionImages,
}) => {
    const [activeImage, setActiveImage] = useState<ZoomableImage | null>(null);

    const items = useMemo(
        () =>
            optionImages
                .map((image, index) =>
                    image
                        ? {
                              index,
                              label: String.fromCharCode(65 + index),
                              src: image,
                          }
                        : null
                )
                .filter(
                    (
                        item
                    ): item is { index: number; label: string; src: string } =>
                        item !== null
                ),
        [optionImages]
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <>
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Option images
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: {
                            xs: 'repeat(2, minmax(0, 1fr))',
                            sm: 'repeat(auto-fit, minmax(140px, 1fr))',
                        },
                    }}
                >
                    {items.map(item => (
                        <Box
                            key={`${item.label}-${item.index}`}
                            component="button"
                            type="button"
                            onClick={() =>
                                setActiveImage({
                                    src: item.src,
                                    label: `Option ${item.label}`,
                                })
                            }
                            sx={{
                                appearance: 'none',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                p: 1,
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                                minWidth: 0,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                                '&:focus, &:focus-visible, &:active': {
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    outline: 'none',
                                },
                            }}
                        >
                            <Chip
                                label={item.label}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 1 }}
                            />
                            <Box
                                component="img"
                                src={resolveAssetPath(item.src)}
                                alt={`Option ${item.label}`}
                                sx={{
                                    display: 'block',
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: 120,
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    bgcolor: 'background.default',
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
            <ZoomableImageModal
                image={activeImage}
                onClose={() => setActiveImage(null)}
            />
        </>
    );
};
