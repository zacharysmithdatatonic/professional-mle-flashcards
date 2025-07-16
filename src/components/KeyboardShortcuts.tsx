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
    const btnRef = useRef<HTMLButtonElement>(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                keyboardHelpRef.current &&
                !keyboardHelpRef.current.contains(event.target as Node) &&
                btnRef.current &&
                !btnRef.current.contains(event.target as Node) &&
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
        <div className={`keyboard-shortcuts ${className}`}>
            <button
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                className="header-metrics-btn"
                ref={btnRef}
                title="Toggle keyboard shortcuts"
                aria-haspopup="true"
                aria-expanded={showKeyboardHelp}
            >
                <Keyboard size={20} />
            </button>
            {showKeyboardHelp && (
                <div
                    className="header-metrics-dropdown"
                    ref={keyboardHelpRef}
                    tabIndex={-1}
                    role="menu"
                >
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
