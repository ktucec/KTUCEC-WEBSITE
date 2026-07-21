import { apiFetch } from "@/lib/api";

// Add new event
export function addEvent(data) {
    return apiFetch("/api/events", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// Update event
export function updateEvent(id, data) {
    return apiFetch(`/api/events/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// Delete event
export function deleteEvent(id) {
    return apiFetch(`/api/events/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}