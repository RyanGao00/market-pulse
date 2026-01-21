import { StockData, CryptoData } from './types'

// 预测结果类型
export interface PredictionResult {
  symbol: string
  name: string
  currentPrice: number
  predictedPrice: number
  priceChange: number       // 预测价格变化
  changePercent: number     // 预测涨跌幅
  confidence: number        // 置信度 0-100
  signal: 'BUY' | 'SELL' | 'HOLD'
  reason: string
  indicators: {
    sma5: number
    sma10: number
    sma20: number
    rsi: number
    trend: 'UP' | 'DOWN' | 'NEUTRAL'
    momentum: 'STRONG' | 'MODERATE' | 'WEAK'
  }
}

/**
 * 计算简单移动平均线 (SMA)
 */
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  const slice = prices.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

/**
 * 计算指数移动平均线 (EMA)
 */
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  
  const multiplier = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }
  
  return ema
}

/**
 * 计算相对强弱指标 (RSI)
 * RSI = 100 - (100 / (1 + RS))
 * RS = 平均上涨幅度 / 平均下跌幅度
 */
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50 // 默认中性值
  
  let gains = 0
  let losses = 0
  
  // 计算初始平均值
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) {
      gains += change
    } else {
      losses += Math.abs(change)
    }
  }
  
  let avgGain = gains / period
  let avgLoss = losses / period
  
  // 使用EMA方式更新
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period
    }
  }
  
  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

/**
 * 分析趋势方向
 */
function analyzeTrend(sma5: number, sma10: number, sma20: number): 'UP' | 'DOWN' | 'NEUTRAL' {
  if (sma5 > sma10 && sma10 > sma20) return 'UP'
  if (sma5 < sma10 && sma10 < sma20) return 'DOWN'
  return 'NEUTRAL'
}

/**
 * 分析动量强度
 */
function analyzeMomentum(rsi: number, trend: 'UP' | 'DOWN' | 'NEUTRAL'): 'STRONG' | 'MODERATE' | 'WEAK' {
  if (trend === 'UP') {
    if (rsi > 60) return 'STRONG'
    if (rsi > 45) return 'MODERATE'
    return 'WEAK'
  } else if (trend === 'DOWN') {
    if (rsi < 40) return 'STRONG'
    if (rsi < 55) return 'MODERATE'
    return 'WEAK'
  }
  return 'MODERATE'
}

/**
 * 生成交易信号
 */
function generateSignal(
  rsi: number,
  trend: 'UP' | 'DOWN' | 'NEUTRAL',
  currentPrice: number,
  sma5: number,
  sma20: number
): { signal: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string } {
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
  let confidence = 50
  let reasons: string[] = []

  // RSI超卖信号 (RSI < 30)
  if (rsi < 30) {
    signal = 'BUY'
    confidence += 20
    reasons.push('RSI超卖')
  }
  // RSI超买信号 (RSI > 70)
  else if (rsi > 70) {
    signal = 'SELL'
    confidence += 20
    reasons.push('RSI超买')
  }

  // 均线金叉 (短期均线上穿长期均线)
  if (sma5 > sma20 && currentPrice > sma5) {
    if (signal !== 'SELL') {
      signal = 'BUY'
      confidence += 15
      reasons.push('均线金叉')
    }
  }
  // 均线死叉 (短期均线下穿长期均线)
  else if (sma5 < sma20 && currentPrice < sma5) {
    if (signal !== 'BUY') {
      signal = 'SELL'
      confidence += 15
      reasons.push('均线死叉')
    }
  }

  // 趋势确认
  if (trend === 'UP' && signal === 'BUY') {
    confidence += 10
    reasons.push('上升趋势')
  } else if (trend === 'DOWN' && signal === 'SELL') {
    confidence += 10
    reasons.push('下降趋势')
  }

  // 价格在均线上方/下方
  if (currentPrice > sma20 && signal === 'BUY') {
    confidence += 5
  } else if (currentPrice < sma20 && signal === 'SELL') {
    confidence += 5
  }

  // 限制置信度范围
  confidence = Math.min(95, Math.max(30, confidence))

  const reason = reasons.length > 0 ? reasons.join('，') : '市场震荡，建议观望'

  return { signal, confidence, reason }
}

/**
 * 预测下一日价格
 * 使用EMA和趋势分析进行预测
 */
function predictNextPrice(
  prices: number[],
  currentPrice: number,
  trend: 'UP' | 'DOWN' | 'NEUTRAL',
  momentum: 'STRONG' | 'MODERATE' | 'WEAK'
): number {
  if (prices.length < 5) return currentPrice
  
  // 计算短期EMA
  const ema5 = calculateEMA(prices, 5)
  
  // 计算平均日波动率
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  
  // 根据趋势和动量调整预测
  let trendMultiplier = 0
  if (trend === 'UP') {
    trendMultiplier = momentum === 'STRONG' ? 1.5 : momentum === 'MODERATE' ? 1 : 0.5
  } else if (trend === 'DOWN') {
    trendMultiplier = momentum === 'STRONG' ? -1.5 : momentum === 'MODERATE' ? -1 : -0.5
  }
  
  // 预测价格 = 当前价格 * (1 + 平均收益率 * 趋势调整)
  const predictedChange = avgReturn * trendMultiplier + (ema5 - currentPrice) / currentPrice * 0.3
  const predictedPrice = currentPrice * (1 + predictedChange)
  
  return predictedPrice
}

/**
 * 生成股票/加密货币的价格预测
 */
export function generatePrediction(
  item: StockData | CryptoData,
  historicalPrices?: number[]
): PredictionResult {
  // 使用sparkline作为历史价格，如果没有则生成模拟数据
  const prices = historicalPrices || item.sparkline || generateSimulatedPrices(item.price, 20)
  
  // 确保有足够的数据点
  const validPrices = prices.length >= 20 ? prices : generateSimulatedPrices(item.price, 20)
  
  // 计算技术指标
  const sma5 = calculateSMA(validPrices, 5)
  const sma10 = calculateSMA(validPrices, 10)
  const sma20 = calculateSMA(validPrices, 20)
  const rsi = calculateRSI(validPrices, 14)
  
  // 分析趋势和动量
  const trend = analyzeTrend(sma5, sma10, sma20)
  const momentum = analyzeMomentum(rsi, trend)
  
  // 生成交易信号
  const { signal, confidence, reason } = generateSignal(
    rsi,
    trend,
    item.price,
    sma5,
    sma20
  )
  
  // 预测下一日价格
  const predictedPrice = predictNextPrice(validPrices, item.price, trend, momentum)
  const priceChange = predictedPrice - item.price
  const changePercent = (priceChange / item.price) * 100
  
  return {
    symbol: item.symbol,
    name: item.name,
    currentPrice: item.price,
    predictedPrice: Number(predictedPrice.toFixed(item.price > 100 ? 2 : 4)),
    priceChange: Number(priceChange.toFixed(item.price > 100 ? 2 : 4)),
    changePercent: Number(changePercent.toFixed(2)),
    confidence,
    signal,
    reason,
    indicators: {
      sma5: Number(sma5.toFixed(2)),
      sma10: Number(sma10.toFixed(2)),
      sma20: Number(sma20.toFixed(2)),
      rsi: Number(rsi.toFixed(1)),
      trend,
      momentum,
    },
  }
}

/**
 * 生成模拟历史价格（当没有真实数据时使用）
 */
function generateSimulatedPrices(currentPrice: number, length: number): number[] {
  const prices: number[] = []
  let price = currentPrice * (1 - 0.05 * Math.random()) // 从稍低的价格开始
  
  for (let i = 0; i < length; i++) {
    // 添加随机波动
    const change = (Math.random() - 0.48) * 0.02 * price // 轻微上涨偏向
    price = price + change
    prices.push(price)
  }
  
  // 确保最后一个价格接近当前价格
  prices[length - 1] = currentPrice
  
  return prices
}

/**
 * 批量生成预测
 */
export function generateBatchPredictions(
  items: (StockData | CryptoData)[]
): PredictionResult[] {
  return items.map(item => generatePrediction(item))
}

/**
 * 获取信号颜色
 */
export function getSignalColor(signal: 'BUY' | 'SELL' | 'HOLD'): string {
  switch (signal) {
    case 'BUY':
      return 'text-gain'
    case 'SELL':
      return 'text-loss'
    default:
      return 'text-muted-foreground'
  }
}

/**
 * 获取信号背景颜色
 */
export function getSignalBgColor(signal: 'BUY' | 'SELL' | 'HOLD'): string {
  switch (signal) {
    case 'BUY':
      return 'bg-gain/10 border-gain/20'
    case 'SELL':
      return 'bg-loss/10 border-loss/20'
    default:
      return 'bg-secondary/50 border-border'
  }
}

/**
 * 获取信号中文名称
 */
export function getSignalText(signal: 'BUY' | 'SELL' | 'HOLD'): string {
  switch (signal) {
    case 'BUY':
      return '建议买入'
    case 'SELL':
      return '建议卖出'
    default:
      return '建议观望'
  }
}
