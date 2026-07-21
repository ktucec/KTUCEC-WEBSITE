import { apiFetch } from "@/lib/api";

// Get contact forms
export function getContactForms() {
    return apiFetch("/api/contact", {
        credentials: "include"
    });
}

// Submit contact form
export function sendContactForm(data) {
    return apiFetch("/api/contact", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// Delete contact form message
export function deleteContactForm(id) {
    return apiFetch(`/api/contact/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}