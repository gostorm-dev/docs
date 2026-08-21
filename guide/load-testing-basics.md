# Load Testing Basics

The concepts you need to read go-storm results correctly.

## RPS vs Concurrency vs Latency

These three numbers are related but **not interchangeable**:

```text
Concurrency  = how many requests are in flight at once
RPS          = how many requests complete per second
Latency      = how long one request takes
```

They are connected by Little's Law:

```text
Concurrency ≈ RPS × Latency
```

Example: if your target takes 100ms per request and you run 50 workers:

```text
max achievable RPS = 50 workers / 0.1s = 500 RPS
```

If you need 5000 RPS against a 100ms endpoint, no amount of hoping will get
you there with 50 workers — you need ~500 workers, or multiple machines.

## Request-Count Based Testing

go-storm tests are defined by a **total request count** (`-n`), not a duration:

```bash
storm run -u https://example.com -n 10000 -c 200
```

- The test ends when all `10000` requests have completed.
- The progress bar shows live throughput and a time estimate.
- Faster targets finish sooner; the load shape stays the same.

## Requested vs Achieved RPS

When you set `-r`, you are setting an upper bound:

```bash
storm run -u https://example.com -n 50000 -c 500 -r 5000
```

Two different things can now happen:

| Outcome | Meaning |
|---|---|
| Achieved ≈ 5000 RPS | Target kept up. Test is valid. |
| Achieved < 5000 RPS | Either the target slowed down **or your generator saturated** |

Most tools cannot tell you which of the two happened. go-storm can — that is
what the [Generator Health Report](/guide/generator-health) is for.

## Reading Percentiles

```text
p50 Response: 50ms     ← half of all requests were faster than this
p95 Response: 500ms    ← 95% of requests were faster than this
p99 Response: 5s       ← the slowest 1% start here
```

Percentiles matter more than averages because user pain lives in the tail.
An average of 76ms looks fine until you see p99 is 5 seconds.

::: warning Don't trust averages alone
A few very fast requests can hide many very slow ones. Always check p95/p99
before declaring victory.
:::

## What Counts as "Failed"

A request is counted as failed when it produces **no usable HTTP response**:

- connection refused / reset
- DNS resolution failure
- TLS handshake failure
- timeout (`-t`, default 10 seconds)

HTTP error statuses (404, 500, etc.) are **successful requests** in the
latency sense — they appear in the Status Code Distribution and count toward
`Successful`. A 500 that returned in 20ms is still a fast response; whether it
is a *test* failure depends on what you are testing.

## Generator Overhead

Every load tester consumes CPU to generate load. If the generator saturates:

- latencies inflate (requests queue inside the generator)
- achieved RPS drops below the requested rate
- percentiles become measurements of your own machine, not the target

go-storm monitors itself during every test so this never happens silently.
See [Generator Health](/guide/generator-health).

## Next Steps

- [Quick Start](/guide/quickstart) — put this into practice
- [CLI Reference](/guide/cli-reference) — flags for controlling load
