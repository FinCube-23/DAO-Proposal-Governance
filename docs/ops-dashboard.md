# Local monitoring page

`scripts/ops_dashboard.sh` builds a single HTML page that links to the local
FinCube services and holds a few commands you can copy. Use it while running
experiments to see what is up and where.

```bash
scripts/ops_dashboard.sh                   # build the page and open it
scripts/ops_dashboard.sh --results <dir>   # also link the newest run folder in <dir>
scripts/ops_dashboard.sh --no-open         # write the page and print its path only
```

Needs `bash` 3.2 or newer and `docker`. It opens the page with `open` on macOS
and `xdg-open` on Linux.

## Where the page is written

`${TMPDIR:-/tmp}/fincube-ops-dashboard.html`, outside the repository. Running
the script never changes the working tree, so experiment runs that require a
clean tree are not affected. The page is one self-contained file with no
external scripts or fonts, and it follows the system light or dark setting.

## What it shows

Ports are discovered with `docker port`, so they follow whatever the compose
files publish. A service whose port is not found is marked "not running".

| Card | Container (port) | Notes |
|---|---|---|
| pgAdmin | `pgadmin4` (80) | Servers are in the FinCube group |
| RabbitMQ management | `rabbitmq` (15672) | Queues and consumers |
| Subgraph GraphiQL | `fincube-graph-node` (8000) | `/subgraphs/name/fincube-dori-sepolia/graphql`, pre-filled with `_meta` and the first 10 `proposalAddeds` |
| Index-node status | `fincube-graph-node` (8030) | `/graphql/playground`, pre-filled with `indexingStatusForCurrentVersion` |
| Grafana | `grafana` (3000) | Explore has Loki logs and Tempo traces |
| Prometheus | `prometheus` (9090) | Metrics and targets |
| Tempo | `tempo` (3200) | API only, no web UI |
| Loki | `loki` (3100) | API only, no web UI |

The queries are also shown as copyable blocks, in case a GraphiQL version does
not apply the `?query=` parameter.

Copyable blocks:

- the audit-trail SQL, to run in pgAdmin (FinCube, audit-trail, Query Tool):
  `SELECT trx_status, confirmation_source, count(*) FROM transactions GROUP BY 1, 2 ORDER BY 1, 2;`
- the live CPU and memory command:
  `docker stats --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}'`

## `--results <dir>`

Adds a "Latest results" card linking to the most recently modified folder named
`run-*` anywhere below `<dir>` (up to six levels deep). If there is none, it
falls back to the newest direct subfolder. A missing directory only prints a
warning. Example:

```bash
scripts/ops_dashboard.sh --results ../Stress-Test/performance-testing/results
```

## Related

The subgraph stack the page links to is described in
[web3/subgraph/README.md](../web3/subgraph/README.md).
