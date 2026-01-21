import { NextRequest, NextResponse } from 'next/server'

// 使用 Binance API 获取实时加密货币数据
const BINANCE_API = 'https://api.binance.com/api/v3'

// 支持的加密货币交易对
const CRYPTO_PAIRS: Record<string, { symbol: string; name: string }> = {
  'BTC': { symbol: 'BTCUSDT', name: 'Bitcoin' },
  'ETH': { symbol: 'ETHUSDT', name: 'Ethereum' },
  'BNB': { symbol: 'BNBUSDT', name: 'BNB' },
  'SOL': { symbol: 'SOLUSDT', name: 'Solana' },
  'XRP': { symbol: 'XRPUSDT', name: 'XRP' },
  'ADA': { symbol: 'ADAUSDT', name: 'Cardano' },
  'DOGE': { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  'AVAX': { symbol: 'AVAXUSDT', name: 'Avalanche' },
  'DOT': { symbol: 'DOTUSDT', name: 'Polkadot' },
  'LINK': { symbol: 'LINKUSDT', name: 'Chainlink' },
}

// Binance ticker响应
interface BinanceTicker {
  symbol: string
  lastPrice: string
  priceChange: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const requestedSymbols = searchParams.get('symbols')

  try {
    // 获取要请求的币种
    let cryptoList: string[]
    if (requestedSymbols) {
      cryptoList = requestedSymbols.toUpperCase().split(',').filter(s => CRYPTO_PAIRS[s])
    } else {
      cryptoList = Object.keys(CRYPTO_PAIRS)
    }

    if (cryptoList.length === 0) {
      return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 })
    }

    // 并行请求每个币种的数据
    const tickerPromises = cryptoList.map(async (crypto) => {
      const pair = CRYPTO_PAIRS[crypto]
      const url = `${BINANCE_API}/ticker/24hr?symbol=${pair.symbol}`
      
      try {
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        })
        
        if (!response.ok) {
          console.error(`Binance API error for ${pair.symbol}:`, response.status)
          return null
        }
        
        const ticker: BinanceTicker = await response.json()
        return { crypto, ticker }
      } catch (err) {
        console.error(`Error fetching ${pair.symbol}:`, err)
        return null
      }
    })

    const results = await Promise.all(tickerPromises)
    
    // 转换为标准格式
    const data = results
      .filter((r): r is { crypto: string; ticker: BinanceTicker } => r !== null)
      .map(({ crypto, ticker }) => {
        const cryptoInfo = CRYPTO_PAIRS[crypto]
        const price = parseFloat(ticker.lastPrice) || 0
        const change = parseFloat(ticker.priceChange) || 0
        const changePercent = parseFloat(ticker.priceChangePercent) || 0
        const volume = parseFloat(ticker.quoteVolume) || 0
        
        return {
          symbol: crypto,
          name: cryptoInfo.name,
          price: price,
          change: Number(change.toFixed(price < 1 ? 6 : 2)),
          changePercent: Number(changePercent.toFixed(2)),
          high24h: parseFloat(ticker.highPrice) || price,
          low24h: parseFloat(ticker.lowPrice) || price,
          volume24h: volume,
          marketCap: 0,
          sparkline: undefined,
        }
      })

    // 按交易量排序
    data.sort((a, b) => b.volume24h - a.volume24h)

    if (data.length === 0) {
      throw new Error('No data received from Binance API')
    }

    return NextResponse.json({ data, timestamp: Date.now() })
  } catch (error) {
    console.error('Crypto API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto data', message: String(error) },
      { status: 500 }
    )
  }
}
