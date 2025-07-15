const { execSync } = require("child_process");
const fs = require("fs");

const CONTAINER = "rabbitmq"; // or your container name

function run(cmd) {
  try {
    const full = `docker exec ${CONTAINER} rabbitmqctl ${cmd}`;
    return execSync(full, { encoding: "utf-8" });
  } catch (err) {
    console.error(`Error running ${cmd}:`, err.message);
    return "";
  }
}

function parseTable(raw, skipHeaders = 1) {
  const lines = raw
    .trim()
    .split("\n")
    .filter((l) => !l.startsWith("Timeout") && !l.startsWith("Listing"));
  if (lines.length <= skipHeaders) return [];
  const headers = lines[0].split(/\s{2,}|\t+/);
  return lines.slice(skipHeaders).map((line) => {
    const values = line.split(/\s{2,}|\t+/);
    return Object.fromEntries(
      headers.map((h, i) => [h.trim(), values[i] || ""])
    );
  });
}

function extractFromReport(reportText) {
  const summary = {};

  const match = (label, fallback = null) => {
    const re = new RegExp(`${label}:\\s*(.+)`);
    const m = reportText.match(re);
    return m ? m[1].trim() : fallback;
  };

  summary["node_name"] = match("Node name");
  summary["uptime_secs"] = parseInt(match("Uptime \\(seconds\\)", "0"));
  summary["rabbitmq_version"] = match("RabbitMQ version");
  summary["erlang_version"] = match("Erlang version");
  summary["os"] = match("OS");
  summary["queue_count"] = parseInt(match("Queue count", "0"));
  summary["connection_count"] = parseInt(match("Connection count", "0"));
  summary["vhost_count"] = parseInt(match("Virtual host count", "0"));

  // Listeners (parse multiple)
  const listenerMatches = [
    ...reportText.matchAll(
      /Interface: (.*?), port: (\d+), protocol: (.*?), purpose: (.*)/g
    ),
  ];
  summary.listeners = listenerMatches.map(
    ([_, iface, port, protocol, purpose]) => ({
      interface: iface,
      port: +port,
      protocol,
      purpose,
    })
  );

  return summary;
}

function main() {
  const queues = parseTable(run("list_queues"));
  const exchanges = parseTable(run("list_exchanges"));
  const bindings = parseTable(run("list_bindings"));
  const consumers = parseTable(run("list_consumers"));
  const reportRaw = run("report");

  // Map queue -> exchanges from bindings
  const queueToExchange = {};
  for (const b of bindings) {
    if (b.destination_kind === "queue" && b.source_kind === "exchange") {
      const q = b.destination_name;
      const ex = b.source_name || "(default)";
      if (!queueToExchange[q]) queueToExchange[q] = [];
      queueToExchange[q].push(ex);
    }
  }

  // Build topology edges
  const edges = [];
  for (const c of consumers) {
    const q = c.queue_name;
    const exList = queueToExchange[q] || ["(unknown)"];
    for (const ex of exList) {
      edges.push({
        exchange: ex,
        queue: q,
        consumer_tag: c.consumer_tag,
        active: c.active === "true",
      });
    }
  }

  // Output report data
  const report = extractFromReport(reportRaw);

  console.log("\n📦 Queues:");
  console.table(queues);
  console.log("\n🔄 Exchanges:");
  console.table(exchanges);
  console.log("\n📊 Exchange → Queue → Consumer:");
  console.table(edges);
  console.log("\n🧠 Node Report Summary:");
  console.table(report.listeners);
  console.log(report);

  // Save outputs
  fs.writeFileSync("rabbitmq_edges.json", JSON.stringify(edges, null, 2));
  fs.writeFileSync("rabbitmq_report.json", JSON.stringify(report, null, 2));
  fs.writeFileSync(
    "rabbitmq_topology.json",
    JSON.stringify(
      {
        report,
        edges,
        queues,
        exchanges,
        bindings,
        consumers,
      },
      null,
      2
    )
  );

  console.log(
    "\n✅ Saved: rabbitmq_edges.json, rabbitmq_report.json, rabbitmq_topology.json"
  );
}

main();
