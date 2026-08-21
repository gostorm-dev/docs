# FAQ

## Why another load testing tool?

Because existing tools can't tell you when *they* are the problem.

Every load tester consumes CPU to generate load. Past a point the generator —
not your target — becomes the bottleneck, and every latency number it prints
is a lie about your target. go-storm monitors its own CPU, memory growth, GC
pauses and worker utilization during every run and tells you plainly:

```text
✅ GENERATOR HEALTHY — Results are trustworthy.
```

No mainstream tool does this. It is the reason go-storm exists.

## How does go-storm compare to k6, wrk and vegeta?

Head-to-head on identical hardware against the same local target:

| Test | go-storm | k6 | Result |
|---|---|---|---|
| 10K reqs @ 100 conc | **11,960 RPS** | 7,118 RPS | 1.68× faster |
| 200K reqs @ 2000 conc | **finished in 27.7s** | crashed mid-run (EOF errors) | k6 died |
| 50K reqs @ 5000 RPS limit | **5,551 RPS, 0 dropped** | 4,972 RPS, 277 dropped | rate accuracy win |
| 10K POST requests | **10,322 RPS** | 5,471 RPS | 1.89× faster |
| 100K POST requests | **9,816 RPS** | 6,250 RPS | 1.57× faster |
| 5K slow endpoint (~1s) | **976 RPS** | 956 RPS | parity |

Full methodology in the [project README](https://github.com/gostorm-dev/go-storm#benchmarks).

Fair summary: for scripting complex scenarios k6 is more mature. For raw
throughput, rate accuracy under load, and knowing when results are
trustworthy, go-storm wins.

## How much load can one machine generate?

It depends on the target's response time and TLS usage, but as a reference
point, a modest cloud VM sustains ~12,000 RPS against a fast local target
with the health report still fully green. Watch the Generator Health Report:
when CPU approaches WARN (85%), scale out with
[Distributed Mode](/guide/distributed-mode).

## Is there a memory leak?

No. A 500,000-request soak at concurrency 200 peaked at ~106 MB RSS and
returned to baseline cleanly. Memory growth rate is monitored during every
test specifically to catch leaks if they ever appear.

## Which platforms are supported?

Linux, macOS and Windows. The binary is fully static (no runtime
dependencies) and runs on amd64 and arm64 — including containers and EC2
instances, where it was battle tested.

## Why is my test request-count based instead of duration based?

Predictability. `-n 50000 -c 500 -r 5000` defines an exact workload: same
request count, same ceiling, every run. Duration-based tools silently change
the workload when throughput changes — a "60 second test" might deliver half
the requests you expected. With request counts plus the achieved-vs-requested
RPS report, you always know exactly what was delivered.

## Does a non-zero exit code mean requests failed?

No — see [Exit Codes](/reference/exit-codes). Exit codes tell you whether
*storm* ran; the JSON report tells you how the *target* behaved. CI should
assert on `success_rate`, `failed` and `p95_ms`.

## Are custom headers supported?

Not yet in v0.4 — see [HTTP Methods](/guide/http-methods#what-happens-on-auth-protected-endpoints).
Header support is on the roadmap.

## Where do the numbers in these docs come from?

From real runs of real binaries — the CLI examples are from `storm --help`
output of v0.4, the sample reports are captured output, and the benchmarks
were executed on cloud VMs against a controlled target. Nothing on this site
is invented.

## How can I contribute?

The project lives at [github.com/gostorm-dev/go-storm](https://github.com/gostorm-dev/go-storm).
Bug reports with reproducible commands and saved JSON reports are especially
valuable.
