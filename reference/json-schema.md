# JSON Schema

Reference for the JSON report produced by `--format json` and `--output`.

## Complete Example

```json
{
  "url": "http://localhost:8080/api/health",
  "method": "GET",
  "concurrency": 10,
  "rate": 0,
  "total_requests": 200,
  "successful": 200,
  "failed": 0,
  "success_rate": 100,
  "min_response_time_ms": 0.333806,
  "max_response_time_ms": 54.357187,
  "avg_response_time_ms": 3.815292,
  "p50_ms": 1.928571,
  "p95_ms": 10,
  "p99_ms": 80,
  "requests_per_sec": 2301.0913086607716,
  "total_duration_ms": 86,
  "status_codes": {
    "200": 200
  }
}
```

## Field Reference

### Test Configuration

| Field | Type | Description |
|---|---|---|
| `url` | string | Target URL that was tested |
| `method` | string | HTTP method used |
| `concurrency` | number | Worker count (`-c`) |
| `rate` | number | Requested RPS limit (`-r`); `0` means unlimited |

### Request Counts

| Field | Type | Description |
|---|---|---|
| `total_requests` | number | Requests the test attempted |
| `successful` | number | Requests that received an HTTP response |
| `failed` | number | Requests that errored (timeout, connection, DNS, TLS) |
| `success_rate` | number | Percentage, `successful / total_requests × 100` |

::: note
"Successful" means an HTTP response arrived — even a 500. Check
`status_codes` to see what those responses actually were.
:::

### Latency (milliseconds)

| Field | Type | Description |
|---|---|---|
| `min_response_time_ms` | number | Fastest response |
| `max_response_time_ms` | number | Slowest response |
| `avg_response_time_ms` | number | Arithmetic mean |
| `p50_ms` | number | Median — half of requests were faster |
| `p95_ms` | number | 95% of requests were faster |
| `p99_ms` | number | 99% of requests were faster |

All latency values are fractional milliseconds. Sub-millisecond precision is
preserved — a fast target reports `p50_ms: 1.93`, never a misleading `0`.
Percentiles are estimated from a logarithmic histogram with linear
interpolation, so values may not exactly match any single request.

### Throughput

| Field | Type | Description |
|---|---|---|
| `requests_per_sec` | number | Achieved throughput over the whole run |
| `total_duration_ms` | number | Wall-clock duration of the test |

Compare `requests_per_sec` against `rate`: a large gap with a healthy
generator means the target throttled you; a large gap with CPU warnings means
the generator did.

### Status Codes

| Field | Type | Description |
|---|---|---|
| `status_codes` | object | Map of `"STATUS"` → count, e.g. `"200": 694` |

```json
"status_codes": {
  "200": 690,
  "500": 4
}
```

### Errors

| Field | Type | Description |
|---|---|---|
| `errors` | array of strings | Verbatim error messages for failed requests |

Errors preserve the underlying cause so you can classify failures:

```text
context deadline exceeded          → timeout (-t)
connection refused                 → target down / wrong port
no such host                       → DNS failure
connection reset by peer           → target closed mid-request
EOF                                → target dropped the connection
```

The list is capped at a stored maximum; counts in `failed` are always exact.

## Consuming the Report

```bash
# Save it
storm run -u https://example.com -n 10000 --output report.json

# Extract fields with jq
jq '.requests_per_sec, .p95_ms' report.json

# Regression check in CI
test "$(jq '.success_rate > 99' report.json)" = true
```

Full worked examples: [Output Formats](/guide/output-formats#ci-example).

## Next Steps

- [Exit Codes](/reference/exit-codes) — process-level failure signals
- [Default Behaviors](/reference/default-behaviors) — config defaults
