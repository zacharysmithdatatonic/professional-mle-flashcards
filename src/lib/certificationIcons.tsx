import React from 'react';
import {
    BookOpen,
    Brain,
    Cloud,
    Code,
    Database,
    Network,
    Settings,
    Shield,
    Sparkles,
    Users,
} from 'lucide-react';

export const getCertificationIcon = (key: string, size: number = 24) => {
    const iconProps = { size, strokeWidth: 1.5 };
    switch (key) {
        case 'cdl':
            return <Cloud {...iconProps} />;
        case 'genai':
            return <Sparkles {...iconProps} />;
        case 'ace':
            return <Cloud {...iconProps} />;
        case 'adp':
            return <Database {...iconProps} />;
        case 'agwa':
            return <Users {...iconProps} />;
        case 'pca':
            return <Cloud {...iconProps} />;
        case 'pcde':
            return <Database {...iconProps} />;
        case 'pcd':
            return <Code {...iconProps} />;
        case 'pde':
            return <Database {...iconProps} />;
        case 'pcdo':
            return <Settings {...iconProps} />;
        case 'pcse':
            return <Shield {...iconProps} />;
        case 'pcne':
            return <Network {...iconProps} />;
        case 'pmle':
            return <Brain {...iconProps} />;
        case 'psoe':
            return <Shield {...iconProps} />;
        default:
            return <BookOpen {...iconProps} />;
    }
};
