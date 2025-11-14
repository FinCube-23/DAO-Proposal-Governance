import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const STATUS_BADGE_CONFIG = {
  success: { label: 'Success', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  reverted: { label: 'Reverted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  replaced: { label: 'Replaced', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
} as const;
