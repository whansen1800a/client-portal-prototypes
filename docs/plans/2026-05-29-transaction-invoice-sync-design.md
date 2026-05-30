# Transaction–Invoice Auto-Match Design

**Date:** 2026-05-29
**Status:** Approved

## Problem

Transactions downloaded from Finicity and Plaid are not automatically linked to the invoices clients send their customers. Bookkeepers must manually mark invoices paid. When a transaction comes in whose amount, customer name, and date match an outstanding invoice, the system should auto-mark that invoice paid, notify the bookkeeper, and allow them to undo the match from either side.

## Decisions

| Question | Decision |
|---|---|
| Who triggers the match? | Auto on every sync + manual trigger |
| What counts as a match? | Exact amount + fuzzy customer name + ±30-day date window |
| Conflict resolution | Oldest unpaid invoice wins |
| Auto-match behavior | Auto-apply, log action, allow undo |
| UI placement | Both Transactions page and Invoices page |

## Architecture

```
Finicity/Plaid Sync
        │
        ▼
  Sync completes (existing pipeline)
        │
        ▼
  Dispatch: InvoiceMatchRequested event  ──► RabbitMQ queue
                                                    │
                                                    ▼
                                     InvoiceMatchConsumer (new)
                                                    │
                                          Run InvoiceTransactionMatcherService
                                                    │
                                     ┌──────────────┴──────────────┐
                                     ▼                             ▼
                              Match found                    No match found
                                     │
                              Create InvoiceTransactionMatch record
                              Mark Invoice → payment_status = 'paid'
                              Log: matched_by = 'auto', matched_at = now
                                     │
                                     ▼
                         Frontend polls GET /invoice-match?status=recent
                         Shows "auto-matched" notification

Manual trigger: POST /api/.../invoice/run-match
        │
        └──► Same RabbitMQ queue ──► Same consumer
```

## Data Model

### New entity: `InvoiceTransactionMatch`

```php
InvoiceTransactionMatch {
    id: UUID
    invoice: Invoice          // FK → Invoice (many-to-one)
    transaction: Transaction  // FK → Transaction (many-to-one)
    business: Business        // FK for scoping
    matched_by: enum('auto', 'manual')
    matched_at: DateTime
    unlinked_at: DateTime|null
    unlinked_by: string|null  // user ID if manually unlinked
}
```

A join entity is used instead of a FK on Invoice or Transaction so that match/unlink/re-match history is preserved. Unlinking soft-deletes by setting `unlinked_at`. Neither the `Invoice` nor `Transaction` entity requires new nullable fields.

### API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/account/{acc}/business/{biz}/invoice-match` | List matches (filter by transaction or invoice ID) |
| `POST` | `/api/account/{acc}/business/{biz}/invoice/run-match` | Manual trigger (rate-limited: 1/min per business) |
| `DELETE` | `/api/account/{acc}/business/{biz}/invoice-match/{id}` | Unlink (soft delete, reverts invoice to unpaid) |

## Matching Algorithm

Runs inside `InvoiceTransactionMatcherService` for each unmatched transaction:

1. **Pre-filter** — only unpaid invoices; skip transactions with an active match record
2. **Amount** — `abs(transaction.amount) === invoice.total` (exact, no tolerance)
3. **Customer name** — case-insensitive exact match, falling back to Levenshtein distance ≤ 3; step skipped if transaction has no `customer_name`
4. **Date window** — `transaction_date` within ±30 days of invoice `due_date` (configurable service parameter)
5. **Conflict resolution** — if multiple invoices pass all filters, pick the one with the earliest `due_date`
6. **Apply** — create `InvoiceTransactionMatch`, call `InvoiceService::updatePaymentStatus(invoice, 'paid')`

## Backend Components

### New files in `BookkeepingBundle`

| File | Purpose |
|---|---|
| `Entity/InvoiceTransactionMatch.php` | Doctrine entity |
| `Event/InvoiceMatchRequested.php` | Event carrying `businessId`, `accountId`, optional `transactionIds[]` |
| `RabbitMQ/InvoiceMatchConsumer.php` | Consumer — resolves context, calls matcher, logs results |
| `Service/InvoiceTransactionMatcherService.php` | Core matching algorithm |
| `Controller/InvoiceMatchController.php` | Three routes: list, run, unlink |

### Modified files

| File | Change |
|---|---|
| `Service/TransactionService.php` (or sync handler) | Dispatch `InvoiceMatchRequested` at end of successful sync |
| `Repository/EntityRepository/InvoiceRepository.php` | Add `findUnpaidByBusiness()` query method |

## Frontend Components

### Transactions page

- Each transaction row shows a **"Matched: Invoice #X"** chip when an active match exists
- Chip opens a popover with invoice details and an **Unlink** button
- Toolbar gains a **"Run Invoice Matching"** button that calls `POST .../invoice/run-match`, then polls `GET /invoice-match?status=recent` every 3 seconds (up to 30 seconds) and shows a toast with results

### Invoices page

- Auto-matched paid invoices show an **"Auto-matched from transaction"** label (distinct from manually-paid)
- Invoice detail shows linked transaction's date, description, and bank account
- **Unlink** button available; reverts `payment_status` to `'unpaid'`

### New frontend files

| File | Purpose |
|---|---|
| `src/services/apiService/invoiceMatch.ts` | `getInvoiceMatches()`, `runInvoiceMatch()`, `unlinkInvoiceMatch()` |
| `src/models/invoice-match-models.ts` | `InvoiceTransactionMatch` TypeScript interface |

## Error Handling & Edge Cases

| Case | Handling |
|---|---|
| Consumer failure | Requeue, max 3 retries, then dead-letter queue |
| Duplicate match | Check for existing active match before creating — idempotent |
| Invoice already manually paid | Excluded from candidates; matcher never overwrites manual status |
| Unlink side effects | Revert to `'unpaid'` only if no other active match links to same invoice |
| Negative transaction amounts | Normalize with `abs()` before amount comparison |
| Missing `customer_name` | Skip name-match step; match on amount + date window only |
| Manual trigger rate limiting | Once per minute per business to prevent queue flooding |
