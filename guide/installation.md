# Installation

go-storm ships as a single static binary. No runtime, no dependencies, no plugins.

## Requirements

| Requirement | Minimum |
|---|---|
| Operating System | Linux, macOS, Windows |
| Architecture | amd64, arm64 |
| Go (only for source build) | 1.21+ |

## Install with Go

The fastest way if you already have Go installed:

```bash
go install github.com/gostorm-dev/go-storm/cmd/storm@latest
```

Verify the binary is on your `PATH`:

```bash
storm version
```

```text
go-storm version v0.4.0
commit:     3431458
built:      2026-08-20T13:35:59Z
platform:   linux/amd64
go:         go1.26.5
```

## Download a Binary

Prebuilt binaries are available on the
[GitHub Releases](https://github.com/gostorm-dev/go-storm/releases) page.

Linux example:

```bash
curl -LO https://github.com/gostorm-dev/go-storm/releases/latest/download/storm-linux-amd64
chmod +x storm-linux-amd64
sudo mv storm-linux-amd64 /usr/local/bin/storm
```

macOS (Apple Silicon):

```bash
curl -LO https://github.com/gostorm-dev/go-storm/releases/latest/download/storm-darwin-arm64
chmod +x storm-darwin-arm64
sudo mv storm-darwin-arm64 /usr/local/bin/storm
```

## Build from Source

```bash
git clone https://github.com/gostorm-dev/go-storm.git
cd go-storm
make build
```

The binary is written to `./storm`. To build a fully static binary (useful for
containers or EC2 instances):

```bash
CGO_ENABLED=0 go build -o storm ./cmd/storm
```

## Verify the Installation

Run the built-in help to confirm everything works:

```bash
storm --help
```

You should see:

```text
go-storm — The Load Tester That Tells Truth

A high-performance HTTP load testing engine written in Go.
Unlike other tools, go-storm detects when YOUR generator is the bottleneck.
```

## Next Steps

- [Quick Start](/guide/quickstart) — run your first test in 30 seconds
- [CLI Reference](/guide/cli-reference) — every flag explained
