const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Custom error sınıfı - component'lerde status'e göre de karar verebilmek için
export class ApiError extends Error {
    constructor(message, status, isSuccess = false) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.isSuccess = isSuccess;
    }
}

let refreshPromise = null;

async function refreshAccessToken() {
    // Aynı anda 3 istek 401 alırsa hepsi bu tek promise'i paylaşsın,
    // 3 ayrı refresh isteği atılmasın
    if (!refreshPromise) {
        refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.ok)
            .catch(() => false)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

async function parseResponseBody(res) {
    // Body boş olabilir (204) ya da JSON olmayabilir (bazı 500'ler, proxy hataları)
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null; // JSON değil, örn HTML error page
    }
}

async function rawRequest(path, options) {
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
    } catch (networkErr) {
        // fetch kendisi patladıysa (sunucu kapalı, DNS, CORS, offline)
        throw new ApiError(
            "Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.",
            0
        );
    }
    return res;
}

export async function apiFetch(path, options = {}, _isRetry = false) {
    const res = await rawRequest(path, options);
    const body = await parseResponseBody(res);

    // --- 401: refresh dene, sonra AYNI isteği bir kere daha at ---
    if (res.status === 401 && !_isRetry && !path.includes("/api/auth/refresh")) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return apiFetch(path, options, true); // sadece 1 kez retry, sonsuz döngü yok
        }
        // refresh de başarısızsa oturum gerçekten bitmiş demektir
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new ApiError("Oturum süreniz doldu, lütfen tekrar giriş yapın.", 401);
    }

    // --- Diğer tüm hata statusleri (400, 403, 404, 500...) ---
    if (!res.ok) {
        // Backend ApiResult formatında body döndüyse mesajı kullan
        if (body && typeof body.message === "string") {
            throw new ApiError(body.message, res.status, body.isSuccess ?? false);
        }
        // Body yok ya da JSON değilse (örn IIS default 500 sayfası)
        if (res.status >= 500) {
            throw new ApiError(
                "Sunucu tarafında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
                res.status
            );
        }
        throw new ApiError(`İstek başarısız oldu (${res.status}).`, res.status);
    }

    // --- Başarılı ama body isSuccess: false döndüyse (senin backend'de olmamalı ama garanti olsun) ---
    if (body && body.isSuccess === false) {
        throw new ApiError(body.message || "İşlem başarısız oldu.", res.status, false);
    }

    if (res.status === 204 || body === null) return null;

    // data alanı varsa unwrap et, yoksa (örn sade obje dönen custom endpoint) body'nin kendisini dön
    return body.data !== undefined ? body : body;
}