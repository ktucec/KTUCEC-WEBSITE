export function formatDate(dateString) {
    if (!dateString) return "";

    const isoSafe = dateString.replace(" ", "T");
    const date = new Date(isoSafe);

    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}