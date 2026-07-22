import { apiFetch } from "@/lib/api";

// Get all announcements
export function getAnnouncements() {
    return apiFetch("/api/announcements", {
        credentials: "include"
    });
}

// Get single announcement by ID
export function getAnnouncementById(id) {
    return apiFetch(`/api/announcements/${id}`, {
        credentials: "include"
    });
}

// Get latest N announcements
export function getLatestAnnouncements(count = 3) {
    return apiFetch(`/api/announcements/latest?count=${count}`, {
        credentials: "include"
    });
}

// Add new announcement
export function addAnnouncement(data) {
    return apiFetch("/api/announcements", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// Update announcement
export function updateAnnouncement(id, data) {
    return apiFetch(`/api/announcements/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// Delete announcement
export function deleteAnnouncement(id) {
    return apiFetch(`/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}