import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    /** Styles the confirm action as destructive (e.g. reset / delete). */
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    message,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onCancel}>
                    {cancelText}
                </Button>
                <Button
                    variant="contained"
                    color={destructive ? 'error' : 'primary'}
                    onClick={onConfirm}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
