import { apiFetch } from "@/lib/api";

export function getAnnouncements() {
  return apiFetch("/api/announcements");
}