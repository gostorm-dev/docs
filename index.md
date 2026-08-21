---
layout: home

hero:
  name: "go-storm"
  text: "The Load Tester That Tells Truth"
  tagline: High-performance HTTP load testing with generator health monitoring
  actions:
    - theme: brand
      text: Get Started
      link: /guide/installation
    - theme: alt
      text: GitHub
      link: https://github.com/gostorm-dev/go-storm

  image:
    src: /logo.png
    alt: go-storm

features:
  - title: Generator Health Monitoring
    details: The ONLY load tester that tells you if YOUR machine is the bottleneck. Real-time CPU, memory, GC, goroutines, and worker utilization tracking.
  - title: Blazing Fast
    details: 1.68x faster than k6 in benchmarks. Pure Go goroutines with optimized connection pooling and zero-allocation hot path.
  - title: Multiple Output Formats
    details: text, json, table, quiet, csv — choose what works for your workflow. CI/CD friendly.
  - title: Distributed Testing
    details: Scale load across multiple machines with Redis-based job queue. Per-agent breakdown and heartbeat monitoring.
  - title: Connection Pooling
    details: HTTP/2 support, 25x more connections per host, buffer pooling with sync.Pool. 94%+ connection reuse ratio.
  - title: Capacity Estimation
    details: Pre-test benchmark shows your server's max RPS before running the full test. Know your limits.
---
