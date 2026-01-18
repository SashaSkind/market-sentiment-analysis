'use client'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'

export default function MuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
