# Quick Start

Run your first load test in under 30 seconds.

## Your First Test

```bash
storm run -u https://example.com -n 1000 -c 50
```

This sends **1000 requests** using **50 concurrent workers** to the target URL.

::: warning Tests are request-count based
go-storm controls load with `-n` (total requests), not a wall-clock duration.
The progress bar shows a live time estimate as the test runs.
:::

## Understanding the Output

```text
============================================================
LOAD TEST RESULTS
============================================================
URL: http://localhost:8080/
Method: GET
Concurrency: 25
Total Requests: 500
------------------------------------------------------------
Successful: 500
Failed: 0
Success Rate: 100.00%
------------------------------------------------------------
Min Response: 5.850283ms
Max Response: 2.071300552s
Avg Response: 76.233336ms
p50 Response: 50ms
p95 Response: 500ms
p99 Response: 5s
Requests/sec: 238.92
Total Duration: 2.092723313s
------------------------------------------------------------
Status Code Distribution:
   200: 500 requests
============================================================
```

| Line | Meaning |
|---|---|
| `Successful / Failed` | Requests that got an HTTP response vs errors (timeout, connection refused, etc.) |
| `Min / Max / Avg` | Latency spread across all requests |
| `p50 / p95 / p99` | Percentile latencies — p95 means 95% of requests were faster than this |
| `Requests/sec` | Achieved throughput |
| `Status Code Distribution` | Count per HTTP status code |

## The Generator Health Report

After every test, go-storm prints a health report for the generator itself:

```text
═══════════════════════════════════════════════
        GENERATOR HEALTH REPORT
═══════════════════════════════════════════════

Load
  Target RPS:       Unlimited
  Achieved RPS:     285.7

System Resources
  CPU Usage:        1.8% ✅
  Memory:          19.0 MB (Heap: 4.0 MB)
  Goroutines:       4
  GC Cycles:        13

Checks
  ✅ CPU:                 1.8%
  ✅ GC Pause:            4.2 ms
  ✅ Worker Utilization:  84.7%

───────────────────────────────────────────────
  ✅ GENERATOR HEALTHY
  Results are trustworthy.
───────────────────────────────────────────────
```

This is go-storm's core promise: it tells you whether **your machine** was the
bottleneck, so you never mistake generator saturation for target failure.

## Common First Tests

Rate-limited test (max 100 requests/second):

```bash
storm run -u https://example.com -n 5000 -c 100 -r 100
```

POST request with a JSON body:

```bash
storm run -u https://api.example.com/users -m POST -b '{"name":"test"}'
```

Save results as JSON:

```bash
storm run -u https://example.com -n 1000 --format json --output result.json
```

## Next Steps

- [CLI Reference](/guide/cli-reference) — every flag explained
- [Generator Health](/guide/generator-health) — how saturation detection works
- [Output Formats](/guide/output-formats) — table, JSON, CSV and quiet modes
