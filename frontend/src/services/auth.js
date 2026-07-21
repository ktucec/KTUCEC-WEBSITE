import { apiFetch } from "@/lib/api";

// Admin login
export function loginAdmin(email, password) {
    return apiFetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
}

// Verify OTP code
export function verifyCode(email, code) {
    return apiFetch("/api/auth/verify-code", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, code }),
    });
}

// Get system role
export function getSystemRole() {
    return apiFetch("/api/auth/system-role", {
        method: "GET",
        credentials: "include",
    });
}

// Refresh token
export function refreshToken() {
    return apiFetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
    });
}

// Admin logout
export function logoutAdmin() {
    return apiFetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });
}