# Distributed Mode

One machine has limits. When a single generator saturates, spread the load
across many machines — coordinated through Redis.

## Architecture

```text
                    ┌──────────────┐
                    │    Redis     │
                    │  (job queue) │
                    └──────┬───────┘
                           │ pull jobs / push results
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────┴─────┐ ┌──────┴─────┐ ┌──────┴─────┐
     │  agent-1   │ │  agent-2   │ │  agent-3   │
     │  (box A)   │ │  (box B)   │ │  (box C)   │
     └──────┬─────┘ └──────┬─────┘ └──────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           ▼
                   ┌──────────────┐
                   │    target    │
                   └──────────────┘
```

- `storm run-dist` pushes N jobs into a Redis queue and waits for results.
- Each `storm agent` registers itself, pulls jobs, executes them and pushes
  results back.
- Any number of agents can join; work is shared automatically.

## Prerequisites

- A Redis server reachable by the coordinator **and** all agents
  (default `localhost:6379`, override with `--redis`)
- The `storm` binary on every machine running an agent

## Step 1: Start Agents

On each load-generating machine:

```bash
storm agent --name agent-1 -c 20 --redis 10.0.1.5:6379
```

| Flag | Default | Description |
|---|---|---|
| `-c, --concurrency` | `5` | Worker goroutines for this agent |
| `--name` | hostname-timestamp | Name shown in the report breakdown |
| `--redis` | `localhost:6379` | Redis address |
| `--stay-alive` | off | Keep running after the queue empties |
| `--metrics-port` | `9091` | Prometheus `/metrics` port (`0` = disabled) |

The agent blocks, waiting for work.

## Step 2: Launch the Test

From the coordinator machine:

```bash
storm run-dist -u https://example.com -n 100000 \
  --agents 3 \
  --redis 10.0.1.5:6379
```

`--agents 3` makes the coordinator wait until 3 agents have registered before
dispatching jobs — useful in scripts so the test never starts under-provisioned.

## Step 3: Read the Report

The coordinator aggregates results from every agent into one report, with a
per-agent breakdown showing which machine contributed what.

Save it as JSON for later analysis:

```bash
storm run-dist -u https://example.com -n 100000 \
  --format json --output dist-report.json
```

Re-display a saved report any time:

```bash
storm report dist-report.json
```

## When Do You Need This?

| Situation | Single machine enough? |
|---|---|
| < ~10K RPS against a fast LAN target | usually yes |
| Generator CPU warnings in the health report | no — add machines |
| Simulating geographically distributed users | no — agents per region |
| TLS-heavy targets (handshakes burn CPU) | often no |

The rule: watch the [Generator Health](/guide/generator-health) report. If
CPU hits WARN/CRITICAL before your target does, scale out.

## Example: Three-Machine Setup

```bash
# On redis box (10.0.1.5)
docker run -p 6379:6379 redis

# On load boxes A, B, C
storm agent --name box-a -c 50 --redis 10.0.1.5:6379 &
storm agent --name box-b -c 50 --redis 10.0.1.5:6379 &
storm agent --name box-c -c 50 --redis 10.0.1.5:6379 &

# From coordinator (any machine)
storm run-dist -u https://target.example.com \
  -n 500000 --agents 3 --redis 10.0.1.5:6379
```

150 workers total, half a million requests, one report.

## Next Steps

- [Generator Health](/guide/generator-health) — know when to scale out
- [CLI Reference](/guide/cli-reference) — all distributed flags
