export const formatText = (text: string): string => {
    if (!text) return text;

    return text
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[^\S\n]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/(\s)(\d+\.\s)/g, '$1\n$2')
        .replace(/(\s)([a-z]\.\s)/g, '$1\n$2')
        .replace(/(\s)([A-Z]\.\s)/g, '$1\n$2')
        .replace(/(\s)(•\s)/g, '$1\n$2')
        .replace(/(\s)(-\s)/g, '$1\n$2')
        .replace(/(\s)(\*\s)/g, '$1\n$2')
        .replace(/(\s)(i{1,3}v?|iv|v|vi{1,3}|ix|x)\.\s/g, '$1\n$2. ')
        .replace(/(\s)(I{1,3}V?|IV|V|VI{1,3}|IX|X)\.\s/g, '$1\n$2. ')
        .replace(/\n\n+/g, '\n\n')
        .trim();
};

export const getOptionDisplayText = (option: string, index: number): string => {
    if (option.trim()) {
        return option;
    }
    return `Select option ${String.fromCharCode(65 + index)}`;
};
