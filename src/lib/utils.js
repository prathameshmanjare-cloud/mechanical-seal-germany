import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn helper: join class names, letting later Tailwind classes override earlier ones.
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
