import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function minutesToReadable(minutes: number) {
  if (!minutes) return "0分";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
}

export function getInitials(name?: string | null) {
  if (!name) return "F";
  return name.trim().slice(0, 2).toUpperCase();
}
