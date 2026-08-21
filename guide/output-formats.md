# Output Formats

go-storm speaks five formats: `text` (default), `table`, `quiet`, `csv` and
`json`. Select with `--format`.

```bash
storm run -u https://example.com -n 1000 --format json
```

## text (default)

Human-readable results plus the Generator Health Report. Shown in the
[Quick Start](/guide/quickstart#understanding-the-output).

Use for: interactive terminal runs.

## table

Compact statistics table without the progress bar noise:

```bash
storm run -u https://example.com -n 1000 --format table
```

Use for: quick interactive runs where you want just the numbers.

## quiet

Minimal single-line output — total requests, failures, RPS and latency
summary. Config output and the health report are suppressed so the line is
safe to parse:

```bash
storm run -u https://example.com -n 1000 --format quiet
```

Use for: shell scripts, watch loops, quick CI checks.

## csv

One row per result metric, ready for spreadsheets:

```bash
storm run -u https://example.com -n 1000 --format csv > results.csv
```

Use for: Excel/Google Sheets analysis, simple time-series logging.

## json

Full machine-readable report on stdout:

```bash
storm run -u https://example.com -n 1000 --format json
```

Sample (pretty-printed):

```json
{
  "url": "http://localhost:8080/api/health",
  "method": "GET",
  "concurrency": 200,
  "rate": 1000,
  "total_requests": 1839,
  "successful": 694,
  "failed": 1145,
  "success_rate": 37.7379010331702,
  "min_response_time_ms": 0,
  "max_response_time_ms": 4849,
  "avg_response_time_ms": 528,
  "p50_ms": 50,
  "p95_ms": 5000,
  "p99_ms": 5000,
  "requests_per_sec": 30.64757624664839,
  "total_duration_ms": 60004,
  "status_codes": {
    "200": 694
  },
  "errors": [
    "Job 19: Get \"http://localhost:8080/api/health\": context deadline exceeded"
  ]
}
```

Every field is documented in [JSON Schema](/reference/json-schema).

### Saving to a File

`--output` writes the same JSON to a file while keeping stdout clean:

```bash
storm run -u https://example.com -n 50000 --output report.json
```

View it later as formatted text:

```bash
storm report report.json
```

Use for: CI pipelines, regression tracking, long-term storage.

## Which Format When

| Situation | Format |
|---|---|
| Testing something interactively | `text` |
| Shell script / watch loop | `quiet` |
| Spreadsheet analysis | `csv` |
| CI pipeline assertions | `json` |
| Long-term result storage | `--output report.json` |

## CI Example

Fail a pipeline when p95 exceeds a budget:

```bash
storm run -u https://staging.example.com -n 10000 \
  --format json --output report.json

P95=$(python3 -c "import json;print(json.load(open('report.json'))['p95_ms'])")
if [ "$P95" -gt 500 ]; then
  echo "PERFORMANCE REGRESSION: p95=${P95}ms exceeds 500ms budget"
  exit 1
fi
```

See [Exit Codes](/reference/exit-codes) for how go-storm itself signals failure.

## Next Steps

- [JSON Schema](/reference/json-schema) — every field explained
- [Monitoring](/guide/monitoring) — live metrics during the test
