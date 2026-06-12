import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { resolveAssetPath } from '../../lib/assets';

export interface ZoomableImage {
    src: string;
    label?: string;
}

interface ZoomableImageModalProps {
    image: ZoomableImage | null;
    onClose: () => void;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;
const VIEWPORT_PADDING = 32;
const HEADER_HEIGHT = 72;

const getViewportLimits = () => ({
    maxWidth: window.innerWidth - VIEWPORT_PADDING * 2,
    maxHeight: window.innerHeight - HEADER_HEIGHT - VIEWPORT_PADDING * 2,
});

const computeBaseFit = (
    naturalWidth: number,
    naturalHeight: number,
    maxWidth: number,
    maxHeight: number
): number => {
    if (naturalWidth <= 0 || naturalHeight <= 0) {
        return 1;
    }
    return Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
};

interface ZoomableImageContentProps {
    image: ZoomableImage;
    onClose: () => void;
}

function ZoomableImageContent({ image, onClose }: ZoomableImageContentProps) {
    const [scale, setScale] = useState(1);
    const [naturalSize, setNaturalSize] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const [viewportLimits, setViewportLimits] = useState(getViewportLimits);

    useEffect(() => {
        const handleResize = () => {
            setViewportLimits(getViewportLimits());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleImageLoad = useCallback(
        (event: React.SyntheticEvent<HTMLImageElement>) => {
            const img = event.currentTarget;
            setNaturalSize({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        },
        []
    );

    const baseFit = useMemo(() => {
        if (!naturalSize) return 1;
        return computeBaseFit(
            naturalSize.width,
            naturalSize.height,
            viewportLimits.maxWidth,
            viewportLimits.maxHeight
        );
    }, [naturalSize, viewportLimits]);

    const displaySize = useMemo(() => {
        if (!naturalSize) return null;
        return {
            width: naturalSize.width * baseFit * scale,
            height: naturalSize.height * baseFit * scale,
        };
    }, [naturalSize, baseFit, scale]);

    return (
        <>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                }}
            >
                <Typography variant="subtitle1" sx={{ color: 'common.white' }}>
                    {image.label || 'Image preview'}
                </Typography>
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'center' }}
                >
                    <IconButton
                        aria-label="Zoom out"
                        onClick={() =>
                            setScale(current =>
                                Math.max(current - SCALE_STEP, MIN_SCALE)
                            )
                        }
                        disabled={scale <= MIN_SCALE}
                        sx={{ color: 'common.white' }}
                    >
                        <ZoomOut size={20} />
                    </IconButton>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'common.white',
                            minWidth: 48,
                            textAlign: 'center',
                        }}
                    >
                        {Math.round(scale * 100)}%
                    </Typography>
                    <IconButton
                        aria-label="Zoom in"
                        onClick={() =>
                            setScale(current =>
                                Math.min(current + SCALE_STEP, MAX_SCALE)
                            )
                        }
                        disabled={scale >= MAX_SCALE}
                        sx={{ color: 'common.white' }}
                    >
                        <ZoomIn size={20} />
                    </IconButton>
                    <IconButton
                        aria-label="Reset zoom"
                        onClick={() => setScale(1)}
                        disabled={scale === 1}
                        sx={{ color: 'common.white' }}
                    >
                        <RotateCcw size={20} />
                    </IconButton>
                    <IconButton
                        aria-label="Close image preview"
                        onClick={onClose}
                        sx={{ color: 'common.white' }}
                    >
                        <X size={22} />
                    </IconButton>
                </Stack>
            </Stack>
            <DialogContent
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    overflow: 'auto',
                }}
            >
                <Box
                    component="img"
                    src={resolveAssetPath(image.src)}
                    alt={image.label || ''}
                    onLoad={handleImageLoad}
                    sx={{
                        display: 'block',
                        width: displaySize ? `${displaySize.width}px` : 'auto',
                        height: displaySize
                            ? `${displaySize.height}px`
                            : 'auto',
                        maxWidth: '100%',
                        maxHeight: `calc(100vh - ${HEADER_HEIGHT + VIEWPORT_PADDING}px)`,
                        objectFit: 'contain',
                        borderRadius: 1,
                    }}
                />
            </DialogContent>
        </>
    );
}

export const ZoomableImageModal: React.FC<ZoomableImageModalProps> = ({
    image,
    onClose,
}) => {
    return (
        <Dialog
            open={Boolean(image)}
            onClose={onClose}
            fullScreen
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.92)',
                    },
                },
            }}
        >
            {image ? (
                <ZoomableImageContent
                    key={image.src}
                    image={image}
                    onClose={onClose}
                />
            ) : null}
        </Dialog>
    );
};
