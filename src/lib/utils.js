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

  if (event.waktuSelesai && typeof event.waktuSelesai === "string" && event.waktuSelesai.includes(":")) {
    const [hours, minutes] = event.waktuSelesai.split(":").map(Number);
    const endDateTime = new Date(endDateStr);
    endDateTime.setHours(hours || 0, minutes || 0, 0, 0);
    if (!isNaN(endDateTime.getTime())) {
      return endDateTime < now;
    }
  }

  const endDateTime = new Date(endDateStr);
  endDateTime.setHours(23, 59, 59, 999);
  return endDateTime < now;
};