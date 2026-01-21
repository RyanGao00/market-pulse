'use client'

import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
  color?: 'gain' | 'loss' | 'auto'
}

export function Sparkline({ 
  data, 
  width = 80, 
  height = 32, 
  className,
  color = 'auto' 
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Determine color based on trend
  const isGain = data[data.length - 1] >= data[0]
  const strokeColor = color === 'auto' 
    ? isGain ? 'hsl(var(--gain))' : 'hsl(var(--loss))'
    : color === 'gain' ? 'hsl(var(--gain))' : 'hsl(var(--loss))'

  // Generate path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height * 0.8 - height * 0.1
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  // Create gradient area
  const areaPoints = [
    `0,${height}`,
    ...points,
    `${width},${height}`,
  ].join(' ')

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={`gradient-${isGain ? 'gain' : 'loss'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#gradient-${isGain ? 'gain' : 'loss'})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current price dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height * 0.8 - height * 0.1}
        r="2"
        fill={strokeColor}
      />
    </svg>
  )
}
