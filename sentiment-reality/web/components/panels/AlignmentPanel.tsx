'use client'

import { Card, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material'

interface AlignmentPanelProps {
  tickers: string[]
  statusText: string
  selectedTicker?: string
  selectedPrice?: number | null
  selectedSentiment?: number | null
  onSelectTicker?: (ticker: string) => void
  isLoading?: boolean
}

export default function AlignmentPanel({
  tickers,
  statusText,
  selectedTicker,
  selectedPrice,
  selectedSentiment,
  onSelectTicker,
  isLoading,
}: AlignmentPanelProps) {
  return (
    <Card
      sx={{
        width: '100%',
        minHeight: 220,
        borderRadius: 3,
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
        bgcolor: 'background.paper',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6">Watchlist</Typography>
          {isLoading ? (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" width={64} height={24} />
                ))}
              </Stack>
              <Skeleton variant="text" width={200} />
            </Stack>
          ) : (
            <>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {tickers.map((ticker) => (
                  <Chip
                    key={ticker}
                    label={ticker}
                    size="small"
                    clickable
                    onClick={() => onSelectTicker?.(ticker)}
                    variant={ticker === selectedTicker ? 'filled' : 'outlined'}
                    color={ticker === selectedTicker ? 'primary' : 'default'}
                  />
                ))}
              </Stack>
              <Stack spacing={0.5}>
                <Typography color="text.secondary">{statusText}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedTicker ?? '—'} price:{' '}
                  {selectedPrice !== undefined && selectedPrice !== null
                    ? `$${selectedPrice.toFixed(2)}`
                    : '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sentiment score:{' '}
                  {selectedSentiment !== undefined && selectedSentiment !== null
                    ? selectedSentiment.toFixed(2)
                    : '—'}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
