# Task 9: Transactions Page Match UI — Complete

## Files modified in portal-web-master

### `src/components/bookkeeping/transactions/TransactionsList.tsx`
- Added `Chip` to MUI imports
- Added `useEffect` to React imports
- Added imports: `getInvoiceMatches`, `unlinkInvoiceMatch`, `InvoiceTransactionMatch`
- Added `matchMap` state (`Record<string, InvoiceTransactionMatch>`)
- Added `useEffect` to load matches on mount and build id-keyed map
- Added `handleUnlink` handler (stops propagation, calls API, removes from map)
- Added match `Chip` in each row's `secondary` block (after date/bank box, before `Hidden mdUp`)

### `src/components/bookkeeping/transactions/Transactions.tsx`
- Added import: `runInvoiceMatch`, `getInvoiceMatches`
- Added `matchRunning` boolean state
- Added `handleRunMatch` async handler with polling (3s interval, max 10 attempts)
- Added "Run Invoice Matching" outlined button to the toolbar Grid after Reconnect buttons
