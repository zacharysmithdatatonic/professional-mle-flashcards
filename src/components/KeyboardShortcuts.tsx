import React, { useState, useEffect, useRef } from 'react';
import { Keyboard } from 'lucide-react';

export interface ShortcutItem {
    key: string;
    description: string;
}

interface KeyboardShortcutsProps {
    shortcuts: ShortcutItem[];
    className?: string;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
    shortcuts,
    className = '',
}) => {
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const keyboardHelpRef = useRef<HTMLDivElement>(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                keyboardHelpRef.current &&
                !keyboardHelpRef.current.contains(event.target as Node) &&
                showKeyboardHelp
            ) {
                setShowKeyboardHelp(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showKeyboardHelp]);

    // Handle ? key press
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (
                event.key === '?' &&
                !(
                    event.target instanceof HTMLInputElement ||
                    event.target instanceof HTMLTextAreaElement
                )
            ) {
                event.preventDefault();
                setShowKeyboardHelp(!showKeyboardHelp);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showKeyboardHelp]);

    return (
        <div
            className={`keyboard-shortcuts ${className}`}
            ref={keyboardHelpRef}
        >
            <button
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                className="keyboard-help-toggle"
                title="Toggle keyboard shortcuts"
            >
                <Keyboard size={16} />
            </button>
            {showKeyboardHelp && (
                <div className="keyboard-help keyboard-help-fixed">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="shortcut-item">
                            <span className="key">{shortcut.key}</span>
                            <span>{shortcut.description}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
