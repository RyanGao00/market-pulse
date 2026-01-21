'use client'

import { cn, formatNumber, formatPercent, formatLargeNumber, formatCurrency } from '@/lib/utils'
import { StockData, CryptoData } from '@/lib/types'
import { Sparkline } from '@/components/ui/sparkline'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'

interface StockRowProps {
  stock: StockData | CryptoData
  isWatched?: boolean
  onToggleWatch?: () => void
  onClick?: () => void
}

export function StockRow({ stock, isWatched = false, onToggleWatch, onClick }: StockRowProps) {
  const isGain = stock.changePercent >= 0
  const isCrypto = 'volume24h' in stock
  const currency = isCrypto ? 'USD' : (stock as StockData).currency

  return (
    <div 
      className="stock-row group"
      onClick={onClick}
    >
      {/* Symbol & Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleWatch?.()
          }}
          className={cn(
            "p-1 rounded transition-colors",
            isWatched 
              ? "text-yellow-500 hover:text-yellow-400" 
              : "text-muted-foreground/40 hover:text-muted-foreground"
          )}
        >
          <Star className={cn("h-4 w-4", isWatched && "fill-current")} />
        </button>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{stock.name}</div>
          <div className="text-xs text-muted-foreground">{stock.symbol}</div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="hidden sm:block mx-4">
        {stock.sparkline && (
          <Sparkline data={stock.sparkline} width={60} height={24} />
        )}
      </div>

      {/* Price & Change */}
      <div className="text-right">
        <div className="font-semibold text-sm mono-number">
          {currency === 'USD' ? '$' : currency === 'HKD' ? 'HK$' : '¥'}
          {stock.price < 1 
            ? stock.price.toFixed(4) 
            : formatNumber(stock.price)
          }
        </div>
        <div className={cn(
          "flex items-center justify-end gap-1 text-xs mono-number",
          isGain ? "text-gain" : "text-loss"
        )}>
          {isGain ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{formatPercent(stock.changePercent)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="hidden md:block text-right ml-4 w-24">
        <div className="text-xs text-muted-foreground">成交量</div>
        <div className="text-sm mono-number">
          {formatLargeNumber(isCrypto ? (stock as CryptoData).volume24h : stock.volume)}
        </div>
      </div>
    </div>
  )
}
