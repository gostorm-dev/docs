# Monitoring

What you can watch while a test is running.

## Live Progress Bar

Every `storm run` shows live progress on the terminal:

```text
392 req/s  79% |███████████████████████████████         | (395/500) [1s:0s]
```

| Element | Meaning |
|---|---|
| `392 req/s` | Current throughput |
| `79%` | Completion percentage |
| `(395/500)` | Requests completed / total |
| `[1s:0s]` | Elapsed : estimated remaining |

The progress bar is suppressed in machine-readable formats (`json`, `csv`,
`quiet`) so pipelines never see it.

## Prometheus Metrics

Expose live metrics during the test:

```bash
storm run -u https://example.com -n 100000 --metrics-port 9091
```

Then scrape or inspect:

```bash
curl http://localhost:9091/metrics
```

Point Prometheus at the port and you can graph the run in real time — RPS,
latencies, errors — while it happens.

For agents, metrics are enabled by default:

```bash
storm agent --metrics-port 9091 --stay-alive
```

::: tip Why --stay-alive matters
An agent exits when the queue empties, which kills its metrics endpoint.
Add `--stay-alive` if you want to keep scraping metrics after the test ends.
:::

## Watching a Long Test

For long runs, combine:

```bash
# Terminal 1: the test
storm run -u https://example.com -n 1000000 -c 500 \
  --output report.json

# Terminal 2: live generator stats
watch -n 2 'ps -o %cpu,rss -p $(pgrep storm)'
```

If CPU climbs toward 85%+ during the run, expect a saturation warning —
see [Generator Health](/guide/generator-health).

## After the Test

- Terminal output includes the full Generator Health Report
- `--output report.json` gives you the complete machine-readable record
- `storm report report.json` re-displays it as formatted text any time

## Next Steps

- [Output Formats](/guide/output-formats) — post-test formats
- [JSON Schema](/reference/json-schema) — what's inside report.json
