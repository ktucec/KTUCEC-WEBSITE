import { apiFetch } from "@/lib/api";

// Get current events
export function getCurrentEvents() {
    return apiFetch("/api/currentevents");
}

// Get All events
export function getAllEvents() {
    return apiFetch("/api/events");
}

// Get single event by ID
export function getEventById(id) {
    return apiFetch(`/api/events/${id}`, {
        credentials: "include"
    });
}

// Get events count
export function getEventsCount() {
    return apiFetch("/api/events/count", {
        credentials: "include"
    });
}

// Add new event (Data is FormData)
export function addEvent(data) {
    return apiFetch("/api/events", {
        method: "POST",
        credentials: "include",
        body: data, 
    });
}

// Update event (Data is FormData)
export function updateEvent(id, data) {
    return apiFetch(`/api/events/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: data,
    });
}

// Delete event
export function deleteEvent(id) {
    return apiFetch(`/api/events/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}