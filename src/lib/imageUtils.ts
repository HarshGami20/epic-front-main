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
