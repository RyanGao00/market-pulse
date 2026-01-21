'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { 
  aShareIndices as mockAIndices, 
  aShareStocks as mockAStocks, 
  hkIndices as mockHkIndices, 
  hkStocks as mockHkStocks, 
  cryptoData as mockCrypto,
  updatePrice,
} from '@/lib/market-data'
import { fetchAllAShareData, fetchAllHKData, fetchCryptoData, isMarketOpen } from '@/lib/api-service'
import { generatePrediction, getSignalColor, getSignalBgColor, getSignalText, PredictionResult } from '@/lib/prediction-service'
import { IndexData, StockData, CryptoData, MarketType, WatchlistItem } from '@/lib/types'
import { getFromStorage, setToStorage } from '@/lib/utils'
import { MarketPanel } from '@/components/market/market-panel'
import { StockDetailModal } from '@/components/market/stock-detail-modal'
import { Activity, TrendingUp, Globe, Bitcoin, Star, RefreshCw, Wifi, WifiOff, Brain, TrendingDown, Minus, ChevronRight, BarChart3, X, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const WATCHLIST_KEY = 'market-pulse-watchlist'
const REFRESH_INTERVAL = 10000 // 10 seconds

export default function Dashboard() {
  // Market data state
  const [aIndices, setAIndices] = useState<IndexData[]>(mockAIndices)
  const [aStocks, setAStocks] = useState<StockData[]>(mockAStocks)
  const [hkIdx, setHkIdx] = useState<IndexData[]>(mockHkIndices)
  const [hkStk, setHkStk] = useState<StockData[]>(mockHkStocks)
  const [crypto, setCrypto] = useState<CryptoData[]>(mockCrypto)
  
  // UI state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [selectedStock, setSelectedStock] = useState<StockData | CryptoData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'watchlist'>('all')
  const [useRealData, setUseRealData] = useState(true) // 是否使用真实数据
  // 分别跟踪各市场数据源状态
  const [aShareDataSource, setAShareDataSource] = useState<'real' | 'mock'>('mock')
  const [hkDataSource, setHkDataSource] = useState<'real' | 'mock'>('mock')
  const [cryptoDataSource, setCryptoDataSource] = useState<'real' | 'mock'>('mock')
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({})
  const [showPredictions, setShowPredictions] = useState(true)
  const [globalSearch, setGlobalSearch] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 全局搜索结果
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return []
    
    const query = globalSearch.toLowerCase()
    const results: { item: StockData | CryptoData; market: MarketType; marketName: string }[] = []
    
    // 搜索A股
    aStocks.forEach(stock => {
      if (stock.symbol.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query)) {
        results.push({ item: stock, market: 'A_STOCK', marketName: 'A股' })
      }
    })
    
    // 搜索港股
    hkStk.forEach(stock => {
      if (stock.symbol.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query)) {
        results.push({ item: stock, market: 'HK_STOCK', marketName: '港股' })
      }
    })
    
    // 搜索加密货币
    crypto.forEach(c => {
      if (c.symbol.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)) {
        results.push({ item: c, market: 'CRYPTO', marketName: '加密货币' })
      }
    })
    
    return results.slice(0, 10) // 最多显示10条
  }, [globalSearch, aStocks, hkStk, crypto])

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = getFromStorage<WatchlistItem[]>(WATCHLIST_KEY, [])
    setWatchlist(saved)
  }, [])

  // 获取A股真实数据
  const fetchRealAShareData = useCallback(async () => {
    if (!useRealData) return false
    
    try {
      const { indices, stocks } = await fetchAllAShareData()
      
      if (indices.length > 0 && stocks.length > 0) {
        setAIndices(indices)
        setAStocks(stocks)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch real A-share data:', error)
      return false
    }
  }, [useRealData])

  // 获取港股真实数据
  const fetchRealHKData = useCallback(async () => {
    if (!useRealData) return false
    
    try {
      const { indices, stocks } = await fetchAllHKData()
      
      if (indices.length > 0 || stocks.length > 0) {
        if (indices.length > 0) setHkIdx(indices)
        if (stocks.length > 0) setHkStk(stocks)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch real HK data:', error)
      return false
    }
  }, [useRealData])

  // 获取加密货币真实数据
  const fetchRealCryptoData = useCallback(async () => {
    if (!useRealData) return false
    
    try {
      const data = await fetchCryptoData()
      
      if (data.length > 0) {
        setCrypto(data)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch real crypto data:', error)
      return false
    }
  }, [useRealData])

  // 更新自选股预测
  const updatePredictions = useCallback(() => {
    const newPredictions: Record<string, PredictionResult> = {}
    
    watchlist.forEach(w => {
      let item: StockData | CryptoData | undefined
      
      if (w.market === 'A_STOCK') {
        item = aStocks.find(s => s.symbol === w.symbol)
      } else if (w.market === 'HK_STOCK') {
        item = hkStk.find(s => s.symbol === w.symbol)
      } else if (w.market === 'CRYPTO') {
        item = crypto.find(s => s.symbol === w.symbol)
      }
      
      if (item) {
        const prediction = generatePrediction(item)
        newPredictions[`${w.market}-${w.symbol}`] = prediction
      }
    })
    
    setPredictions(newPredictions)
  }, [watchlist, aStocks, hkStk, crypto])

  // 初始加载和定时刷新
  useEffect(() => {
    // 初始加载真实数据
    const fetchAllRealData = async () => {
      const [aSuccess, hkSuccess, cryptoSuccess] = await Promise.all([
        fetchRealAShareData(),
        fetchRealHKData(),
        fetchRealCryptoData(),
      ])
      
      // 分别设置各市场数据源状态
      setAShareDataSource(aSuccess ? 'real' : 'mock')
      setHkDataSource(hkSuccess ? 'real' : 'mock')
      setCryptoDataSource(cryptoSuccess ? 'real' : 'mock')
    }
    
    fetchAllRealData()
    
    const interval = setInterval(async () => {
      setIsRefreshing(true)
      
      // 尝试获取所有真实数据
      const [aSuccess, hkSuccess, cryptoSuccess] = await Promise.all([
        fetchRealAShareData(),
        fetchRealHKData(),
        fetchRealCryptoData(),
      ])
      
      // 分别更新各市场数据源状态
      setAShareDataSource(aSuccess ? 'real' : 'mock')
      setHkDataSource(hkSuccess ? 'real' : 'mock')
      setCryptoDataSource(cryptoSuccess ? 'real' : 'mock')
      
      // 对于获取失败的市场，使用模拟更新
      if (!aSuccess) {
        setAIndices(prev => prev.map(idx => updatePrice(idx, 0.001)))
        setAStocks(prev => prev.map(stock => updatePrice(stock, 0.003)))
      }
      
      if (!hkSuccess) {
        setHkIdx(prev => prev.map(idx => updatePrice(idx, 0.001)))
        setHkStk(prev => prev.map(stock => updatePrice(stock, 0.003)))
      }
      
      if (!cryptoSuccess) {
        setCrypto(prev => prev.map(c => updatePrice(c, 0.005)))
      }
      
      setLastUpdate(new Date())
      setTimeout(() => setIsRefreshing(false), 300)
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchRealAShareData, fetchRealHKData, fetchRealCryptoData])

  // 当自选列表或数据变化时更新预测
  useEffect(() => {
    if (watchlist.length > 0) {
      updatePredictions()
    }
  }, [watchlist, aStocks, hkStk, crypto, updatePredictions])

  // Toggle watchlist
  const toggleWatch = useCallback((symbol: string, market: MarketType) => {
    setWatchlist(prev => {
      const exists = prev.some(w => w.symbol === symbol && w.market === market)
      let newList: WatchlistItem[]
      
      if (exists) {
        newList = prev.filter(w => !(w.symbol === symbol && w.market === market))
      } else {
        newList = [...prev, { symbol, market, addedAt: new Date() }]
      }
      
      setToStorage(WATCHLIST_KEY, newList)
      return newList
    })
  }, [])

  // Get watched stocks
  const getWatchedStocks = useCallback(() => {
    const watched: (StockData | CryptoData)[] = []
    watchlist.forEach(w => {
      if (w.market === 'A_STOCK') {
        const stock = aStocks.find(s => s.symbol === w.symbol)
        if (stock) watched.push(stock)
      } else if (w.market === 'HK_STOCK') {
        const stock = hkStk.find(s => s.symbol === w.symbol)
        if (stock) watched.push(stock)
      } else if (w.market === 'CRYPTO') {
        const c = crypto.find(s => s.symbol === w.symbol)
        if (c) watched.push(c)
      }
    })
    return watched
  }, [watchlist, aStocks, hkStk, crypto])

  // Toggle data source
  const toggleDataSource = useCallback(() => {
    setUseRealData(prev => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border">
        <div className="container max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-bold hidden sm:block">Market Pulse</h1>
              </div>
              <Badge 
                variant={aShareDataSource === 'real' || hkDataSource === 'real' ? 'gain' : 'outline'}
                className="cursor-pointer"
                onClick={toggleDataSource}
              >
                {aShareDataSource === 'real' && hkDataSource === 'real' && cryptoDataSource === 'real' ? (
                  <><Wifi className="h-3 w-3 mr-1" /> 全部实时</>
                ) : aShareDataSource === 'real' || hkDataSource === 'real' ? (
                  <><Wifi className="h-3 w-3 mr-1" /> 部分实时</>
                ) : (
                  <><WifiOff className="h-3 w-3 mr-1" /> 模拟数据</>
                )}
              </Badge>
            </div>

            {/* 全局搜索栏 */}
            <div ref={searchRef} className="relative flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索全部市场股票/加密货币..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value)
                    setShowSearchResults(true)
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {globalSearch && (
                  <button
                    onClick={() => {
                      setGlobalSearch('')
                      setShowSearchResults(false)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* 搜索结果下拉框 */}
              {showSearchResults && globalSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {searchResults.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map(({ item, market, marketName }) => {
                        const isWatched = watchlist.some(w => w.symbol === item.symbol && w.market === market)
                        return (
                          <div
                            key={`${market}-${item.symbol}`}
                            className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 cursor-pointer border-b border-border/50 last:border-0"
                            onClick={() => {
                              setSelectedStock(item)
                              setShowSearchResults(false)
                              setGlobalSearch('')
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                market === 'A_STOCK' ? 'bg-red-500' : 
                                market === 'HK_STOCK' ? 'bg-blue-500' : 'bg-orange-500'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <span>{item.symbol}</span>
                                  <span className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">{marketName}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-semibold text-sm mono-number">
                                  {'volume24h' in item ? '$' : (item as StockData).currency === 'HKD' ? 'HK$' : '¥'}
                                  {item.price < 1 ? item.price.toFixed(4) : item.price.toFixed(2)}
                                </div>
                                <div className={`text-xs mono-number ${item.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleWatch(item.symbol, market)
                                }}
                                className={`p-1.5 rounded-full transition-colors ${
                                  isWatched 
                                    ? 'text-yellow-500 hover:bg-yellow-500/10' 
                                    : 'text-muted-foreground hover:bg-secondary'
                                }`}
                                title={isWatched ? '取消自选' : '添加自选'}
                              >
                                <Star className={`h-4 w-4 ${isWatched ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      未找到匹配的股票或加密货币
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Tabs */}
              <div className="hidden sm:flex items-center gap-1 bg-secondary/50 rounded p-0.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    activeTab === 'all' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  全部市场
                </button>
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1 ${
                    activeTab === 'watchlist' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Star className="h-3 w-3" />
                  自选 ({watchlist.length})
                </button>
              </div>
              
              {/* Last update */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline" suppressHydrationWarning>
                  {lastUpdate.toLocaleTimeString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-screen-2xl mx-auto px-4 py-4 min-h-0">
        {activeTab === 'all' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full" style={{ minHeight: 'calc(100vh - 120px)' }}>
            {/* A股面板 */}
            <MarketPanel
              title="A股市场"
              marketType="A_STOCK"
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
              indices={aIndices}
              stocks={aStocks}
              watchlist={watchlist}
              onToggleWatch={toggleWatch}
              onStockClick={setSelectedStock}
              dataSource={aShareDataSource}
            />

            {/* 港股面板 */}
            <MarketPanel
              title="港股市场"
              marketType="HK_STOCK"
              icon={<Globe className="h-4 w-4 text-primary" />}
              indices={hkIdx}
              stocks={hkStk}
              watchlist={watchlist}
              onToggleWatch={toggleWatch}
              onStockClick={setSelectedStock}
              dataSource={hkDataSource}
            />

            {/* 加密货币面板 */}
            <MarketPanel
              title="加密货币"
              marketType="CRYPTO"
              icon={<Bitcoin className="h-4 w-4 text-primary" />}
              indices={[]}
              stocks={crypto}
              watchlist={watchlist}
              onToggleWatch={toggleWatch}
              onStockClick={setSelectedStock}
              dataSource={cryptoDataSource}
            />
          </div>
        ) : (
          /* Watchlist View with Predictions */
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  我的自选
                </h2>
                <p className="text-sm text-muted-foreground">
                  {watchlist.length > 0 
                    ? `共 ${watchlist.length} 只标的` 
                    : '点击股票旁边的星星添加自选'
                  }
                </p>
              </div>
              {watchlist.length > 0 && (
                <button
                  onClick={() => setShowPredictions(!showPredictions)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    showPredictions 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  AI预测
                </button>
              )}
            </div>
            
            {watchlist.length > 0 ? (
              <div className="space-y-4">
                {/* Group by market */}
                {['A_STOCK', 'HK_STOCK', 'CRYPTO'].map(market => {
                  const items = getWatchedStocks().filter(s => {
                    if (market === 'CRYPTO') return 'volume24h' in s
                    return (s as StockData).market === market
                  })
                  if (items.length === 0) return null
                  
                  return (
                    <div key={market} className="bg-card border border-border rounded-md overflow-hidden">
                      <div className="px-4 py-2 border-b border-border bg-secondary/30 text-sm font-medium">
                        {market === 'A_STOCK' ? 'A股' : market === 'HK_STOCK' ? '港股' : '加密货币'}
                      </div>
                      <div className="divide-y divide-border">
                        {items.map(stock => {
                          const predictionKey = `${market}-${stock.symbol}`
                          const prediction = predictions[predictionKey]
                          const stockMarket = market as MarketType
                          
                          return (
                            <div
                              key={stock.symbol}
                              className="hover:bg-secondary/30 transition-colors"
                            >
                              <div className="px-4 py-3 flex items-center justify-between">
                                <div 
                                  className="flex-1 cursor-pointer"
                                  onClick={() => setSelectedStock(stock)}
                                >
                                  <div className="font-medium">{stock.name}</div>
                                  <div className="text-xs text-muted-foreground">{stock.symbol}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="text-right cursor-pointer"
                                    onClick={() => setSelectedStock(stock)}
                                  >
                                    <div className="font-semibold mono-number">
                                      {'volume24h' in stock ? '$' : (stock as StockData).currency === 'HKD' ? 'HK$' : '¥'}
                                      {stock.price < 1 ? stock.price.toFixed(4) : stock.price.toFixed(2)}
                                    </div>
                                    <div className={`text-sm mono-number ${stock.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                    </div>
                                  </div>
                                  {/* 取消自选按钮 */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleWatch(stock.symbol, stockMarket)
                                    }}
                                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    title="取消自选"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Prediction Panel */}
                              {showPredictions && prediction && (
                                <div className={`px-4 py-3 border-t border-border/50 ${getSignalBgColor(prediction.signal)}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Brain className="h-4 w-4 text-primary" />
                                      <span className="text-sm font-medium">1日预测</span>
                                      <Badge variant="outline" className="text-xs">
                                        置信度 {prediction.confidence}%
                                      </Badge>
                                    </div>
                                    <div className={`flex items-center gap-1 font-semibold ${getSignalColor(prediction.signal)}`}>
                                      {prediction.signal === 'BUY' && <TrendingUp className="h-4 w-4" />}
                                      {prediction.signal === 'SELL' && <TrendingDown className="h-4 w-4" />}
                                      {prediction.signal === 'HOLD' && <Minus className="h-4 w-4" />}
                                      {getSignalText(prediction.signal)}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <div className="text-muted-foreground text-xs">预测价格</div>
                                      <div className="font-semibold mono-number">
                                        {'volume24h' in stock ? '$' : (stock as StockData).currency === 'HKD' ? 'HK$' : '¥'}
                                        {prediction.predictedPrice}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">预测涨跌</div>
                                      <div className={`font-semibold mono-number ${prediction.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                                        {prediction.changePercent >= 0 ? '+' : ''}{prediction.changePercent}%
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">RSI指标</div>
                                      <div className={`font-semibold ${
                                        prediction.indicators.rsi > 70 ? 'text-loss' : 
                                        prediction.indicators.rsi < 30 ? 'text-gain' : 'text-foreground'
                                      }`}>
                                        {prediction.indicators.rsi}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">趋势</div>
                                      <div className={`font-semibold ${
                                        prediction.indicators.trend === 'UP' ? 'text-gain' : 
                                        prediction.indicators.trend === 'DOWN' ? 'text-loss' : 'text-foreground'
                                      }`}>
                                        {prediction.indicators.trend === 'UP' ? '上升' : 
                                         prediction.indicators.trend === 'DOWN' ? '下降' : '震荡'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <BarChart3 className="h-3 w-3" />
                                    <span>分析依据: {prediction.reason}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>暂无自选标的</p>
                <p className="text-sm mt-1">切换到"全部市场"添加自选</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-border py-3">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <span>数据每10秒自动刷新</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                A股：{aShareDataSource === 'real' ? '新浪财经' : '模拟'} · 
                港股：{hkDataSource === 'real' ? '新浪财经' : '模拟'} · 
                加密货币：{cryptoDataSource === 'real' ? 'Binance' : '模拟'}
              </span>
            </div>
            <div>Market Pulse © 2025</div>
          </div>
        </div>
      </footer>

      {/* Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
      />
    </div>
  )
}
