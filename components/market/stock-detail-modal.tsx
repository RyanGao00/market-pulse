'use client'

import { cn, formatNumber, formatPercent, formatLargeNumber } from '@/lib/utils'
import { StockData, CryptoData, MarketType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface StockDetailModalProps {
  stock: StockData | CryptoData | null
  onClose: () => void
}

export function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  if (!stock) return null

  const isGain = stock.changePercent >= 0
  const isCrypto = 'volume24h' in stock
  const currency = isCrypto ? '$' : (stock as StockData).currency === 'HKD' ? 'HK$' : '¥'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">{stock.name}</h2>
              <div className="text-sm text-muted-foreground">{stock.symbol}</div>
            </div>
            <Badge variant={isGain ? 'gain' : 'loss'}>
              {formatPercent(stock.changePercent)}
            </Badge>
          </div>
        </div>

        {/* Price */}
        <div className="px-6 py-4 border-b border-border">
          <div className={cn(
            "text-3xl font-bold mono-number",
            isGain ? "text-gain" : "text-loss"
          )}>
            {currency}{stock.price < 1 ? stock.price.toFixed(4) : formatNumber(stock.price)}
          </div>
          <div className={cn(
            "text-sm mono-number mt-1",
            isGain ? "text-gain" : "text-loss"
          )}>
            {isGain ? '+' : ''}{stock.change < 1 ? stock.change.toFixed(4) : formatNumber(stock.change)} ({formatPercent(stock.changePercent)})
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-4 grid grid-cols-2 gap-4">
          {isCrypto ? (
            <>
              <DetailItem label="24h最高" value={`$${formatNumber((stock as CryptoData).high24h)}`} />
              <DetailItem label="24h最低" value={`$${formatNumber((stock as CryptoData).low24h)}`} />
              <DetailItem label="24h成交额" value={`$${formatLargeNumber((stock as CryptoData).volume24h)}`} />
              <DetailItem label="市值" value={`$${formatLargeNumber((stock as CryptoData).marketCap)}`} />
            </>
          ) : (
            <>
              <DetailItem label="开盘" value={`${currency}${formatNumber((stock as StockData).open)}`} />
              <DetailItem label="最高" value={`${currency}${formatNumber((stock as StockData).high)}`} />
              <DetailItem label="最低" value={`${currency}${formatNumber((stock as StockData).low)}`} />
              <DetailItem label="成交量" value={formatLargeNumber((stock as StockData).volume)} />
              <DetailItem label="成交额" value={`${currency}${formatLargeNumber((stock as StockData).turnover)}`} />
              {(stock as StockData).marketCap && (
                <DetailItem label="市值" value={`${currency}${formatLargeNumber((stock as StockData).marketCap!)}`} />
              )}
              {(stock as StockData).pe && (
                <DetailItem label="市盈率" value={(stock as StockData).pe!.toFixed(2)} />
              )}
            </>
          )}
        </div>

        {/* Close button */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded text-sm font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium mono-number">{value}</div>
    </div>
  )
}
