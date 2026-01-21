'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { IndexData, StockData, CryptoData, MarketType, WatchlistItem } from '@/lib/types'
import { sortData, SortField, SortOrder } from '@/lib/market-data'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { IndexCard } from './index-card'
import { StockRow } from './stock-row'
import { ArrowUpDown, ChevronDown, TrendingUp, Activity, DollarSign, BarChart3 } from 'lucide-react'

interface MarketPanelProps {
  title: string
  marketType: MarketType
  icon: React.ReactNode
  indices: IndexData[]
  stocks: (StockData | CryptoData)[]
  watchlist: WatchlistItem[]
  onToggleWatch: (symbol: string, market: MarketType) => void
  onStockClick: (stock: StockData | CryptoData) => void
  dataSource?: 'real' | 'mock'
  className?: string
}

const sortOptions: { value: SortField; label: string; icon: React.ReactNode }[] = [
  { value: 'changePercent', label: '涨跌幅', icon: <TrendingUp className="h-3 w-3" /> },
  { value: 'volume', label: '成交量', icon: <Activity className="h-3 w-3" /> },
  { value: 'price', label: '价格', icon: <DollarSign className="h-3 w-3" /> },
  { value: 'marketCap', label: '市值', icon: <BarChart3 className="h-3 w-3" /> },
]

export function MarketPanel({
  title,
  marketType,
  icon,
  indices,
  stocks,
  watchlist,
  onToggleWatch,
  onStockClick,
  dataSource = 'mock',
  className,
}: MarketPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('volume')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Filter stocks by search query
  const filteredStocks = searchQuery
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks

  // Sort stocks
  const sortedStocks = sortData(filteredStocks as Record<string, unknown>[], sortField, sortOrder) as (StockData | CryptoData)[]

  // Check if stock is in watchlist
  const isWatched = useCallback(
    (symbol: string) => watchlist.some((w) => w.symbol === symbol && w.market === marketType),
    [watchlist, marketType]
  )

  // Toggle sort order or change field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setShowSortMenu(false)
  }

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className={`status-dot ${dataSource === 'real' ? 'online' : 'offline'}`} />
            <span className="text-xs text-muted-foreground">{dataSource === 'real' ? '实时' : '模拟'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 space-y-4">
        {/* Indices */}
        <div className="flex-shrink-0">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            大盘指数
          </div>
          <div className="grid gap-2">
            {indices.map((index) => (
              <IndexCard key={index.symbol} index={index} />
            ))}
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              placeholder="搜索代码或名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded transition-colors"
            >
              <ArrowUpDown className="h-3 w-3" />
              <span className="hidden sm:inline">排序</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", showSortMenu && "rotate-180")} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors",
                      sortField === option.value && "text-primary"
                    )}
                  >
                    {option.icon}
                    {option.label}
                    {sortField === option.value && (
                      <span className="ml-auto text-xs">
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stock List Header */}
        <div className="flex-shrink-0 text-xs text-muted-foreground flex items-center gap-1">
          <Activity className="h-3 w-3" />
          成交量 Top {sortField === 'volume' ? '' : `(按${sortOptions.find(o => o.value === sortField)?.label})`}
        </div>

        {/* Stock List */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-4 px-4">
          <div className="space-y-1">
            {sortedStocks.length > 0 ? (
              sortedStocks.map((stock) => (
                <StockRow
                  key={stock.symbol}
                  stock={stock}
                  isWatched={isWatched(stock.symbol)}
                  onToggleWatch={() => onToggleWatch(stock.symbol, marketType)}
                  onClick={() => onStockClick(stock)}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? '未找到匹配结果' : '暂无数据'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
