# Changelog

## [2.0.0] - YYYY-MM-DD
### Added
- DORI module in the Audit-Trail service behind `DORI_ENABLED` (EventKey, observation sources, reconciliation with q and canonical lookup, revision records).
- New tables via migrations only (`dori_*`); existing tables unchanged.
- New exchange and queues; DAO and User-Management consumers record receipts keyed by (EventKey, version).
- Multi-log test contract under `web3/test-contracts/`.

### Unchanged
- Existing WebSocket listener, status and trace jobs, exchanges and consumers.

## [1.0.0]
- State archived for the original submission.
