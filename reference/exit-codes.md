# Exit Codes

How go-storm signals success and failure to scripts and CI pipelines.

## Codes

| Code | Meaning |
|---|---|
| `0` | Command completed successfully |
| `1` | Error: invalid usage, missing required flag, unreadable file |

## What Triggers Each Code

### Exit 0 — command ran

```bash
storm run -u https://example.com -n 100 -c 10
echo $?   # 0
```

The test completed and results were printed.

### Exit 1 — command could not run

```bash
storm run                          # missing required --url
storm report /nonexistent.json     # file not found
storm badcmd                       # unknown command
echo $?                            # 1
```

Error details are printed to stderr:

```text
Error: required flag(s) "url" not set
```

## ⚠️ Request Failures Are NOT Non-Zero Exits

This is deliberate and important:

```bash
# Target is completely down:
storm run -u http://down.example.com -n 100
echo $?   # still 0!
```

A load test that *runs* is a successful *command*, even when every request
fails. The failures live in the results, not the exit code. This follows the
same convention as other load testing tools: the tool's job is to measure,
and "all requests failed" is a measurement.

## CI Pattern: Assert on Results, Not Just Exit Codes

To fail a pipeline on bad results, check the JSON report:

```bash
storm run -u https://staging.example.com -n 10000 \
  --format json --output report.json
test "$?" = 0 || { echo "storm failed to run"; exit 1; }

python3 - <<'EOF'
import json, sys
r = json.load(open("report.json"))
fail = False
if r["success_rate"] < 99.0:
    print(f"FAIL: success_rate={r['success_rate']:.2f}% < 99%"); fail = True
if r["p95_ms"] > 500:
    print(f"FAIL: p95={r['p95_ms']}ms > 500ms"); fail = True
sys.exit(1 if fail else 0)
EOF
```

Or the quick shell version:

```bash
FAILED=$(jq '.failed' report.json)
[ "$FAILED" -eq 0 ] || { echo "$FAILED requests failed"; exit 1; }
```

## Summary

```text
exit 0  →  storm did its job; read the report to judge the target
exit 1  →  storm could not do its job; fix the invocation
```

## Next Steps

- [JSON Schema](/reference/json-schema) — fields to assert on
- [Troubleshooting](/help/troubleshooting) — diagnosing failing runs
