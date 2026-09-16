import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCamelCaseLabel = (text) => {
  if (!text) return "-";

  return text
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2")
    .trim();
}

export const isEventPast = (event) => {
  if (!event) return false;
  const now = new Date();

  const endDateStr = event.tanggalBerakhir || event.tanggal;
  if (!endDateStr) return false;

  let y, m, d;
  if (typeof endDateStr === "string") {
    const cleanDate = endDateStr.split("T")[0];
    const parts = cleanDate.split("-").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      [y, m, d] = parts;
    }
  }

  let endDateTime;
  if (y && m && d) {
    if (event.waktuSelesai && typeof event.waktuSelesai === "string" && event.waktuSelesai.includes(":")) {
      const [hours, minutes] = event.waktuSelesai.split(":").map(Number);
      endDateTime = new Date(y, m - 1, d, hours || 0, minutes || 0, 0, 0);
    } else {
      endDateTime = new Date(y, m - 1, d, 23, 59, 59, 999);
    }
  } else {
    endDateTime = new Date(endDateStr);
    if (event.waktuSelesai && typeof event.waktuSelesai === "string" && event.waktuSelesai.includes(":")) {
      const [hours, minutes] = event.waktuSelesai.split(":").map(Number);
      endDateTime.setHours(hours || 0, minutes || 0, 0, 0);
    } else {
      endDateTime.setHours(23, 59, 59, 999);
    }
  }

  return !isNaN(endDateTime.getTime()) && endDateTime < now;
};