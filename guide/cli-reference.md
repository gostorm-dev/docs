# CLI Reference

Complete reference for every go-storm command and flag.

## Commands

| Command | Purpose |
|---|---|
| `storm run` | Run a load test from a single machine |
| `storm run-dist` | Run a distributed test using Redis agents |
| `storm agent` | Start a distributed agent worker |
| `storm report <file>` | Display a saved JSON report as text |
| `storm version` | Print version, commit and build info |

Global flag (works with all commands):

```text
--redis string   Redis address for distributed mode (default "localhost:6379")
```

---

## storm run

```text
Usage:
  storm run [flags]
```

### Target

| Flag | Type | Default | Description |
|---|---|---|---|
| `-u, --url` | string | *(required)* | Target URL to test |
| `-m, --method` | string | `GET` | HTTP method: GET, POST, PUT, DELETE |
| `-b, --body` | string | — | Request body (for POST/PUT) |
| `-H, --header` | stringArray | — | Custom header, repeatable: `-H "Key: Value"` |
| `-t, --timeout` | int | `10` | Request timeout in seconds |
| `--insecure` | bool | `false` | Skip TLS certificate verification |

### Load Control

| Flag | Type | Default | Description |
|---|---|---|---|
| `-n, --requests` | int | `100` | Total requests to send |
| `-c, --concurrency` | int | `10` | Parallel workers |
| `-r, --rate` | int | `0` | Max requests per second (`0` = unlimited) |

::: tip How load is generated
Each of the `-c` workers pulls requests from a shared queue until `-n`
requests have been sent. `-r` throttles the queue so the target is never hit
faster than the requested rate.
:::

### Output

| Flag | Type | Default | Description |
|---|---|---|---|
| `--format` | string | `text` | Output format: `text`, `json`, `table`, `quiet`, `csv` |
| `--output` | string | — | Write JSON report to a file |

See [Output Formats](/guide/output-formats) for samples of every format.

### CI Gate

Opt-in failure conditions. When a limit is exceeded, storm exits with code
`2` after printing the full report. Without these flags, a completed run
always exits `0`.

| Flag | Type | Default | Description |
|---|---|---|---|
| `--fail-above-errors` | int | `-1` *(off)* | Exit 2 if failed requests exceed N |
| `--fail-above-p95` | float | `-1` *(off)* | Exit 2 if p95 latency exceeds MS milliseconds |

```bash
# Pipeline goes red on >20 failures or p95 slower than 500ms
storm run -u https://staging.api.com/users -n 2000 -c 100 \
  --fail-above-errors 20 --fail-above-p95 500
```

See [Exit Codes](/reference/exit-codes) for the full scheme.

### Generator Saturation

| Flag | Type | Default | Description |
|---|---|---|---|
| `--saturation` | bool | `true` | Enable generator saturation monitoring |
| `--saturation-kill` | bool | `false` | Kill the test on critical saturation (vs warn only) |

With defaults, go-storm **warns** when the generator approaches its limits but
lets the test finish. Add `--saturation-kill` to abort instead.

### Capacity Estimation

| Flag | Type | Default | Description |
|---|---|---|---|
| `--estimate` | bool | `false` | Run capacity estimation before the test |

```bash
storm run -u https://example.com -n 5000 --estimate
```

### Prometheus Metrics

| Flag | Type | Default | Description |
|---|---|---|---|
| `--metrics-port` | int | `0` | Serve Prometheus `/metrics` on this port (`0` = disabled) |

```bash
storm run -u https://example.com -n 5000 --metrics-port 9091
```

### Connection Pool Tuning

For high-load tests you can tune the HTTP transport:

| Flag | Type | Default | Description |
|---|---|---|---|
| `--max-idle-conns` | int | `200` | Max idle connections across all hosts |
| `--max-idle-per-host` | int | `50` | Max idle connections per target host |
| `--keep-alive` | int | `30` | TCP keep-alive interval in seconds |
| `--idle-timeout` | int | `90` | Idle connection timeout in seconds |
| `--force-http2` | bool | `true` | Force HTTP/2 protocol |

High-performance example:

```bash
storm run -u https://example.com -n 100000 \
  --max-idle-conns 500 --max-idle-per-host 100
```

---

## storm run-dist

Pushes jobs into a Redis queue and waits for agents to process them all.

```text
Usage:
  storm run-dist [flags]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `-u, --url` | string | *(required)* | Target URL |
| `-n, --requests` | int | `100` | Total requests across all agents |
| `-m, --method` | string | `GET` | HTTP method |
| `-b, --body` | string | — | Request body |
| `-H, --header` | stringArray | — | Custom header, repeatable: `-H "Key: Value"` |
| `-t, --timeout` | int | `10` | Request timeout in seconds |
| `--agents` | int | `0` | Wait for this many agents before starting (`0` = don't wait) |
| `--format` | string | `text` | Output format: `text` or `json` |
| `--output` | string | — | Write JSON report to a file |
| `--fail-above-errors` | int | `-1` *(off)* | Exit 2 if failed requests exceed N |
| `--fail-above-p95` | float | `-1` *(off)* | Exit 2 if p95 latency exceeds MS ms |

Examples:

```bash
# Basic distributed test
storm run-dist -u https://example.com -n 10000

# Wait for 3 agents before starting
storm run-dist -u https://example.com -n 10000 --agents 3

# Save report and show agent breakdown
storm run-dist -u https://example.com -n 10000 --format json --output report.json
```

---

## storm agent

Starts an agent that registers with Redis, pulls jobs from the shared queue,
executes them and pushes results back.

```text
Usage:
  storm agent [flags]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `-c, --concurrency` | int | `5` | Agent worker goroutines |
| `--name` | string | hostname-timestamp | Agent name shown in reports |
| `--redis` | string | `localhost:6379` | Redis address |
| `--metrics-port` | int | `9091` | Prometheus `/metrics` port (`0` = disabled) |
| `--stay-alive` | bool | `false` | Keep running after the queue empties |
| `-t, --timeout` | int | `10` | Request timeout in seconds |

Examples:

```bash
# Start agent with default settings
storm agent

# Start named agent with 20 workers
storm agent --name agent-1 -c 20

# Start agent pointing at a remote Redis
storm agent --redis 10.0.1.5:6379
```

---

## storm report

Displays a saved JSON report as formatted text.

```bash
storm report result.json
storm report dist-report.json
```

Useful in CI: save JSON during the run, inspect it later without re-running.

---

## Version Output

```bash
storm version
```

```text
go-storm version v0.4.0-2-g3431458
commit:     3431458
built:      2026-08-20T13:35:59Z
platform:   linux/amd64
go:         go1.26.5
```

The commit hash makes every result traceable to the exact binary that produced it.
