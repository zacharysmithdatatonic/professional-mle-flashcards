/**
 * Processes text to add proper line breaks for better formatting
 * @param text - The text to process
 * @returns The processed text with proper line breaks
 */
export const formatText = (text: string): string => {
    if (!text) return text;

    return (
        text
            // First, replace literal \n with actual newlines
            .replace(/\\n/g, '\n')
            // Add newlines before numbered lists (1., 2., 3., etc.)
            .replace(/(\s)(\d+\.\s)/g, '$1\n$2')
            // Add newlines before lettered lists (a., b., c., etc.)
            .replace(/(\s)([a-z]\.\s)/g, '$1\n$2')
            // Add newlines before capital lettered lists (A., B., C., etc.)
            .replace(/(\s)([A-Z]\.\s)/g, '$1\n$2')
            // Add newlines before common bullet points
            .replace(/(\s)(•\s)/g, '$1\n$2')
            .replace(/(\s)(-\s)/g, '$1\n$2')
            .replace(/(\s)(\*\s)/g, '$1\n$2')
            // Add newlines before Roman numerals (i., ii., iii., etc.)
            .replace(/(\s)(i{1,3}v?|iv|v|vi{1,3}|ix|x)\.\s/g, '$1\n$2. ')
            // Add newlines before capital Roman numerals (I., II., III., etc.)
            .replace(/(\s)(I{1,3}V?|IV|V|VI{1,3}|IX|X)\.\s/g, '$1\n$2. ')
            // Clean up multiple consecutive newlines
            .replace(/\n\n+/g, '\n\n')
            // Trim whitespace from the beginning and end
            .trim()
    );
};
