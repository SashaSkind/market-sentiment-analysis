import type { DashboardData } from './types'

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return (await response.json()) as T
}

export async function getDashboard(ticker: string, period: number): Promise<DashboardData> {
  return fetchJson<DashboardData>(`/api/dashboard?ticker=${ticker}&period=${period}`)
}

export async function refreshStock(ticker: string) {
  return fetchJson('/api/stocks/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker }),
  })
}

export async function addStock(ticker: string) {
  return fetchJson('/api/stocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker }),
  })
}
