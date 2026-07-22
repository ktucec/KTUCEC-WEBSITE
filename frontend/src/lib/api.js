const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function rawRequest(path, options) {
    let res;

    const isFormData = options.body instanceof FormData;

    try {
        res = await fetch(`${API_URL}${path}`, {
            ...options,
            credentials: "include",
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers,
            },
        });
    } catch (networkErr) {
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

    if (res.status === 401 && !_isRetry && !path.includes("/api/auth/refresh")) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return apiFetch(path, options, true);
        }
        if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
        }
        throw new ApiError("Oturum süreniz doldu, lütfen tekrar giriş yapın.", 401);
    }

    if (!res.ok) {
        if (body && typeof body.message === "string") {
            throw new ApiError(body.message, res.status, body.isSuccess ?? false);
        }
        if (res.status >= 500) {
            throw new ApiError(
                "Sunucu tarafında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
                res.status
            );
        }
        throw new ApiError(`İstek başarısız oldu (${res.status}).`, res.status);
    }

    if (body && body.isSuccess === false) {
        throw new ApiError(body.message || "İşlem başarısız oldu.", res.status, false);
    }

    if (res.status === 204 || body === null) return null;

    return body !== undefined ? body : body;
}