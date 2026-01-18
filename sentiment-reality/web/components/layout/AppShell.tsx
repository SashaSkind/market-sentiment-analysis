'use client'

import {
  AppBar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Link,
} from '@mui/material'

interface AppShellProps {
  ticker: string
  tickers: string[]
  period: number
  onTickerChange: (ticker: string) => void
  onPeriodChange: (period: number) => void
  onRefresh: () => void
  onAddStock: () => void
  lastUpdated?: string | null
  children: React.ReactNode
}

export default function AppShell({
  ticker,
  tickers,
  period,
  onTickerChange,
  onPeriodChange,
  onRefresh,
  onAddStock,
  lastUpdated,
  children,
}: AppShellProps) {
  const handleTickerChange = (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) {
      onTickerChange(value)
    }
  }

  const handlePeriodChange = (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) {
      onPeriodChange(Number(value))
    }
  }

  return (
    <Box>
      <Box sx={{ color: 'text.primary', pt: { xs: 2, md: 3 } }}>
        <Container
          maxWidth={false}
          sx={{ px: { xs: 2, sm: 3 }, maxWidth: { md: 960 }, mx: 'auto' }}
        >
          <Toolbar disableGutters sx={{ flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 512 512"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="512" height="512" rx="90" fill="url(#paint0_linear)" />
                  <path
                    d="M108 356 L196 248 L296 300 L404 148"
                    stroke="white"
                    strokeWidth="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="196" cy="248" r="18" fill="#3b82f6" stroke="white" strokeWidth="14" />
                  <circle cx="296" cy="300" r="18" fill="#3b82f6" stroke="white" strokeWidth="14" />
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="0"
                      y1="0"
                      x2="512"
                      y2="512"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#4fa9ff" />
                      <stop offset="1" stopColor="#1f4ddc" />
                    </linearGradient>
                  </defs>
                </svg>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                }}
              >
                Atlas: Market Sentiment Tool
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                display: { xs: 'none', md: 'flex' },
                '& a': {
                  color: 'text.secondary',
                  fontSize: 14,
                  '&:hover': { color: 'text.primary' },
                },
              }}
            >
              <Link href="#overview" underline="none">
                Overview
              </Link>
              <Link href="#signals" underline="none">
                Signals
              </Link>
              <Link href="#watchlist" underline="none">
                Watchlist
              </Link>
            </Stack>
            <Button
              variant="outlined"
              color="inherit"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              Run Daily Scan
            </Button>
          </Toolbar>
          {lastUpdated && (
            <Box sx={{ pb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Last updated {lastUpdated}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
      <Container
        maxWidth={false}
        sx={{
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 },
          maxWidth: { md: 960 },
          mx: 'auto',
        }}
      >
        {/* Controls box disabled */}
        {/* <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ mb: 3 }}
        >
          <Box
            sx={{
              width: '100%',
              borderRadius: 3,
              border: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
              bgcolor: 'rgba(20, 27, 26, 0.9)',
              p: { xs: 2, sm: 2.5 },
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Ticker
                </Typography>
                <ToggleButtonGroup
                  value={ticker}
                  exclusive
                  onChange={handleTickerChange}
                  sx={{
                    flexWrap: 'nowrap',
                    gap: 1,
                    overflowX: 'auto',
                    pb: 0.5,
                    '& .MuiToggleButton-root': {
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                      borderColor: 'rgba(148, 163, 184, 0.4)',
                    },
                  }}
                >
                  {tickers.map((item) => (
                    <ToggleButton key={item} value={item} size="small">
                      {item}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Period
                </Typography>
                <ToggleButtonGroup
                  value={String(period)}
                  exclusive
                  onChange={handlePeriodChange}
                  sx={{
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                      borderColor: 'rgba(148, 163, 184, 0.4)',
                    },
                  }}
                >
                  {[7, 30, 90].map((value) => (
                    <ToggleButton key={value} value={String(value)} size="small">
                      {value}d
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button variant="outlined" onClick={onAddStock} fullWidth>
                  Add Ticker
                </Button>
                <Button variant="contained" onClick={onRefresh} fullWidth>
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack> */}
        {children}
      </Container>
    </Box>
  )
}
