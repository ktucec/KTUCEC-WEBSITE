import { apiFetch } from "@/lib/api";

export function loginAdmin(email, password) {
    return apiFetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
}

export function verifyCode(email, code) {
    return apiFetch("/api/auth/verify-code", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, code }),
    });
}

export function getMe() {
    return apiFetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
    });
}

export function refreshToken() {
    return apiFetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
    });
}

export function logoutAdmin() {
    return apiFetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });
}

export function getAllManagers() {
    return apiFetch("/api/auth/managers");
}

export function getManagersCount() {
    return apiFetch("/api/auth/managers/count", {
        method: "GET",
        credentials: "include",
    });
}

export function createManager(data) {
    return apiFetch("/api/auth/managers", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

export function updateManager(data) {
    return apiFetch(`/api/auth/managers/update`, {
        method: "PATCH",
        credentials: "include",
        body: data,
    });
}

export function deleteManager(id) {
    return apiFetch(`/api/auth/managers/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}

export function verifyManagerUpdate() {
    return apiFetch("/api/auth/managers/verify-update", {
        method: "POST",
        credentials: "include",
    });
}