import { StockData, IndexData, CryptoData } from './types'

// A股指数代码映射
const A_SHARE_INDEX_CODES = {
  '000001.SH': 's_sh000001', // 上证指数
  '399001.SZ': 's_sz399001', // 深证成指
  '399006.SZ': 's_sz399006', // 创业板指
}

// A股股票代码映射 (代码 -> 新浪代码)
const A_SHARE_STOCK_CODES: Record<string, string> = {
  '600519': 'sh600519', // 贵州茅台
  '000858': 'sz000858', // 五粮液
  '601318': 'sh601318', // 中国平安
  '300750': 'sz300750', // 宁德时代
  '600036': 'sh600036', // 招商银行
  '601899': 'sh601899', // 紫金矿业
  '600030': 'sh600030', // 中信证券
  '000001': 'sz000001', // 平安银行
  '600900': 'sh600900', // 长江电力
  '601012': 'sh601012', // 隆基绿能
}

// 港股指数代码映射
const HK_INDEX_CODES: Record<string, string> = {
  'HSI': 'rt_hkHSI',      // 恒生指数
  'HSTECH': 'rt_hkHSTECH', // 恒生科技指数
}

// 港股股票代码映射
const HK_STOCK_CODES: Record<string, string> = {
  '00700': 'rt_hk00700', // 腾讯控股
  '09988': 'rt_hk09988', // 阿里巴巴-SW
  '03690': 'rt_hk03690', // 美团-W
  '01810': 'rt_hk01810', // 小米集团-W
  '09618': 'rt_hk09618', // 京东集团-SW
  '00005': 'rt_hk00005', // 汇丰控股
  '02318': 'rt_hk02318', // 中国平安
  '01024': 'rt_hk01024', // 快手-W
  '09999': 'rt_hk09999', // 网易-S
  '02020': 'rt_hk02020', // 安踏体育
}

// 股票名称映射（作为后备）
const STOCK_NAMES: Record<string, string> = {
  '600519': '贵州茅台',
  '000858': '五粮液',
  '601318': '中国平安',
  '300750': '宁德时代',
  '600036': '招商银行',
  '601899': '紫金矿业',
  '600030': '中信证券',
  '000001': '平安银行',
  '600900': '长江电力',
  '601012': '隆基绿能',
}

// 港股名称映射
const HK_STOCK_NAMES: Record<string, string> = {
  '00700': '腾讯控股',
  '09988': '阿里巴巴-SW',
  '03690': '美团-W',
  '01810': '小米集团-W',
  '09618': '京东集团-SW',
  '00005': '汇丰控股',
  '02318': '中国平安',
  '01024': '快手-W',
  '09999': '网易-S',
  '02020': '安踏体育',
}

interface SinaStockData {
  type: 'stock' | 'index'
  name: string
  price: number
  change?: number
  changePercent?: number
  open?: number
  prevClose?: number
  high?: number
  low?: number
  volume: number
  turnover: number
  date?: string
  time?: string
}

interface ApiResponse {
  data: Record<string, SinaStockData | null>
  timestamp: number
}

// 获取A股指数数据
export async function fetchAShareIndices(): Promise<IndexData[]> {
  try {
    const symbols = Object.values(A_SHARE_INDEX_CODES).join(',')
    const response = await fetch(`/api/stock?symbols=${symbols}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch index data')
    }

    const { data } = await response.json() as ApiResponse
    
    const indices: IndexData[] = []
    
    for (const [displayCode, sinaCode] of Object.entries(A_SHARE_INDEX_CODES)) {
      const stockData = data[sinaCode]
      if (stockData && stockData.type === 'index') {
        indices.push({
          symbol: displayCode,
          name: stockData.name,
          price: stockData.price,
          change: stockData.change || 0,
          changePercent: stockData.changePercent || 0,
          volume: stockData.turnover, // 使用成交额
        })
      }
    }

    return indices
  } catch (error) {
    console.error('Error fetching A-share indices:', error)
    return []
  }
}

// 获取A股股票数据
export async function fetchAShareStocks(): Promise<StockData[]> {
  try {
    const symbols = Object.values(A_SHARE_STOCK_CODES).join(',')
    const response = await fetch(`/api/stock?symbols=${symbols}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data')
    }

    const { data } = await response.json() as ApiResponse
    
    const stocks: StockData[] = []
    
    for (const [code, sinaCode] of Object.entries(A_SHARE_STOCK_CODES)) {
      const stockData = data[sinaCode]
      if (stockData && stockData.type === 'stock') {
        const prevClose = stockData.prevClose || stockData.price
        const change = stockData.price - prevClose
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

        stocks.push({
          symbol: code,
          name: stockData.name || STOCK_NAMES[code] || code,
          price: stockData.price,
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          open: stockData.open || stockData.price,
          high: stockData.high || stockData.price,
          low: stockData.low || stockData.price,
          volume: stockData.volume,
          turnover: stockData.turnover,
          market: 'A_STOCK',
          currency: 'CNY',
        })
      }
    }

    // 按成交量排序
    return stocks.sort((a, b) => b.volume - a.volume)
  } catch (error) {
    console.error('Error fetching A-share stocks:', error)
    return []
  }
}

// 批量获取所有A股数据
export async function fetchAllAShareData(): Promise<{
  indices: IndexData[]
  stocks: StockData[]
}> {
  try {
    // 合并所有代码一次性请求
    const allSymbols = [
      ...Object.values(A_SHARE_INDEX_CODES),
      ...Object.values(A_SHARE_STOCK_CODES),
    ].join(',')

    const response = await fetch(`/api/stock?symbols=${allSymbols}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }

    const { data } = await response.json() as ApiResponse
    
    // 解析指数
    const indices: IndexData[] = []
    for (const [displayCode, sinaCode] of Object.entries(A_SHARE_INDEX_CODES)) {
      const stockData = data[sinaCode]
      if (stockData && stockData.type === 'index') {
        indices.push({
          symbol: displayCode,
          name: stockData.name,
          price: stockData.price,
          change: stockData.change || 0,
          changePercent: stockData.changePercent || 0,
          volume: stockData.turnover,
        })
      }
    }

    // 解析股票
    const stocks: StockData[] = []
    for (const [code, sinaCode] of Object.entries(A_SHARE_STOCK_CODES)) {
      const stockData = data[sinaCode]
      if (stockData && stockData.type === 'stock') {
        const prevClose = stockData.prevClose || stockData.price
        const change = stockData.price - prevClose
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

        stocks.push({
          symbol: code,
          name: stockData.name || STOCK_NAMES[code] || code,
          price: stockData.price,
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          open: stockData.open || stockData.price,
          high: stockData.high || stockData.price,
          low: stockData.low || stockData.price,
          volume: stockData.volume,
          turnover: stockData.turnover,
          market: 'A_STOCK',
          currency: 'CNY',
        })
      }
    }

    return {
      indices,
      stocks: stocks.sort((a, b) => b.volume - a.volume),
    }
  } catch (error) {
    console.error('Error fetching A-share data:', error)
    return { indices: [], stocks: [] }
  }
}

// 检查是否是交易时间 (9:30-11:30, 13:00-15:00)
export function isMarketOpen(): boolean {
  const now = new Date()
  const day = now.getDay()
  
  // 周末休市
  if (day === 0 || day === 6) return false
  
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const time = hours * 60 + minutes
  
  // 上午 9:30 - 11:30
  if (time >= 9 * 60 + 30 && time <= 11 * 60 + 30) return true
  // 下午 13:00 - 15:00
  if (time >= 13 * 60 && time <= 15 * 60) return true
  
  return false
}

// 港股交易时间 (9:30-12:00, 13:00-16:00)
export function isHKMarketOpen(): boolean {
  const now = new Date()
  const day = now.getDay()
  
  if (day === 0 || day === 6) return false
  
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const time = hours * 60 + minutes
  
  if (time >= 9 * 60 + 30 && time <= 12 * 60) return true
  if (time >= 13 * 60 && time <= 16 * 60) return true
  
  return false
}

// 获取港股指数数据
export async function fetchHKIndices(): Promise<IndexData[]> {
  try {
    const symbols = Object.values(HK_INDEX_CODES).join(',')
    const response = await fetch(`/api/stock?symbols=${symbols}&market=HK`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch HK index data')
    }

    const { data } = await response.json() as ApiResponse
    
    const indices: IndexData[] = []
    
    for (const [displayCode, sinaCode] of Object.entries(HK_INDEX_CODES)) {
      const stockData = data[sinaCode]
      if (stockData) {
        indices.push({
          symbol: displayCode,
          name: displayCode === 'HSI' ? '恒生指数' : '恒生科技指数',
          price: stockData.price,
          change: stockData.change || 0,
          changePercent: stockData.changePercent || 0,
          volume: stockData.turnover || 0,
        })
      }
    }

    return indices
  } catch (error) {
    console.error('Error fetching HK indices:', error)
    return []
  }
}

// 获取港股股票数据
export async function fetchHKStocks(): Promise<StockData[]> {
  try {
    const symbols = Object.values(HK_STOCK_CODES).join(',')
    const response = await fetch(`/api/stock?symbols=${symbols}&market=HK`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch HK stock data')
    }

    const { data } = await response.json() as ApiResponse
    
    const stocks: StockData[] = []
    
    for (const [code, sinaCode] of Object.entries(HK_STOCK_CODES)) {
      const stockData = data[sinaCode]
      if (stockData && stockData.type === 'stock') {
        const prevClose = stockData.prevClose || stockData.price
        const change = stockData.change || (stockData.price - prevClose)
        const changePercent = stockData.changePercent || (prevClose > 0 ? (change / prevClose) * 100 : 0)

        stocks.push({
          symbol: code,
          name: stockData.name || HK_STOCK_NAMES[code] || code,
          price: stockData.price,
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          open: stockData.open || stockData.price,
          high: stockData.high || stockData.price,
          low: stockData.low || stockData.price,
          volume: stockData.volume,
          turnover: stockData.turnover,
          market: 'HK_STOCK',
          currency: 'HKD',
        })
      }
    }

    return stocks.sort((a, b) => b.volume - a.volume)
  } catch (error) {
    console.error('Error fetching HK stocks:', error)
    return []
  }
}

// 批量获取所有港股数据
export async function fetchAllHKData(): Promise<{
  indices: IndexData[]
  stocks: StockData[]
}> {
  try {
    const allSymbols = [
      ...Object.values(HK_INDEX_CODES),
      ...Object.values(HK_STOCK_CODES),
    ].join(',')

    const response = await fetch(`/api/stock?symbols=${allSymbols}&market=HK`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch HK data')
    }

    const { data } = await response.json() as ApiResponse
    
    // 解析指数
    const indices: IndexData[] = []
    for (const [displayCode, sinaCode] of Object.entries(HK_INDEX_CODES)) {
      const stockData = data[sinaCode]
      if (stockData) {
        indices.push({
          symbol: displayCode,
          name: displayCode === 'HSI' ? '恒生指数' : '恒生科技指数',
          price: stockData.price,
          change: stockData.change || 0,
          changePercent: stockData.changePercent || 0,
          volume: stockData.turnover || 0,
        })
      }
    }

    // 解析股票
    const stocks: StockData[] = []
    for (const [code, sinaCode] of Object.entries(HK_STOCK_CODES)) {
      const stockData = data[sinaCode]
      if (stockData) {
        const prevClose = stockData.prevClose || stockData.price
        const change = stockData.change || (stockData.price - prevClose)
        const changePercent = stockData.changePercent || (prevClose > 0 ? (change / prevClose) * 100 : 0)

        stocks.push({
          symbol: code,
          name: stockData.name || HK_STOCK_NAMES[code] || code,
          price: stockData.price,
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          open: stockData.open || stockData.price,
          high: stockData.high || stockData.price,
          low: stockData.low || stockData.price,
          volume: stockData.volume,
          turnover: stockData.turnover,
          market: 'HK_STOCK',
          currency: 'HKD',
        })
      }
    }

    return {
      indices,
      stocks: stocks.sort((a, b) => b.volume - a.volume),
    }
  } catch (error) {
    console.error('Error fetching HK data:', error)
    return { indices: [], stocks: [] }
  }
}

// 加密货币API响应格式
interface CryptoApiResponse {
  data: {
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
  }[]
  timestamp: number
}

// 获取加密货币数据
export async function fetchCryptoData(): Promise<CryptoData[]> {
  try {
    const response = await fetch('/api/crypto?sparkline=true')
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data')
    }

    const { data } = await response.json() as CryptoApiResponse
    
    return data.map(coin => ({
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
      change: coin.change || 0,
      changePercent: coin.changePercent || 0,
      high24h: coin.high24h || coin.price,
      low24h: coin.low24h || coin.price,
      volume24h: coin.volume24h || 0,
      marketCap: coin.marketCap || 0,
      sparkline: coin.sparkline,
      currency: 'USD' as const,
    }))
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    return []
  }
}
