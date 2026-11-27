#!/usr/bin/env bash
# Local monitoring page for the running FinCube services.
#
# Discovers the host ports of the running containers with `docker port`, writes
# one self-contained HTML page OUTSIDE the repository (so the working tree stays
# clean for experiment runs) and opens it in the default browser.
#
#   scripts/ops_dashboard.sh                    # build and open the page
#   scripts/ops_dashboard.sh --results <dir>    # also link the newest run folder in <dir>
#   scripts/ops_dashboard.sh --no-open          # only write the page and print its path
#
# Output: ${TMPDIR:-/tmp}/fincube-ops-dashboard.html
# Needs: bash 3.2+, docker. Works on macOS (open) and Linux (xdg-open).
set -euo pipefail

RESULTS_DIR=""
OPEN_PAGE=1
while [ $# -gt 0 ]; do
  case "$1" in
    --results)
      [ $# -ge 2 ] || { echo "--results needs a directory" >&2; exit 2; }
      RESULTS_DIR="$2"; shift 2 ;;
    --no-open) OPEN_PAGE=0; shift ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $1 (try --help)" >&2; exit 2 ;;
  esac
done

OUT="${TMPDIR:-/tmp}"
OUT="${OUT%/}/fincube-ops-dashboard.html"
SUBGRAPH_NAME="fincube-dori-sepolia"

DOCKER_OK=1
docker info >/dev/null 2>&1 || DOCKER_OK=0

# Host port that container $1 publishes for its container port $2 (empty if none).
port_of() {
  [ "$DOCKER_OK" = 1 ] || return 0
  docker port "$1" "$2/tcp" 2>/dev/null | head -n1 | sed 's/.*://' || true
}

html_escape() { sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'; }

# Percent-encode stdin (bash 3.2 compatible, byte-wise).
urlencode() {
  local LC_ALL=C s c i out=""
  s="$(cat)"
  for (( i = 0; i < ${#s}; i++ )); do
    c="${s:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) out="$out$c" ;;
      *) out="$out$(printf '%%%02X' "'$c")" ;;
    esac
  done
  printf '%s' "$out"
}

# card <title> <url or empty> <description>
# An empty url renders the card as "not running".
card() {
  local title="$1" url="$2" desc="$3"
  if [ -n "$url" ]; then
    printf '<a class="card" href="%s" target="_blank" rel="noopener"><span class="row"><b>%s</b><span class="badge ok">running</span></span><span class="url">%s</span><span class="desc">%s</span></a>\n' \
      "$url" "$title" "${url%%\?*}" "$desc"
  else
    printf '<div class="card off"><span class="row"><b>%s</b><span class="badge off">not running</span></span><span class="desc">%s</span></div>\n' \
      "$title" "$desc"
  fi
}

# block <label> <text> : a copyable text block.
block() {
  printf '<div class="block"><div class="row"><b>%s</b><button type="button" class="copy">Copy</button></div><pre>%s</pre></div>\n' \
    "$1" "$(printf '%s' "$2" | html_escape)"
}

# ---- discover ports -------------------------------------------------------
P_PGADMIN="$(port_of pgadmin4 80)"
P_GRAPH_Q="$(port_of fincube-graph-node 8000)"
P_GRAPH_S="$(port_of fincube-graph-node 8030)"
P_RABBIT="$(port_of rabbitmq 15672)"
P_GRAFANA="$(port_of grafana 3000)"
P_PROM="$(port_of prometheus 9090)"
P_TEMPO="$(port_of tempo 3200)"
P_LOKI="$(port_of loki 3100)"

url() { [ -n "$2" ] && printf 'http://localhost:%s%s' "$2" "$1" || true; }   # url <path> <port>

SUBGRAPH_QUERY='{
  _meta { block { number } deployment hasIndexingErrors }
  proposalAddeds(first: 10, orderBy: blockNumber, orderDirection: asc) {
    id
    transactionHash
    proposalId
    blockNumber
  }
}'
STATUS_QUERY='{
  indexingStatusForCurrentVersion(subgraphName: "'"$SUBGRAPH_NAME"'") {
    subgraph
    synced
    health
    fatalError { message }
    chains { latestBlock { number } chainHeadBlock { number } }
  }
}'
SQL_AUDIT="SELECT trx_status, confirmation_source, count(*) FROM transactions GROUP BY 1, 2 ORDER BY 1, 2;"
CPU_CMD="docker stats --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}'"

GRAPH_URL=""; [ -n "$P_GRAPH_Q" ] && GRAPH_URL="http://localhost:${P_GRAPH_Q}/subgraphs/name/${SUBGRAPH_NAME}/graphql?query=$(printf '%s' "$SUBGRAPH_QUERY" | urlencode)"
STATUS_URL=""; [ -n "$P_GRAPH_S" ] && STATUS_URL="http://localhost:${P_GRAPH_S}/graphql/playground?query=$(printf '%s' "$STATUS_QUERY" | urlencode)"

# ---- optional: newest run folder -----------------------------------------
RESULTS_HTML=""
if [ -n "$RESULTS_DIR" ]; then
  if [ -d "$RESULTS_DIR" ]; then
    RESULTS_ABS="$(cd "$RESULTS_DIR" && pwd)"
    # Newest run-* folder anywhere below the directory; else the newest subfolder.
    NEWEST="$(find "$RESULTS_ABS" -maxdepth 6 -type d -name 'run-*' -exec ls -dt {} + 2>/dev/null | head -n1 || true)"
    [ -n "$NEWEST" ] || NEWEST="$(ls -dt "$RESULTS_ABS"/*/ 2>/dev/null | head -n1 | sed 's#/$##' || true)"
    if [ -n "$NEWEST" ]; then
      RESULTS_HTML="<section><h2>Latest results</h2><div class=\"grid\"><a class=\"card\" href=\"file://$(printf '%s' "$NEWEST" | html_escape)\" target=\"_blank\" rel=\"noopener\"><span class=\"row\"><b>Newest run folder</b><span class=\"badge ok\">found</span></span><span class=\"url\">$(printf '%s' "$NEWEST" | html_escape)</span><span class=\"desc\">Most recently modified run folder under $(printf '%s' "$RESULTS_ABS" | html_escape).</span></a></div></section>"
    else
      RESULTS_HTML="<section><h2>Latest results</h2><div class=\"grid\"><div class=\"card off\"><span class=\"row\"><b>Newest run folder</b><span class=\"badge off\">none found</span></span><span class=\"desc\">No run folder under $(printf '%s' "$RESULTS_ABS" | html_escape).</span></div></div></section>"
    fi
  else
    echo "warning: --results directory not found: $RESULTS_DIR (skipped)" >&2
  fi
fi

# ---- write the page -------------------------------------------------------
{
cat <<'HTML_HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FinCube local services</title>
<style>
  :root {
    --bg: #f6f7f9; --panel: #ffffff; --text: #1b1f24; --muted: #5b6573;
    --line: #d9dee5; --accent: #1f6feb; --ok: #1a7f37; --ok-bg: #dcf5e4;
    --off: #8a4b00; --off-bg: #fde9c9; --code-bg: #eef1f5;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f1318; --panel: #171c23; --text: #e6e9ee; --muted: #9aa5b3;
      --line: #2a323d; --accent: #6cb0ff; --ok: #5fd68a; --ok-bg: #123122;
      --off: #f0b35a; --off-bg: #3a2a10; --code-bg: #0c1015;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
         font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  main { max-width: 980px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 13px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 28px 0 10px; }
  .sub { color: var(--muted); margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .card { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; background: var(--panel);
          border: 1px solid var(--line); border-radius: 8px; color: inherit; text-decoration: none; }
  a.card:hover, a.card:focus-visible { border-color: var(--accent); outline: none; }
  .card.off { opacity: .75; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .url { font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--accent); word-break: break-all; }
  .desc { color: var(--muted); font-size: 13px; }
  .badge { font-size: 11px; padding: 1px 8px; border-radius: 999px; white-space: nowrap; }
  .badge.ok { color: var(--ok); background: var(--ok-bg); }
  .badge.off { color: var(--off); background: var(--off-bg); }
  .block { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
  pre { margin: 8px 0 0; padding: 10px; background: var(--code-bg); border-radius: 6px; overflow-x: auto;
        font: 12.5px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; user-select: all; white-space: pre-wrap; }
  button.copy { font: inherit; font-size: 12px; padding: 2px 10px; border-radius: 6px; cursor: pointer;
                background: transparent; color: var(--accent); border: 1px solid var(--line); }
  button.copy:hover { border-color: var(--accent); }
  footer { margin-top: 32px; color: var(--muted); font-size: 12px; }
</style>
</head>
<body>
<main>
<h1>FinCube local services</h1>
HTML_HEAD
printf '<p class="sub">Generated %s from the running Docker containers. Ports are the host ports found by <code>docker port</code>.</p>\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')"
[ "$DOCKER_OK" = 1 ] || printf '<p class="sub"><b>Docker is not reachable</b>, so every service is shown as not running.</p>\n'

printf '<section><h2>Databases and messaging</h2><div class="grid">\n'
card "pgAdmin" "$(url /browser/ "$P_PGADMIN")" "Browse the three databases. Servers are in the FinCube group; pgAdmin asks for the dao password once."
card "RabbitMQ management" "$(url / "$P_RABBIT")" "Queues, consumers and message rates for the event hubs."
printf '</div></section>\n'

printf '<section><h2>Subgraph (self-hosted graph-node)</h2><div class="grid">\n'
card "Subgraph GraphiQL" "$GRAPH_URL" "Query ${SUBGRAPH_NAME}. Pre-filled with _meta and the first 10 proposalAddeds."
card "Index-node status" "$STATUS_URL" "Indexing status of the current version: latest block, chain head, health, fatal errors."
printf '</div></section>\n'

printf '<section><h2>Observability</h2><div class="grid">\n'
card "Grafana" "$(url / "$P_GRAFANA")" "Dashboards, and Explore for Loki logs and Tempo traces."
card "Prometheus" "$(url / "$P_PROM")" "Metrics and targets scraped from the services."
card "Tempo (API only)" "$(url /api/echo "$P_TEMPO")" "No web UI. This endpoint answers when Tempo is up; browse traces in Grafana, Explore, Tempo."
card "Loki (API only)" "$(url /loki/api/v1/labels "$P_LOKI")" "No web UI. Lists the log labels Loki has; browse logs in Grafana, Explore, Loki."
printf '</div></section>\n'

[ -z "$RESULTS_HTML" ] || printf '%s\n' "$RESULTS_HTML"

printf '<section><h2>Copy and run</h2>\n'
block "Audit-trail transactions by status (pgAdmin: FinCube, audit-trail, Query Tool)" "$SQL_AUDIT"
block "Live CPU and memory per container (terminal)" "$CPU_CMD"
block "Subgraph query (if the link does not pre-fill it)" "$SUBGRAPH_QUERY"
block "Index-node status query (if the link does not pre-fill it)" "$STATUS_QUERY"
printf '</section>\n'

cat <<'HTML_TAIL'
<footer>Written by scripts/ops_dashboard.sh outside the repository. Re-run the script to refresh.</footer>
</main>
<script>
document.querySelectorAll('button.copy').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var text = btn.closest('.block').querySelector('pre').textContent;
    var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1500); };
    var fallback = function () {
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = 'Select and copy'; }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); }
    else { fallback(); }
  });
});
</script>
</body>
</html>
HTML_TAIL
} > "$OUT"

echo "wrote $OUT"
found=""; missing=""
for pair in "pgAdmin:$P_PGADMIN" "graph-node-query:$P_GRAPH_Q" "graph-node-status:$P_GRAPH_S" "RabbitMQ:$P_RABBIT" "Grafana:$P_GRAFANA" "Prometheus:$P_PROM" "Tempo:$P_TEMPO" "Loki:$P_LOKI"; do
  if [ -n "${pair#*:}" ]; then found="$found ${pair%%:*}=${pair#*:}"; else missing="$missing ${pair%%:*}"; fi
done
echo "found:${found:- none}"
[ -z "$missing" ] || echo "not running:$missing"

if [ "$OPEN_PAGE" = 1 ]; then
  if command -v open >/dev/null 2>&1; then open "$OUT"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$OUT" >/dev/null 2>&1 || true
  else echo "open the file above in a browser"; fi
fi
