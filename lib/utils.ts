import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number, opts: Intl.DateTimeFormatOptions = {}) {
    return new Intl.DateTimeFormat("en-US", {
        month: opts.month ?? "long",
        day: opts.day ?? "numeric",
        year: opts.year ?? "numeric",
        ...opts,
    }).format(new Date(date));
}

export const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .split(/\s+/)
        .slice(0, 30)
        .join("-");
};
