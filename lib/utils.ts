import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number with thousands separator
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Format large numbers (e.g., volume, market cap)
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + '万亿'
  }
  if (num >= 1e8) {
    return (num / 1e8).toFixed(2) + '亿'
  }
  if (num >= 1e4) {
    return (num / 1e4).toFixed(2) + '万'
  }
  return num.toLocaleString('zh-CN')
}

// Format percentage
export function formatPercent(num: number): string {
  const sign = num >= 0 ? '+' : ''
  return sign + num.toFixed(2) + '%'
}

// Format currency
export function formatCurrency(num: number, currency: 'CNY' | 'HKD' | 'USD' = 'CNY'): string {
  const symbols = { CNY: '¥', HKD: 'HK$', USD: '$' }
  return symbols[currency] + formatNumber(num)
}

// Generate random price change for simulation
export function generatePriceChange(basePrice: number, volatility: number = 0.02): number {
  const change = (Math.random() - 0.5) * 2 * volatility * basePrice
  return basePrice + change
}

// Local storage helpers
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error('Failed to save to localStorage')
  }
}
