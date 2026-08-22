import { apiFetch } from "@/lib/api";

// 1. Get single form by ID
export function getFormById(formId) {
    return apiFetch(`/api/forms/${formId}`, {
        credentials: "include"
    });
}

// 2. Add application to a form
export function submitFormApplication(formId, data) {
    return apiFetch(`/api/forms/${formId}/applications`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// 3. Create new form (Admin/Manager)
export function createForm(data) {
    return apiFetch("/api/forms", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}

// 4. Get applications of a form (Admin/Manager)
export function getFormApplications(formId) {
    return apiFetch(`/api/forms/${formId}/applications`, {
        credentials: "include"
    });
}

// 5. Get all forms (Admin and Manager)
export function getForms() {
    return apiFetch("/api/forms", {
        credentials: "include"
    });
}

// 6. Delete application (Admin/Manager)
export function deleteFormApplication(applicationId) {
    return apiFetch(`/api/forms/applications/${applicationId}`, {
        method: "DELETE",
        credentials: "include",
    });
}

// 7. Update form (Admin/Manager)
export function updateForm(id, data) {
    return apiFetch(`/api/forms/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(data),
    });
}