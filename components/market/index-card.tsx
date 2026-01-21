'use client'

import { cn, formatNumber, formatPercent, formatLargeNumber } from '@/lib/utils'
import { IndexData } from '@/lib/types'
import { Sparkline } from '@/components/ui/sparkline'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface IndexCardProps {
  index: IndexData
  className?: string
}

export function IndexCard({ index, className }: IndexCardProps) {
  const isGain = index.changePercent >= 0

  return (
    <div className={cn("index-card group", className)}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">{index.symbol}</div>
          <div className="text-sm font-medium">{index.name}</div>
        </div>
        {index.sparkline && (
          <Sparkline data={index.sparkline} width={60} height={24} />
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-lg font-semibold mono-number">
            {formatNumber(index.price)}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-sm mono-number",
            isGain ? "text-gain" : "text-loss"
          )}>
            {isGain ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{formatNumber(Math.abs(index.change))}</span>
            <span>({formatPercent(index.changePercent)})</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">成交额</div>
          <div className="text-sm mono-number">{formatLargeNumber(index.volume)}</div>
        </div>
      </div>
    </div>
  )
}
