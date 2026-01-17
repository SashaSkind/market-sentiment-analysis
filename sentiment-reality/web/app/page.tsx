import type { DashboardData } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const TRACKED_TICKERS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN']

async function fetchDashboard(ticker: string, period: number = 90) {
  try {
    const response = await fetch(
      `${API_BASE}/dashboard?ticker=${ticker}&period=${period}`,
      { cache: 'no-store' }
    )
    if (!response.ok) {
      return null
    }
    return (await response.json()) as DashboardData
  } catch {
    return null
  }
}

function formatNumber(value?: number | null, digits: number = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  return value.toFixed(digits)
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function alignmentLabel(score?: number | null) {
  if (score === null || score === undefined) {
    return 'unknown'
  }
  if (score < 0) {
    return 'high'
  }
  if (score < 0.3) {
    return 'medium'
  }
  return 'low'
}

function scalePercent(
  value: number | null | undefined,
  min: number,
  max: number
) {
  if (value === null || value === undefined) {
    return 0
  }
  const clamped = Math.min(Math.max(value, min), max)
  return ((clamped - min) / (max - min)) * 100
}

export default async function Home() {
  const dashboards = await Promise.all(
    TRACKED_TICKERS.map((ticker) => fetchDashboard(ticker))
  )
  const data = dashboards.filter(Boolean) as DashboardData[]
  const spotlight =
    data.reduce<DashboardData | null>((best, item) => {
      if (!best) {
        return item
      }
      const bestScore = best.alignment?.score ?? 0
      const nextScore = item.alignment?.score ?? 0
      return nextScore < bestScore ? item : best
    }, null) ?? null

  const avgSentiment =
    data.length === 0
      ? null
      : data.reduce((sum, item) => sum + (item.sentiment_summary.current_score || 0), 0) /
        data.length

  const sentimentPercent = scalePercent(avgSentiment, -1, 1)
  const pricePercent = scalePercent(spotlight?.price_summary.period_return ?? null, -10, 10)
  const alignmentPercent = scalePercent(spotlight?.alignment.score ?? null, -1, 1)

  return (
    <div className="page">
      <div className="bg-blur bg-blur-one" />
      <div className="bg-blur bg-blur-two" />

      <header className="nav">
        <div className="brand">
          <span className="brand-mark">SR</span>
          <span>Sentiment Reality</span>
        </div>
        <nav className="nav-links">
          <a href="#overview">Overview</a>
          <a href="#signals">Signals</a>
          <a href="#watchlist">Watchlist</a>
        </nav>
        <button className="cta">Run Daily Scan</button>
      </header>

      <section className="hero" id="overview">
        <div className="hero-copy">
          <p className="eyebrow">Narrative vs. Performance</p>
          <h1>Find the moments when sentiment goes confidently wrong.</h1>
          <p className="subhead">
            Live dashboard for the five tracked tickers. Powered by the
            precomputed metrics in the API.
          </p>
          <div className="hero-actions">
            <button className="cta cta-primary">View Misalignment Map</button>
            <button className="cta cta-secondary">Export Weekly Brief</button>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-header">
            <span>{spotlight?.ticker ?? 'Spotlight'}</span>
            <span className="pill">Last 90d</span>
          </div>
          <div className="hero-metric">
            <p>Average Sentiment</p>
            <h2>{avgSentiment === null ? '—' : formatNumber(avgSentiment, 2)}</h2>
            <span className="trend up">
              {data.length ? `${data.length} tickers tracked` : 'No data yet'}
            </span>
          </div>
          <div className="hero-bars">
            <div>
              <span>Sentiment</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${sentimentPercent}%` }} />
              </div>
            </div>
            <div>
              <span>Price Return</span>
              <div className="bar">
                <div className="bar-fill alt" style={{ width: `${pricePercent}%` }} />
              </div>
            </div>
            <div>
              <span>Alignment</span>
              <div className="bar">
                <div
                  className="bar-fill dark"
                  style={{ width: `${alignmentPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid" id="signals">
        <div className="card">
          <h3>Misalignment Index</h3>
          <p className="value">
            {spotlight?.alignment.score === undefined || spotlight?.alignment.score === null
              ? '—'
              : formatNumber(spotlight?.alignment.score, 2)}
          </p>
          <p className="delta down">
            {spotlight?.alignment.interpretation ?? 'Waiting for signal'}
          </p>
          <div className="sparkline">
            <div className="spark" />
          </div>
        </div>
        <div className="card">
          <h3>Top Divergence</h3>
          <p className="value">{spotlight?.ticker ?? '—'}</p>
          <p className="muted">
            Sentiment {formatNumber(spotlight?.sentiment_summary.current_score, 2)} ·
            Price {formatPercent(spotlight?.price_summary.period_return)}
          </p>
          <div className="tag-row">
            <span>{spotlight?.alignment.interpretation ?? 'Unlabeled'}</span>
            <span>{spotlight?.sentiment_summary.dominant_label ?? 'NEUTRAL'}</span>
            <span>{spotlight?.sentiment_summary.trend ?? 'stable'}</span>
          </div>
        </div>
        <div className="card">
          <h3>Tracked Coverage</h3>
          <div className="heatmap">
            {TRACKED_TICKERS.map((ticker) => (
              <span key={ticker} className="cell tone-2">
                {ticker}
              </span>
            ))}
          </div>
          <p className="muted">
            {data.length === 0
              ? 'API unavailable or no data returned.'
              : 'Live data for all tracked tickers.'}
          </p>
        </div>
      </section>

      <section className="table" id="watchlist">
        <div className="table-header">
          <h2>Watchlist</h2>
          <div className="filters">
            <button>7d</button>
            <button className="active">90d</button>
            <button>180d</button>
          </div>
        </div>
        <div className="rows">
          {TRACKED_TICKERS.map((ticker) => {
            const row = data.find((item) => item.ticker === ticker)
            const alignment = alignmentLabel(row?.alignment.score)
            return (
              <div className="row" key={ticker}>
                <div className="symbol">{ticker}</div>
                <div className="metric">
                  {formatNumber(row?.sentiment_summary.current_score, 2)}
                </div>
                <div className="metric">
                  {formatPercent(row?.price_summary.period_return)}
                </div>
                <div className={`pill ${alignment}`}>{alignment}</div>
                <div className="notes">
                  {row?.alignment.interpretation ?? 'Awaiting metrics'}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="timeline">
        <div>
          <h2>Today&apos;s Narrative Shifts</h2>
          <p className="muted">
            Generated by clustering topics across news and social feeds.
          </p>
        </div>
        <div className="timeline-cards">
          {[
            {
              title: 'Rate-cut optimism fades',
              detail: 'Sentiment dropped 12% after CPI revision.',
              time: '2h ago',
            },
            {
              title: 'AI spend confidence returns',
              detail: 'Positive revision in cloud capex chatter.',
              time: '5h ago',
            },
            {
              title: 'Energy narrative flips bullish',
              detail: 'Reddit momentum outpaces price action.',
              time: '7h ago',
            },
          ].map((item) => (
            <div className="timeline-card" key={item.title}>
              <span className="time">{item.time}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
