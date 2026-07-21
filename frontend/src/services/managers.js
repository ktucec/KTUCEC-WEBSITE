import { apiFetch } from "@/lib/api";

// Get all managers
export function getManagers() {
    return apiFetch("/api/auth/managers", {
        credentials: "include"
    });
}

// Create manager
export function createManager(data) {
    return apiFetch("/api/auth/managers", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// Update manager
export function updateManager(id, data) {
    return apiFetch(`/api/auth/managers/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// Delete manager
export function deleteManager(id) {
    return apiFetch(`/api/auth/managers/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}