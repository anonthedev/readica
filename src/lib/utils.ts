import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function turnacateString(string: string | undefined, length: number) {
  if (string === undefined) {
    return "";
  }
  return string.length > length ? string.slice(0, length) + "..." : string;
}
