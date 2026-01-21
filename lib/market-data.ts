import { StockData, IndexData, CryptoData, MarketType } from './types'

// Generate random sparkline data
function generateSparkline(length: number = 20, basePrice: number = 100): number[] {
  const data: number[] = []
  let price = basePrice
  for (let i = 0; i < length; i++) {
    price = price * (1 + (Math.random() - 0.5) * 0.02)
    data.push(Number(price.toFixed(2)))
  }
  return data
}

// A股指数数据
export const aShareIndices: IndexData[] = [
  {
    symbol: '000001.SH',
    name: '上证指数',
    price: 3089.26,
    change: 15.32,
    changePercent: 0.50,
    volume: 324500000000,
    sparkline: generateSparkline(20, 3070),
  },
  {
    symbol: '399001.SZ',
    name: '深证成指',
    price: 9856.78,
    change: -23.45,
    changePercent: -0.24,
    volume: 412300000000,
    sparkline: generateSparkline(20, 9880),
  },
  {
    symbol: '399006.SZ',
    name: '创业板指',
    price: 1923.45,
    change: 8.67,
    changePercent: 0.45,
    volume: 189600000000,
    sparkline: generateSparkline(20, 1915),
  },
]

// 港股指数数据
export const hkIndices: IndexData[] = [
  {
    symbol: 'HSI',
    name: '恒生指数',
    price: 16589.43,
    change: -156.78,
    changePercent: -0.94,
    volume: 98700000000,
    sparkline: generateSparkline(20, 16750),
  },
  {
    symbol: 'HSTECH',
    name: '恒生科技指数',
    price: 3456.78,
    change: 23.45,
    changePercent: 0.68,
    volume: 45600000000,
    sparkline: generateSparkline(20, 3430),
  },
]

// A股热门股票
export const aShareStocks: StockData[] = [
  {
    symbol: '600519',
    name: '贵州茅台',
    price: 1689.00,
    change: 12.50,
    changePercent: 0.75,
    open: 1676.50,
    high: 1695.00,
    low: 1673.00,
    volume: 2890000,
    turnover: 4876000000,
    marketCap: 2123000000000,
    pe: 33.5,
    sparkline: generateSparkline(20, 1680),
    market: 'A_STOCK',
    currency: 'CNY',
  },
  {
    symbol: '000858',
    name: '五粮液',
    price: 156.78,
    change: -2.34,
    changePercent: -1.47,
    open: 159.12,
    high: 160.50,
    low: 155.20,
    volume: 12560000,
    turnover: 1968000000,
    marketCap: 608000000000,
    pe: 25.8,
    sparkline: generateSparkline(20, 158),
    market: 'A_STOCK',
    currency: 'CNY',
  },
  {
    symbol: '601318',
    name: '中国平安',
    price: 45.67,
    change: 0.89,
    changePercent: 1.99,
    open: 44.78,
    high: 46.20,
    low: 44.50,
    volume: 45890000,
    turnover: 2089000000,
    marketCap: 832000000000,
    pe: 8.9,
    sparkline: generateSparkline(20, 45),
    market: 'A_STOCK',
    currency: 'CNY',
  },
  {
    symbol: '300750',
    name: '宁德时代',
    price: 198.56,
    change: 5.67,
    changePercent: 2.94,
    open: 192.89,
    high: 201.30,
    low: 191.50,
    volume: 18920000,
    turnover: 3756000000,
    marketCap: 872000000000,
    pe: 28.3,
    sparkline: generateSparkline(20, 195),
    market: 'A_STOCK',
    currency: 'CNY',
  },
  {
    symbol: '600036',
    name: '招商银行',
    price: 32.45,
    change: -0.56,
    changePercent: -1.70,
    open: 33.01,
    high: 33.20,
    low: 32.10,
    volume: 38560000,
    turnover: 1251000000,
    marketCap: 818000000000,
    pe: 5.6,
    sparkline: generateSparkline(20, 33),
    market: 'A_STOCK',
    currency: 'CNY',
  },
  {
    symbol: '601899',
    name: '紫金矿业',
    price: 15.23,
    change: 0.45,
    changePercent: 3.04,
    open: 14.78,
    high: 15.50,
    low: 14.65,
    volume: 89560000,
    turnover: 1364000000,
    marketCap: 402000000000,
    pe: 12.8,
    sparkline: generateSparkline(20, 15),
    market: 'A_STOCK',
    currency: 'CNY',
  },
]

// 港股热门股票
export const hkStocks: StockData[] = [
  {
    symbol: '00700',
    name: '腾讯控股',
    price: 298.60,
    change: 4.80,
    changePercent: 1.63,
    open: 293.80,
    high: 301.20,
    low: 292.40,
    volume: 18920000,
    turnover: 5648000000,
    marketCap: 2856000000000,
    pe: 18.5,
    sparkline: generateSparkline(20, 295),
    market: 'HK_STOCK',
    currency: 'HKD',
  },
  {
    symbol: '09988',
    name: '阿里巴巴-SW',
    price: 78.45,
    change: -1.25,
    changePercent: -1.57,
    open: 79.70,
    high: 80.20,
    low: 77.80,
    volume: 35680000,
    turnover: 2798000000,
    marketCap: 1589000000000,
    pe: 12.3,
    sparkline: generateSparkline(20, 79),
    market: 'HK_STOCK',
    currency: 'HKD',
  },
  {
    symbol: '03690',
    name: '美团-W',
    price: 112.30,
    change: 2.50,
    changePercent: 2.28,
    open: 109.80,
    high: 114.50,
    low: 108.60,
    volume: 24560000,
    turnover: 2758000000,
    marketCap: 689000000000,
    pe: -45.2,
    sparkline: generateSparkline(20, 110),
    market: 'HK_STOCK',
    currency: 'HKD',
  },
  {
    symbol: '01810',
    name: '小米集团-W',
    price: 18.56,
    change: 0.34,
    changePercent: 1.87,
    open: 18.22,
    high: 18.90,
    low: 18.10,
    volume: 156780000,
    turnover: 2909000000,
    marketCap: 463000000000,
    pe: 22.8,
    sparkline: generateSparkline(20, 18.3),
    market: 'HK_STOCK',
    currency: 'HKD',
  },
  {
    symbol: '09618',
    name: '京东集团-SW',
    price: 98.75,
    change: -2.15,
    changePercent: -2.13,
    open: 100.90,
    high: 101.50,
    low: 97.80,
    volume: 12890000,
    turnover: 1273000000,
    marketCap: 305000000000,
    pe: 15.6,
    sparkline: generateSparkline(20, 100),
    market: 'HK_STOCK',
    currency: 'HKD',
  },
]

// 加密货币数据
export const cryptoData: CryptoData[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43256.78,
    change: 1234.56,
    changePercent: 2.94,
    high24h: 43890.00,
    low24h: 41560.00,
    volume24h: 28900000000,
    marketCap: 847000000000,
    sparkline: generateSparkline(20, 42500),
    currency: 'USD',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2256.34,
    change: -45.67,
    changePercent: -1.98,
    high24h: 2320.00,
    low24h: 2210.00,
    volume24h: 12300000000,
    marketCap: 271000000000,
    sparkline: generateSparkline(20, 2280),
    currency: 'USD',
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    price: 312.45,
    change: 8.90,
    changePercent: 2.93,
    high24h: 318.00,
    low24h: 301.00,
    volume24h: 890000000,
    marketCap: 48000000000,
    sparkline: generateSparkline(20, 308),
    currency: 'USD',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 98.67,
    change: 5.43,
    changePercent: 5.83,
    high24h: 102.30,
    low24h: 92.10,
    volume24h: 2560000000,
    marketCap: 43000000000,
    sparkline: generateSparkline(20, 95),
    currency: 'USD',
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    price: 0.5234,
    change: -0.0156,
    changePercent: -2.89,
    high24h: 0.5450,
    low24h: 0.5120,
    volume24h: 1230000000,
    marketCap: 28000000000,
    sparkline: generateSparkline(20, 0.53),
    currency: 'USD',
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.4567,
    change: 0.0234,
    changePercent: 5.40,
    high24h: 0.4680,
    low24h: 0.4290,
    volume24h: 456000000,
    marketCap: 16000000000,
    sparkline: generateSparkline(20, 0.44),
    currency: 'USD',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.0823,
    change: 0.0045,
    changePercent: 5.78,
    high24h: 0.0856,
    low24h: 0.0765,
    volume24h: 567000000,
    marketCap: 11700000000,
    sparkline: generateSparkline(20, 0.08),
    currency: 'USD',
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 35.67,
    change: -1.23,
    changePercent: -3.33,
    high24h: 37.50,
    low24h: 34.80,
    volume24h: 345000000,
    marketCap: 13000000000,
    sparkline: generateSparkline(20, 36.5),
    currency: 'USD',
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    price: 7.23,
    change: 0.34,
    changePercent: 4.93,
    high24h: 7.45,
    low24h: 6.85,
    volume24h: 234000000,
    marketCap: 9500000000,
    sparkline: generateSparkline(20, 7.0),
    currency: 'USD',
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    price: 14.56,
    change: 0.67,
    changePercent: 4.83,
    high24h: 14.90,
    low24h: 13.75,
    volume24h: 378000000,
    marketCap: 8500000000,
    sparkline: generateSparkline(20, 14.2),
    currency: 'USD',
  },
]

// Simulate price updates
export function updatePrice<T extends { price: number; change: number; changePercent: number; sparkline?: number[] }>(
  data: T,
  volatility: number = 0.005
): T {
  const priceChange = (Math.random() - 0.5) * 2 * volatility * data.price
  const newPrice = Number((data.price + priceChange).toFixed(data.price > 100 ? 2 : data.price > 1 ? 4 : 6))
  const basePrice = data.price - data.change
  const newChange = Number((newPrice - basePrice).toFixed(data.price > 100 ? 2 : data.price > 1 ? 4 : 6))
  const newChangePercent = Number(((newChange / basePrice) * 100).toFixed(2))
  
  const newSparkline = data.sparkline ? [...data.sparkline.slice(1), newPrice] : undefined
  
  return {
    ...data,
    price: newPrice,
    change: newChange,
    changePercent: newChangePercent,
    sparkline: newSparkline,
  }
}

// Get top stocks by volume
export function getTopByVolume<T extends { volume: number } | { volume24h: number }>(
  data: T[],
  count: number = 3
): T[] {
  return [...data]
    .sort((a, b) => {
      const volA = 'volume24h' in a ? a.volume24h : a.volume
      const volB = 'volume24h' in b ? b.volume24h : b.volume
      return volB - volA
    })
    .slice(0, count)
}

// Sort data by different criteria
export type SortField = 'changePercent' | 'volume' | 'price' | 'marketCap'
export type SortOrder = 'asc' | 'desc'

export function sortData<T extends Record<string, unknown>>(
  data: T[],
  field: SortField,
  order: SortOrder = 'desc'
): T[] {
  return [...data].sort((a, b) => {
    let valA = a[field] as number
    let valB = b[field] as number
    
    // Handle volume24h for crypto
    if (field === 'volume') {
      valA = (a.volume24h as number) ?? (a.volume as number)
      valB = (b.volume24h as number) ?? (b.volume as number)
    }
    
    return order === 'desc' ? valB - valA : valA - valB
  })
}

// Search stocks/crypto by symbol or name
export function searchData<T extends { symbol: string; name: string }>(
  data: T[],
  query: string
): T[] {
  const lowerQuery = query.toLowerCase()
  return data.filter(
    item =>
      item.symbol.toLowerCase().includes(lowerQuery) ||
      item.name.toLowerCase().includes(lowerQuery)
  )
}
