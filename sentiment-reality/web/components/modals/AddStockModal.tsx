'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { addStock } from '@/lib/api'

interface AddStockModalProps {
  open: boolean
  onClose: () => void
  onAdded: (ticker: string) => void
}

export default function AddStockModal({ open, onClose, onAdded }: AddStockModalProps) {
  const [ticker, setTicker] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const normalized = ticker.trim().toUpperCase()
    if (!/^[A-Z0-9]{1,6}$/.test(normalized)) {
      setError('Ticker must be 1–6 letters or numbers.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await addStock(normalized)
      onAdded(normalized)
      setTicker('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ticker.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Ticker</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Ticker"
            value={ticker}
            onChange={(event) => setTicker(event.target.value.toUpperCase())}
            helperText={error ?? 'Example: TSLA'}
            error={Boolean(error)}
            inputProps={{ maxLength: 6 }}
          />
          <Typography variant="caption" color="text.secondary">
            We will queue a backfill for this ticker.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
