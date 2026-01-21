// Types for market data

export type MarketType = 'A_STOCK' | 'HK_STOCK' | 'CRYPTO'

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  turnover: number
  marketCap?: number
  pe?: number
  sparkline?: number[]
  market: MarketType
  currency: 'CNY' | 'HKD' | 'USD'
}

export interface IndexData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  sparkline?: number[]
}

export interface CryptoData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high24h: number
  low24h: number
  volume24h: number
  marketCap: number
  sparkline?: number[]
  currency: 'USD'
}

export interface MarketSummary {
  totalVolume: number
  advancers: number
  decliners: number
  unchanged: number
  lastUpdate: Date
}

export interface WatchlistItem {
  symbol: string
  market: MarketType
  addedAt: Date
}
