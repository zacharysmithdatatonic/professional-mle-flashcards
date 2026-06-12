const joinBasePath = (assetPath: string) => {
    const normalizedPath = assetPath.startsWith('/')
        ? assetPath
        : `/${assetPath}`;
    const base = import.meta.env.BASE_URL || '/';
    if (base === '/') {
        return normalizedPath;
    }
    const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
    return `${baseWithSlash}${normalizedPath.slice(1)}`;
};

export const getAssetUrl = (assetPath: string) => joinBasePath(assetPath);

export const resolveAssetPath = (assetPath?: string | null) => {
    if (!assetPath) return '';
    if (/^(https?:)?\/\//i.test(assetPath)) return assetPath;
    if (assetPath.startsWith('data:')) return assetPath;
    return getAssetUrl(assetPath);
};
