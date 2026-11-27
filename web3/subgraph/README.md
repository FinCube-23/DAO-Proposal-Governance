# FinCube DAO subgraph (Ethereum Sepolia, self-hosted)

A self-hosted graph-node that indexes the FinCube DAO test contract on
Ethereum Sepolia, so that `audit-trail-service` has a working subgraph source.
It replaces the Graph Studio endpoints `fincube-proxy-supgraph/0.0.1` and
`fincube-subgraph/v0.0.2`, which returned `409` / `Not found` on 2026-11-27.

```
web3/subgraph/
  docker-compose.graph-node.yml   graph-node + IPFS (kubo) + Postgres
  .env.example                    copy to .env (untracked) and fill in
  fincube-dori-sepolia/           the subgraph (manifest, schema, mappings, ABI)
```

To see this stack together with the other running services (pgAdmin,
RabbitMQ, Grafana and so on), run `scripts/ops_dashboard.sh`; see
[docs/ops-dashboard.md](../../docs/ops-dashboard.md).

## What is indexed

| Item | Value |
|---|---|
| Network | Ethereum Sepolia (chainId 11155111) |
| Contract | `0x5202ca1edcbb5a8869d27ae02b5ec41f7f37facf` (`FincubeTesting`) |
| ABI source | Verified source on Blockscout (`eth-sepolia.blockscout.com`) |
| Event | `ProposalAdded(uint8 indexed proposalType, uint256 indexed proposalId, bytes data)` |
| Topic check | `keccak256("ProposalAdded(uint8,uint256,bytes)")` equals `PROPOSAL_TOPIC` in `audit-trail-service/.env` |
| `startBlock` | `8982308` (the contract creation block) |
| `endBlock` | `9010600` |
| `specVersion` | `1.3.0` |
| Deployment ID | `QmTLZbipa4XPTAYxX4pgHPjEaGwXshPjnUKPe6NbqH3jJ9` (version label `v0.0.2`) |
| Subgraph name | `fincube-dori-sepolia` |

### Why indexing ends at block 9010600

The stress-test dataset (`etherscan-transaction-data.js`) ends at block
9010493. Without an `endBlock`, graph-node keeps scanning toward the Sepolia
chain head (about 3.2 million blocks further). At the measured speed that
would take about 8 days and keep graph-node busy during experiments.
`endBlock: 9010600` stops indexing shortly after the last dataset
transaction. Once finished, `_meta.block.number` stays at `9010608`
(graph-node works in 10-block ranges, so it stops at the end of the last
range).

### Only `ProposalAdded` is populated

The contract emits no other event. `audit-trail-service` sends one GraphQL
query that requests seven collections (`proposalAddeds`, `proposalExecuteds`,
`proposalCanceleds`, `ownershipTransferreds`, `memberRegistereds`,
`memberApproveds`, `stablecoinTransfers`). GraphQL rejects the whole query if
any collection is missing, so the schema declares all seven. Six of them have
no handlers and stay empty.

## Start, check, stop

```bash
cd web3/subgraph
cp .env.example .env            # first time only; then edit it (see below)

# start (creates volumes on first run)
docker compose -f docker-compose.graph-node.yml up -d

# deploy the subgraph (first time, or after wiping volumes)
cd fincube-dori-sepolia
npm install
npm run codegen && npm run build
npm run create-local
npm run deploy-local            # version label v0.0.2
```

Check:

```bash
# data: latest indexed block, deployment, errors
curl -s -X POST http://localhost:18000/subgraphs/name/fincube-dori-sepolia \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ _meta { block { number } deployment hasIndexingErrors } }"}'

# indexing status
curl -s http://localhost:18030/graphql -H 'Content-Type: application/json' \
  -d '{"query":"{ indexingStatuses { subgraph health chains { latestBlock { number } } } }"}'
```

Stop:

```bash
docker compose -f docker-compose.graph-node.yml down       # keeps indexed data
docker compose -f docker-compose.graph-node.yml down -v    # also deletes indexed data
```

Re-indexing the full range from scratch took about 82 minutes on the
reference machine.

### `.env`

`.env` is untracked and must never be committed.

| Variable | Meaning |
|---|---|
| `ETHEREUM_RPC` | Ethereum Sepolia RPC URL, for example `https://eth-sepolia.g.alchemy.com/v2/<key>` |
| `GRAPH_POSTGRES_PASSWORD` | Local password for the graph-node Postgres |

## Images and ports

| Service | Image | Host port (loopback only) |
|---|---|---|
| graph-node | `graphprotocol/graph-node:v0.45.0` | 18000 queries, 18001 WebSocket, 18020 admin, 18030 status, 18040 metrics |
| IPFS | `ipfs/kubo:v0.43.1` | 15001 API |
| Postgres | `postgres:16.14` | not published |

Compose project name: `fincube-subgraph`. graph-node is also attached to the
external Docker network `fincube23_network` (create it with
`docker network create fincube23_network` if it does not exist), so other
FinCube containers reach it as `http://fincube-graph-node:8000`. That works on
macOS and Linux; `host.docker.internal` may not reach a loopback-only port on
Linux.

## Known limits

- **Alchemy free tier.** It rejects `eth_getLogs` requests larger than 10
  blocks. The compose file therefore sets
  `GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE=10`. Without it graph-node asks for 100
  blocks, receives HTTP 400, retries with backoff, and indexes about 50 times
  slower. On a paid plan, raise or remove it.
- **Apple Silicon.** The graph-node image is `linux/amd64` only and runs under
  emulation on arm64 hosts, which is slower.
- **Logs.** graph-node prints the RPC URL, including the API key, in its
  startup log. Do not share `docker logs fincube-graph-node` unredacted.

## Pointing audit-trail-service at it

Set these three variables in `backend/audit-trail-service/.env` (a local,
untracked file) and recreate the container
(`docker compose up -d --force-recreate audit-app`):

```
ALCHEMY_NETWORK=eth-sepolia
DAO_CONTRACT_ADDRESS=0x5202ca1edcbb5a8869d27ae02b5ec41f7f37facf
SUBGRAPH_QUERY_ENDPOINT=http://fincube-graph-node:8000/subgraphs/name/fincube-dori-sepolia
```

`ALCHEMY_NETWORK=eth-sepolia` selects the Alchemy SDK's built-in Ethereum
Sepolia network, so `ALCHEMY_URL` is ignored while it is set. Leave the topic
variables as they are; they already match this contract.
