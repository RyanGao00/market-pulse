# Market Pulse | 实时行情看板

<div align="center">

一个功能强大的实时股票和加密货币行情看板，支持 A 股、港股和加密货币市场数据追踪。

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-latest-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.0-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ✨ 核心功能

### 📊 多市场实时数据
- **A股市场**：实时追踪上证指数、深证成指、创业板指及热门个股
- **港股市场**：监控恒生指数、科技指数和热门港股
- **加密货币**：跟踪 BTC、ETH、SOL 等主流加密货币价格

### 🎯 智能功能
- **价格预测**：基于 SMA + RSI 技术指标的 1 日价格预测
- **购买建议**：根据技术分析提供买入/持有/卖出建议
- **自选资产**：添加关注的股票和加密货币到自选列表
- **全局搜索**：跨三大市场快速搜索任意股票或加密货币
- **数据状态显示**：透明展示实时数据或模拟数据状态

### 🎨 用户体验
- **自动刷新**：每 10 秒自动更新行情数据
- **响应式设计**：完美适配桌面和移动设备
- **明暗主题**：支持亮色和暗色主题切换
- **中英双语**：支持中文和英文界面切换
- **数据源标注**：清晰标识各市场数据来源（新浪财经/Binance/模拟数据）

---

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
```

---

## 🛠️ 技术栈

### 前端框架
- **Next.js 16.1.4**：React 全栈框架，支持 SSR 和 API 路由
- **React 19**：最新的 React 版本
- **TypeScript**：类型安全的 JavaScript

### UI 组件与样式
- **Tailwind CSS 3.4.0**：实用优先的 CSS 框架
- **shadcn/ui**：高质量的 React 组件库
- **Lucide React**：精美的图标库
- **Recharts 2.10.0**：数据可视化图表库

### 工具库
- **class-variance-authority**：类型安全的变体组件
- **clsx**：条件类名组合
- **tailwind-merge**：Tailwind 类名合并

---

## 📁 项目结构

```
market-pulse/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   ├── a-share/        # A股数据接口
│   │   ├── hk/             # 港股数据接口
│   │   └── crypto/         # 加密货币数据接口
│   ├── globals.css         # 全局样式和主题配置
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页主组件
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── header/             # 头部导航组件
│   ├── market/             # 市场面板组件
│   └── prediction/         # 价格预测组件
├── lib/                     # 工具函数和类型定义
│   ├── api-service.ts      # API 服务层
│   ├── prediction.ts       # 价格预测算法
│   ├── mock-data.ts        # 模拟数据
│   └── utils.ts            # 通用工具函数
├── types/                   # TypeScript 类型定义
│   └── market.ts           # 市场数据类型
├── tailwind.config.ts       # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目依赖
```

---

## 🔧 核心功能详解

### 1. 数据获取与处理

#### A股 & 港股数据
- **数据源**：新浪财经 API
- **更新频率**：每 10 秒自动刷新
- **缓存策略**：`cache: 'no-store'` 保证实时性
- **指标包含**：股价、涨跌幅、成交量、成交额

#### 加密货币数据
- **数据源**：Binance API（备用：CoinCap API）
- **支持币种**：BTC, ETH, SOL, XRP, BNB, DOGE, ADA, LINK, AVAX, DOT
- **备用方案**：网络异常时使用模拟数据
- **状态标识**：明确显示"实时"或"模拟"状态

### 2. 价格预测算法

基于技术分析指标的短期价格预测模型：

- **SMA (简单移动平均)**：计算 5 日和 10 日均线趋势
- **RSI (相对强弱指标)**：判断超买超卖状态
- **预测逻辑**：
  - 看涨信号：短期均线上穿长期均线 + RSI < 70
  - 看跌信号：短期均线下穿长期均线 + RSI > 30
  - 中性信号：其他情况

### 3. 自选管理

- **本地存储**：使用 `localStorage` 持久化用户自选
- **快速操作**：搜索结果和列表中一键添加/移除
- **跨市场支持**：统一管理 A股、港股和加密货币
- **状态同步**：实时更新自选列表数据

### 4. 全局搜索

- **搜索范围**：A股、港股、加密货币三大市场
- **搜索维度**：支持股票代码和名称搜索
- **结果展示**：下拉框显示前 10 条结果
- **市场标识**：彩色圆点区分不同市场（红色=A股，蓝色=港股，橙色=加密货币）

---

## 🎨 主题配置

项目支持亮色和暗色两种主题模式，通过 CSS 变量配置：

### 亮色模式
- 背景色：纯白 (`--background: 0 0% 100%`)
- 前景色：深灰蓝 (`--foreground: 222.2 84% 4.9%`)

### 暗色模式
- 背景色：深蓝灰 (`--background: 222.2 84% 4.9%`)
- 前景色：浅灰 (`--foreground: 210 40% 98%`)

所有颜色使用 HSL 格式，确保主题切换的一致性。

---

## 📊 数据源说明

| 市场类型 | 数据源 | 状态显示 | 更新频率 |
|---------|--------|---------|---------|
| A股市场 | 新浪财经 API | 实时/模拟 | 10秒 |
| 港股市场 | 新浪财经 API | 实时/模拟 | 10秒 |
| 加密货币 | Binance API | 实时/模拟 | 10秒 |

**注意**：当 API 请求失败时，系统会自动降级为模拟数据，并在界面上明确标识数据状态。

---

## 🔐 API 路由

### GET `/api/a-share`
获取 A股市场数据

**响应示例**：
```json
{
  "success": true,
  "data": [
    {
      "symbol": "600519",
      "name": "贵州茅台",
      "price": 1351.06,
      "change": -22.43,
      "changePercent": -1.64,
      "volume": 6451600,
      "amount": 87128000000
    }
  ]
}
```

### GET `/api/hk`
获取港股市场数据

### GET `/api/crypto`
获取加密货币市场数据

---

## 🌍 多语言支持

项目支持中英文双语界面：

- **中文**：默认语言，所有界面文本使用中文显示
- **英文**：可通过配置切换为英文界面

语言配置位于各组件的 `locale` 或 `lang` 属性中。

---

## 🐛 常见问题

### 1. 端口被占用
```bash
# 错误：Port 3000 is in use
# 解决：使用其他端口
PORT=3001 npm run dev
```

### 2. API 请求失败
- 检查网络连接
- 确认防火墙设置
- 系统会自动使用模拟数据

### 3. 数据不更新
- 清除浏览器缓存
- 删除 `.next` 文件夹后重启：
```bash
rm -rf .next
npm run dev
```

---

## 🤝 贡献指南

欢迎提交问题和拉取请求！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启拉取请求

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👨‍💻 作者

Market Pulse © 2025

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [新浪财经](https://finance.sina.com.cn/) - A股和港股数据源
- [Binance](https://www.binance.com/) - 加密货币数据源

---

<div align="center">

**⭐ 如果这个项目对你有帮助，欢迎给个 Star！**

</div>
