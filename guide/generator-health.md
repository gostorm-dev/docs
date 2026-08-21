# Generator Health

The feature that makes go-storm different: it watches **itself** while it
attacks your target, and tells you when the numbers stop being trustworthy.

## The Problem It Solves

Every load tester consumes CPU to generate load. Push a tool past its limits
and the measurements become lies:

```text
Requested: 100,000 RPS
Achieved:   72,000 RPS
Reason:     generator CPU saturated   ← most tools never tell you this
```

Without generator monitoring you cannot distinguish:

| Symptom | Target is slow | Generator is saturated |
|---|---|---|
| Achieved < requested RPS | ✅ possible | ✅ possible |
| Latency inflation | ✅ possible | ✅ possible |
| Which one is it? | need evidence | need evidence |

go-storm provides the evidence.

## What Is Monitored

During every test (on by default), go-storm tracks:

| Metric | What it detects |
|---|---|
| CPU usage | Generator too busy to drive more load |
| Memory growth rate | Runaway allocation / leak during the run |
| GC pause total | Garbage collector stealing time from workers |
| Goroutine count | Worker leaks |
| File descriptors | Socket/handle leaks |
| Worker utilization | Workers idle because the queue starved them |
| Connection pool | Connections created vs reused, pool hit/miss ratio |

## Saturation Levels

| Level | Meaning | Default behavior |
|---|---|---|
| `OK` | All checks pass | Test continues |
| `WARN` | Approaching a limit (e.g. CPU ≥ 85%) | Warning printed, test continues |
| `CRITICAL` | Limit breached (e.g. CPU ≥ 95%) | Warning printed; abort only with `--saturation-kill` |

Default thresholds:

| Factor | Warn | Critical |
|---|---|---|
| CPU | 85% | 95% |
| Memory growth | 100 MB/min | 500 MB/min |

## The Health Report

After every test you get a full report:

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
  GC Total Pause: 4.2 ms
  File Descriptors: 7

Connection Pool
  Connections Created:  300
  Connections Reused:   0
  Pool Hits:            0
  Pool Misses:          300
  Reuse Ratio:       0.0%

Checks
  ✅ CPU:                 1.8%
  ✅ GC Pause:            4.2 ms
  ✅ Goroutines:          4
  ✅ File Descriptors:    7
  ✅ Worker Utilization:  84.7%

───────────────────────────────────────────────
  ✅ GENERATOR HEALTHY
  Results are trustworthy.
───────────────────────────────────────────────
```

If any check had warned or failed, that line would show `⚠️` instead of `✅`
and the verdict would change accordingly.

## Reading the Load Section

```text
Load
  Target RPS:       Unlimited      ← what you asked for (-r)
  Achieved RPS:     285.7          ← what actually happened
```

- `Unlimited` + healthy system = the target was the bottleneck.
- `Target 5000 / Achieved 3200` + all checks ✅ = **target** slowed down.
- `Target 5000 / Achieved 3200` + CPU ⚠️ = your **generator** gave out —
  scale out with [Distributed Mode](/guide/distributed-mode) or raise limits.

## Proven Under Fire

In head-to-head testing against k6 on identical hardware (200K requests,
2000 concurrent workers):

```text
k6:        CRASHED mid-run — connection EOF errors, stuck near 120K requests
go-storm:  finished all 200K in 27.7s at 7,220 RPS, health report clean
```

Full benchmark data lives in the project README.

## Configuration Flags

| Flag | Default | Effect |
|---|---|---|
| `--saturation` | `true` | Turn monitoring off with `--saturation=false` |
| `--saturation-kill` | `false` | Abort the test on CRITICAL instead of warning |

::: tip When to use --saturation-kill
Use it for long unattended runs where a saturated generator would poison
hours of results. For interactive runs, warn-only lets you see how far the
system degrades before giving up.
:::

## Next Steps

- [Distributed Mode](/guide/distributed-mode) — when one machine isn't enough
- [Monitoring](/guide/monitoring) — live metrics during the run
