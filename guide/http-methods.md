# HTTP Methods

Testing GET, POST, PUT and DELETE endpoints with real request bodies.

## Supported Methods

go-storm supports four methods via `-m`:

```text
GET (default), POST, PUT, DELETE
```

## GET Requests

GET is the default method:

```bash
storm run -u https://api.example.com/users -n 5000 -c 100
```

## POST Requests

Use `-m POST` with a body via `-b`:

```bash
storm run -u https://api.example.com/users \
  -m POST \
  -b '{"name":"test","email":"test@example.com"}' \
  -n 10000 -c 200
```

## PUT Requests

```bash
storm run -u https://api.example.com/users/42 \
  -m PUT \
  -b '{"name":"updated"}' \
  -n 5000 -c 50
```

## DELETE Requests

```bash
storm run -u https://api.example.com/users/42 -m DELETE -n 1000 -c 20
```

::: warning Destructive methods
POST/PUT/DELETE tests mutate state. Point them at a staging environment, or
make sure the target endpoint is idempotent before hammering it.
:::

## Real-World Example: Testing an API Endpoint

A complete test against a typical REST API — rate-limited, with a saved report:

```bash
storm run -u https://staging-api.example.com/v1/orders \
  -m POST \
  -b '{"item":"sku-1234","qty":1}' \
  -n 50000 -c 500 -r 5000 \
  --format json --output orders-report.json
```

What this does:

| Part | Effect |
|---|---|
| `-n 50000` | 50,000 total requests |
| `-c 500` | up to 500 in flight |
| `-r 5000` | never exceed 5,000 RPS |
| `--format json` | machine-readable stdout |
| `--output` | full report saved to `orders-report.json` |

After the run, view the saved report any time:

```bash
storm report orders-report.json
```

## What Happens on Auth-Protected Endpoints

Custom request headers are **not yet supported** in v0.4 — endpoints that
require an `Authorization` header will return `401`, which counts as a
successful (fast) HTTP response in the results, not a failure.

Header support is on the roadmap. Until then, test auth-protected flows
behind a proxy that injects credentials, or load-test endpoints that are
protected at the infrastructure level (IP allowlist) rather than per-request.

## Next Steps

- [CLI Reference](/guide/cli-reference) — all request flags
- [Output Formats](/guide/output-formats) — what you get back
