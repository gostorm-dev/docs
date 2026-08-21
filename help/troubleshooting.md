# Troubleshooting

Common problems, why they happen and how to fix them.

## Request Errors

### `context deadline exceeded (Client.Timeout exceeded...)`

**Meaning:** The request did not get a response within `-t` seconds
(default 10).

**Fix:**

```bash
# Raise the timeout for slow endpoints
storm run -u https://example.com/slow-report -n 1000 -t 60
```

If timeouts appear only under load, the target queue is backing up — that is
a real finding about your target, not a tool problem. Lower `-c` or `-r` and
watch the pattern.

### `connection refused`

**Meaning:** Nothing is listening on that host:port — wrong port, service
down, or a firewall rejecting.

**Fix:** Verify the target first:

```bash
curl -v http://localhost:8080/health
```

### `no such host`

**Meaning:** DNS resolution failed.

**Fix:** Check the hostname; test resolution:

```bash
dig example.com +short
```

Under high concurrency, DNS can also become a bottleneck — go-storm's health
report shows file descriptor counts to help spot socket churn.

### `connection reset by peer`

**Meaning:** The target (or an intermediary) killed an established connection.
Often a sign the target is overloaded — its accept queue or worker pool is
full and it is shedding load.

**Fix:** Reduce `-c`, add `-r`, and investigate the target's capacity.

### `EOF`

**Meaning:** The connection was closed before a complete response arrived.
Typically seen when a server crashes or drops keep-alive connections under
extreme load.

::: tip Seen in battle testing
During head-to-head tests at 2000 concurrent connections, k6 died with mass
`EOF` errors while go-storm completed the same run — see the README
benchmarks. If *your* run shows EOFs, the target is dropping connections.
:::

## TLS Errors

**Certificate verification failures:**

```bash
# Self-signed / internal CA targets:
storm run -u https://internal.example.com --insecure -n 1000
```

`--insecure` skips certificate verification. Never use it against production
or public internet targets.

## Performance Problems

### Achieved RPS far below requested

Check the [Generator Health Report](/guide/generator-health) verdict:

| Health report says | It means | Fix |
|---|---|---|
| ✅ GENERATOR HEALTHY | Target throttled you | Target-side capacity issue |
| ⚠️ CPU WARN/CRITICAL | Generator saturated | Lower `-c`, raise pool flags, or scale out |
| Worker utilization low | Workers starved | Raise `-c`; check for client-side bottlenecks |

### Generator CPU saturation

```text
⚠️ CPU: 96% (threshold 95%)
```

Options, in order:

1. Tune the connection pool:

   ```bash
   storm run -u https://example.com -n 200000 \
     --max-idle-conns 500 --max-idle-per-host 100
   ```

2. Reduce per-machine load (`-c`) and spread across machines with
   [Distributed Mode](/guide/distributed-mode)

3. For unattended runs, add `--saturation-kill` so bad results abort instead
   of completing

### Latency percentiles look inflated

Inflated p99 with a healthy generator usually means the tail is real — your
target occasionally stalls. Inflated everything + generator warnings means
the measurements themselves are contaminated: re-run with lower `-c`.

## Command Problems

### `required flag(s) "url" not set`

You forgot `-u`. Every run needs a target:

```bash
storm run -u https://example.com -n 100
```

### `unknown shorthand flag`

Flags are single-dash short or double-dash long — check exact spelling in the
[CLI Reference](/guide/cli-reference). Example: requests is `-n`
(`--requests`), **not** `-N`.

### Progress bar pollutes my piped output

It doesn't — machine formats suppress it:

```bash
storm run -u https://example.com -n 1000 --format json | jq .
```

## Still Stuck?

- Search existing issues: [github.com/gostorm-dev/go-storm/issues](https://github.com/gostorm-dev/go-storm/issues)
- Include in your report: `storm version` output, full command, and the JSON report if you have one
