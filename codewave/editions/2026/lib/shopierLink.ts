// Shopier ürün bağlantıları. Ziyaretçi yalnızca shopier.com üzerindeki https bağlantılarına yönlendirilir.

export function isShopierUrl(value: unknown): value is string {
    if (typeof value !== 'string' || value.length > 512) return false;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && (url.hostname === 'shopier.com' || url.hostname.endsWith('.shopier.com'));
    } catch {
        return false;
    }
}

// İndirimsiz bilet: Shopier'deki herkese açık bilet ürününün bağlantısı. YALNIZCA sunucuda okunur.
// Boşsa ya da shopier.com bağlantısı değilse bilet satışı kapalı görünür.
export function getPublicProductUrl(): string | null {
    const url = process.env.SHOPIER_PRODUCT_URL?.trim();
    return isShopierUrl(url) ? url : null;
}
