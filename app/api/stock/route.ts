import { NextRequest, NextResponse } from 'next/server'

// 新浪财经API代理
// A股股票: sh600519 (上海), sz000858 (深圳)
// A股指数: s_sh000001 (上证指数), s_sz399001 (深证成指), s_sz399006 (创业板指)
// 港股股票: rt_hk00700 (腾讯), rt_hk09988 (阿里巴巴)
// 港股指数: rt_hkHSI (恒生指数), rt_hkHSTECH (恒生科技)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')
  const market = searchParams.get('market') || 'A' // A股默认, HK港股
  
  if (!symbols) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 })
  }

  try {
    const url = `https://hq.sinajs.cn/list=${symbols}`
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 0 }, // 不缓存
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    // 新浪返回的是GBK编码的文本
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('gbk')
    const text = decoder.decode(buffer)

    // 根据市场类型解析数据
    const data = market === 'HK' ? parseHKStockData(text) : parseStockData(text)
    
    return NextResponse.json({ data, timestamp: Date.now() })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}

// 解析新浪股票数据
function parseStockData(text: string): Record<string, StockInfo | null> {
  const result: Record<string, StockInfo | null> = {}
  const lines = text.split('\n').filter(line => line.trim())

  for (const line of lines) {
    // 格式: var hq_str_sh600519="贵州茅台,1689.00,..."
    const match = line.match(/var hq_str_(\w+)="(.*)";?/)
    if (!match) continue

    const [, symbol, dataStr] = match
    
    if (!dataStr) {
      result[symbol] = null
      continue
    }

    const parts = dataStr.split(',')
    
    // 判断是指数还是股票
    if (symbol.startsWith('s_')) {
      // 指数数据格式: 名称,当前点数,涨跌点数,涨跌幅,成交量(手),成交额(万元)
      result[symbol] = {
        type: 'index',
        name: parts[0],
        price: parseFloat(parts[1]) || 0,
        change: parseFloat(parts[2]) || 0,
        changePercent: parseFloat(parts[3]) || 0,
        volume: (parseFloat(parts[4]) || 0) * 100, // 手转股
        turnover: (parseFloat(parts[5]) || 0) * 10000, // 万元转元
      }
    } else {
      // 股票数据格式较复杂
      result[symbol] = {
        type: 'stock',
        name: parts[0],
        open: parseFloat(parts[1]) || 0,
        prevClose: parseFloat(parts[2]) || 0,
        price: parseFloat(parts[3]) || 0,
        high: parseFloat(parts[4]) || 0,
        low: parseFloat(parts[5]) || 0,
        volume: parseFloat(parts[8]) || 0,
        turnover: parseFloat(parts[9]) || 0,
        date: parts[30],
        time: parts[31],
      }
    }
  }

  return result
}

interface StockInfo {
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

// 解析港股数据
function parseHKStockData(text: string): Record<string, StockInfo | null> {
  const result: Record<string, StockInfo | null> = {}
  const lines = text.split('\n').filter(line => line.trim())

  for (const line of lines) {
    // 格式: var hq_str_rt_hk00700="...";
    const match = line.match(/var hq_str_(rt_hk\w+)="(.*)";?/)
    if (!match) continue

    const [, symbol, dataStr] = match
    
    if (!dataStr) {
      result[symbol] = null
      continue
    }

    const parts = dataStr.split(',')
    
    // 港股指数格式: 名称,当前点数,涨跌点数,涨跌幅,开盘价,最高价,最低价,成交量,成交额
    // 港股股票格式: 名称,开盘价,昨收价,最高价,最低价,现价,涨跌额,涨跌幅,买入价,卖出价,成交额,成交量
    if (symbol.includes('HSI') || symbol.includes('HSTECH') || symbol.includes('HSCEI')) {
      // 指数
      result[symbol] = {
        type: 'index',
        name: parts[1] || parts[0],
        price: parseFloat(parts[6]) || 0,
        change: parseFloat(parts[7]) || 0,
        changePercent: parseFloat(parts[8]) || 0,
        open: parseFloat(parts[2]) || 0,
        prevClose: parseFloat(parts[3]) || 0,
        high: parseFloat(parts[4]) || 0,
        low: parseFloat(parts[5]) || 0,
        volume: parseFloat(parts[11]) || 0,
        turnover: parseFloat(parts[12]) || 0,
      }
    } else {
      // 股票
      result[symbol] = {
        type: 'stock',
        name: parts[1] || parts[0],
        open: parseFloat(parts[2]) || 0,
        prevClose: parseFloat(parts[3]) || 0,
        high: parseFloat(parts[4]) || 0,
        low: parseFloat(parts[5]) || 0,
        price: parseFloat(parts[6]) || 0,
        change: parseFloat(parts[7]) || 0,
        changePercent: parseFloat(parts[8]) || 0,
        turnover: parseFloat(parts[11]) || 0,
        volume: parseFloat(parts[12]) || 0,
      }
    }
  }

  return result
}
