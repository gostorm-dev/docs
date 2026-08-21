# Default Behaviors

Exactly what happens when you type less. go-storm has no hidden config files —
these defaults are the whole story.

## Command Defaults

### storm run

| Flag | Default | Meaning |
|---|---|---|
| `-n, --requests` | `100` | 100 total requests |
| `-c, --concurrency` | `10` | 10 parallel workers |
| `-r, --rate` | `0` | Unlimited — as fast as workers can go |
| `-m, --method` | `GET` | Plain GET |
| `-t, --timeout` | `10` | Each request times out after 10 seconds |
| `--format` | `text` | Human output + health report |
| `--saturation` | `true` | Generator monitoring on, warn-only |
| `--saturation-kill` | `false` | Never abort on saturation, only warn |
| `--metrics-port` | `0` | Prometheus disabled |
| `--force-http2` | `true` | HTTP/2 when the target supports it |

So the minimal command:

```bash
storm run -u https://example.com
```

is identical to:

```bash
storm run -u https://example.com -n 100 -c 10 -m GET -t 10 \
  --format text --saturation --force-http2
```

### Connection Pool Defaults

| Flag | Default | Meaning |
|---|---|---|
| `--max-idle-conns` | `200` | Idle connections kept across all hosts |
| `--max-idle-per-host` | `50` | Idle connections kept per target host |
| `--keep-alive` | `30` | TCP keep-alive probe interval (seconds) |
| `--idle-timeout` | `90` | Idle connections closed after 90 seconds |

### Distributed Defaults

| Flag | Default | Meaning |
|---|---|---|
| `--redis` | `localhost:6379` | Redis for job queue and results |
| agent `-c` | `5` | Workers per agent |
| agent `--metrics-port` | `9091` | Metrics on by default for agents |
| run-dist `--agents` | `0` | Don't wait for agents, start immediately |

## Behavioral Guarantees

### Same Config → Same Load

Given identical flags and a stable target, go-storm produces the same load
shape every run. No random jitter is introduced by the engine.

### Failures Are Visible

- Every failed request is counted and (up to the stored limit) its error
  message recorded in the JSON report under `errors`
- Timeouts, DNS failures, TLS failures and connection errors are preserved
  verbatim so you can tell *why* requests failed

### The Generator Never Lies Silently

Saturation monitoring is on by default. If the generator degrades during a
test you will see WARN/CRITICAL lines — results are never presented as
trustworthy when they are not.

### Machine-Readable Means Machine-Readable

`json`, `csv` and `quiet` formats suppress the progress bar, banner and
health report. Pipe them anywhere without filtering.

## Minimal Examples With Implicit Defaults

```bash
# 100 requests, 10 workers, unlimited rate
storm run -u https://example.com

# Rate-limited: everything else still default
storm run -u https://example.com -r 100

# POST: note -n stays at 100 unless raised
storm run -u https://api.example.com/users -m POST -b '{"x":1}'
```

::: warning Watch -n in scripts
The default of 100 requests is intentionally small for safety. In CI or
scripts, always set `-n` explicitly so a typo never runs a tiny accidental test.
:::

## Next Steps

- [CLI Reference](/guide/cli-reference) — full flag documentation
- [Exit Codes](/reference/exit-codes) — how failures surface to scripts
