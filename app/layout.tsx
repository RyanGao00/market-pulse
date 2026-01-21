import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Market Pulse | 实时行情看板',
  description: '实时追踪A股、港股、加密货币行情数据',
  keywords: ['股票', 'A股', '港股', '加密货币', '实时行情', '交易'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="font-mono">{children}</body>
    </html>
  )
}
