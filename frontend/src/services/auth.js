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
    return apiFetch("/api/auth/managers", {
        method: "GET",
        credentials: "include",
    });
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
        body: data,
    });
}

export function updateManager(id, data) {
    return apiFetch(`/api/auth/managers/${id}`, {
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