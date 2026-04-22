import { getPublicAssetOrigin } from "@/lib/env";

export function getImageUrl(imagePath: string | any | null | undefined): string | any {
    if (!imagePath) {
        return '/assets/images/default.jpg'; // Just a fallback
    }

    if (typeof imagePath === 'object') {
        return imagePath; // Return Next.js StaticImageData objects natively
    }

    if (typeof imagePath !== 'string') {
        return imagePath;
    }

    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's a base64 data URL, return as-is
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }

    // If it's a relative path starting with /uploads, prepend the API base URL
    if (imagePath.startsWith('/uploads/')) {
        return `${getPublicAssetOrigin()}${imagePath}`;
    }

    // Return as-is for other relative paths
    return imagePath;
}

/** Same URL rules as images: full URL, `/uploads/...` → asset origin, else relative (e.g. `/assets/...`). */
export function resolvePublicMediaUrl(path: string | null | undefined): string {
    if (path == null || typeof path !== "string") {
        return "";
    }
    const trimmed = path.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    if (trimmed.startsWith("//")) {
        return `https:${trimmed}`;
    }
    if (trimmed.startsWith("data:")) {
        return trimmed;
    }
    let pathPart = trimmed;
    if (pathPart.startsWith("uploads/")) {
        pathPart = `/${pathPart}`;
    }
    if (pathPart.startsWith("/uploads/")) {
        return `${getPublicAssetOrigin()}${pathPart}`;
    }
    return trimmed;
}

/**
 * Rewrites <img src="..."> in CMS HTML (e.g. Quill) so upload paths resolve to the public asset origin.
 */
export function rewriteHtmlImageSources(html: string): string {
    if (!html || typeof html !== "string") return "";
    return html.replace(/<img\b([^>]*?)\/?>/gi, (_full, attrs: string) => {
        const next = attrs.replace(
            /\bsrc\s*=\s*(["'])([^"']*)\1/i,
            (_m: string, quote: string, src: string) => {
                const resolved = resolvePublicMediaUrl(src.trim()) || src;
                return `src=${quote}${resolved}${quote}`;
            },
        );
        return `<img ${next.trim()}>`;
    });
}
