# Exit Codes

How go-storm signals success and failure to scripts and CI pipelines.

## Codes

| Code | Meaning |
|---|---|
| `0` | Command completed successfully; thresholds passed (or none set) |
| `1` | Error: invalid usage, missing required flag, unreadable file |
| `2` | **Threshold violation** — an opt-in CI gate limit was exceeded |

## What Triggers Each Code

### Exit 0 — command ran, gate passed

```bash
storm run -u https://example.com -n 100 -c 10
echo $?   # 0
```

The test completed and results were printed.

### Exit 1 — command could not run

```bash
storm run                          # missing required --url
storm run -u https://example.com -H "Broken"   # invalid header spec
storm report /nonexistent.json     # file not found
echo $?                            # 1
```

Error details are printed to stderr:

```text
Error: required flag(s) "url" not set
```

### Exit 2 — threshold violation (opt-in)

```bash
storm run -u https://staging.example.com -n 2000 -c 100 \
  --fail-above-errors 20 --fail-above-p95 500
echo $?   # 2 if >20 requests failed OR p95 slower than 500ms
```

The full report is always printed first; then the violation is explained on
stderr:

```text
FAIL: p95 latency 842.31ms exceeds --fail-above-p95 500.00ms
```

Both flags are opt-in with default `-1` (disabled). Without them, behavior is
exactly as described below.

## ⚠️ Request Failures Are NOT Non-Zero Exits by Default

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

If you want failures to fail the command, that is exactly what the gate flags
are for — see above.

## Why Code 2 Is Distinct From Code 1

Scripts can tell two very different problems apart:

```bash
storm run -u "$URL" --fail-above-errors 20
case $? in
  0) echo "gate passed" ;;
  1) echo "my storm invocation was wrong — fix the script" ;;
  2) echo "service failed the gate — page the on-call" ;;
esac
```

## CI Pattern: Assert on Results, Not Just Exit Codes

Without gate flags, check the JSON report:

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

With gate flags, the whole block collapses to one line:

```bash
storm run -u https://staging.example.com -n 2000 -c 100 \
  --fail-above-errors 20 --fail-above-p95 500
```

Or the quick shell version for custom logic:

```bash
FAILED=$(jq '.failed' report.json)
[ "$FAILED" -eq 0 ] || { echo "$FAILED requests failed"; exit 1; }
```

## Summary

```text
exit 0  →  storm did its job; read the report to judge the target
exit 1  →  storm could not do its job; fix the invocation
exit 2  →  the target failed your gate; investigate the service
```

## Next Steps

- [JSON Schema](/reference/json-schema) — fields to assert on
- [CLI Reference](/guide/cli-reference#ci-gate) — gate flag details
- [Troubleshooting](/help/troubleshooting) — diagnosing failing runs
