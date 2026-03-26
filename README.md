# ww-kit

> **AI-powered development workflow kit for Claude Code.**
---

## Installation

```bash
npm install -g ww-kit          # or: mise use -g npm:ww-kit
```

## Quick Start

```bash
ww-kit init                    # install skills, configure MCP
```

```
/ww                            # analyze project, generate context
/ww-plan Add user auth         # plan a feature
/ww-do                         # execute the plan
/ww-commit                     # quality gates + commit
```

---

## All Commands — Detailed Reference

### Setup

| Command | Modes | What it does |
|---------|-------|-------------|
| `/ww` | `/ww` · `/ww <description>` | Analyze project → DESCRIPTION.md. 3 modes: existing project, new with description, empty project |
| `/ww-arch` | `/ww-arch [clean\|ddd\|microservices\|monolith\|layers]` | Architecture guidelines → ARCHITECTURE.md |
| | `/ww-arch brainstorm <topic>` | Explore architecture options → proposals/ |
| | `/ww-arch challenge <topic>` | Stress-test proposal via /ww-grill → challenges/ |
| | `/ww-arch decide <topic>` | Lock decision → ADR in decisions/ |
| `/ww-rules` | `/ww-rules [rule text]` | Add conventions → RULES.md |

### Think — before you plan

| Command | Modes | What it does |
|---------|-------|-------------|
| `/ww-explore` | `/ww-explore [topic]` | Brainstorm, compare options, map constraints. Saves to RESEARCH.md |
| `/ww-grounded` | `/ww-grounded <question>` | Evidence-only answers. Confidence < 100 → refuses to guess |
| `/ww-reference` | `/ww-reference <url\|path> [--name N] [--update]` | Import external docs for AI context → references/ |
| | `/ww-reference list\|show\|delete` | Manage existing references |

### Plan — structure the work

| Command | Modes | What it does |
|---------|-------|-------------|
| `/ww-plan` | `fast <desc>` | Quick plan → PLAN.md, no git branch |
| | `full <desc>` | Git branch + full plan → plans/\<branch\>.md |
| | `--deep <desc>` | Discovery interview → user stories → phases → task breakdown |
| | `full --parallel <desc>` | Isolated worktree for concurrent feature work |
| | `--list` | Show active worktrees and plan status |
| | `--cleanup <branch>` | Remove worktree, optionally delete branch |
| `/ww-grill` | `/ww-grill [topic\|file]` | Stress-test in 3 phases: Map terrain → Break assumptions → Ground in reality |
| `/ww-improve` | `/ww-improve [--list] [@file] [prompt]` | Refine plan: find missing tasks, fix deps, remove redundancy |

### Execute — do the work

| Command | Modes | What it does |
|---------|-------|-------------|
| `/ww-do` | `/ww-do` | Resume from next incomplete task, commit at checkpoints |
| | `/ww-do @<file>` | Execute explicit plan file |
| | `/ww-do <number>` | Start from specific task |
| | `/ww-do status` | Check progress without executing |
| | `/ww-do --list` | Show available plans |
| `/ww-fix` | `/ww-fix <error>` → Fix now | Investigate, fix with logging, create patch |
| | `/ww-fix <error>` → Plan first | Create FIX_PLAN.md, stop for review |
| | `/ww-fix` (plan exists) | Execute FIX_PLAN.md |
| `/ww-loop` | `new <task>` | Start iterative loop: PLAN → PRODUCE → EVALUATE → CRITIQUE → REFINE |
| | `resume [alias]` | Continue active loop |
| | `status` · `stop` · `list` · `history` · `clean` | Manage loop lifecycle |

### Verify — check quality

| Command | Modes | What it does |
|---------|-------|-------------|
| `/ww-verify` | `/ww-verify` | Check implementation vs plan, build/test/lint |
| | `/ww-verify --strict` | Zero tolerance: all tasks done, no TODOs, gates fail on violations |
| `/ww-review` | `/ww-review` | Review staged changes |
| | `/ww-review <PR#>` | Review pull request |
| | `/ww-review <ref>` | Review commits between ref and HEAD |
| `/ww-audit` | `/ww-audit` | Codebase health: deps, quality, coverage, security → AUDIT.md + TECH-DEBT.md |
| | `/ww-audit --legacy` | + EOL detection, migration paths, deprecated patterns |
| | `/ww-audit --debt-only` | Convert existing AUDIT.md → prioritized TECH-DEBT.md |

### Commit & Learn

| Command | Modes | What it does |
|---------|-------|-------------|
| `/ww-commit` | `/ww-commit [scope]` | Quality gates → conventional commit. Checks arch/rules/roadmap alignment |
| `/ww-evolve` | `/ww-evolve [skill\|all]` | Read patches → analyze patterns → improve skill-context → AI gets smarter |

### Generators (`/wws-*`) — scaffolding

| Command | Modes | What it does |
|---------|-------|-------------|
| `/wws-docs` | `/wws-docs` · `--web` | Generate README + docs/. `--web` adds HTML site |
| `/wws-ci` | `/wws-ci [github\|gitlab] [--enhance]` | CI pipeline: lint, tests, build, security |
| `/wws-docker` | `/wws-docker` · `--audit` | Dockerfile + compose (dev/prod) + .dockerignore |
| `/wws-build` | `/wws-build [makefile\|taskfile\|justfile\|mage]` | Build automation with stack-aware targets |
| `/wws-roadmap` | `/wws-roadmap` · `check` · `<vision>` | Strategic milestones → ROADMAP.md |
| `/wws-security` | `/wws-security [auth\|injection\|xss\|csrf\|secrets\|api\|infra\|prompt-injection\|race-condition]` | Security audit by category |
| `/wws-skill` | `/wws-skill <name>` · `<url>` · `search` · `scan` · `validate` · `template` | Generate, learn, search, or validate skills |
| `/wws-best-practices` | `/wws-best-practices [naming\|structure\|errors\|testing\|review]` | Code quality guidelines by topic |

---

## Project Files

All ww-kit artifacts live in `.ww-kit/` to keep your project root clean:

```
.ww-kit/
├── DESCRIPTION.md              # Project spec (written by /ww)
├── ARCHITECTURE.md             # Architecture decisions (written by /ww-arch)
├── RULES.md                    # Conventions (written by /ww-rules)
├── ROADMAP.md                  # Strategic milestones (written by /wws-roadmap)
├── RESEARCH.md                 # Exploration notes (written by /ww-explore)
├── PLAN.md                     # Quick plan (written by /ww-plan fast)
├── FIX_PLAN.md                 # Bug fix plan (written by /ww-fix)
├── AUDIT.md                    # Health report (written by /ww-audit)
├── TECH-DEBT.md                # Prioritized debt (written by /ww-audit)
├── SECURITY.md                 # Security findings (written by /wws-security)
├── plans/                      # Feature plans by branch name
├── patches/                    # Self-improvement patches from /ww-fix
├── references/                 # External knowledge (from /ww-reference)
├── decisions/                  # Architecture Decision Records
├── skill-context/              # Per-skill improvements (from /ww-evolve)
├── evolutions/                 # Evolution logs + patch cursor
└── evolution/                  # Loop state (from /ww-loop)
```

---

## Example Session

```bash
# 1. Set up project context
/ww
/ww-arch

# 2. Research before planning
/ww-explore Add real-time notifications with WebSockets
/ww-reference https://docs.example.com/websocket-api --name ws-api

# 3. Plan the feature
/ww-plan full Add real-time notifications with WebSockets

# 4. Stress-test the plan
/ww-grill

# 5. Refine based on feedback
/ww-improve add reconnection handling and message queuing

# 6. Execute
/ww-do

# 7. Fix something that came up
/ww-fix WebSocket connection drops after 30s idle

# 8. Verify everything
/ww-verify --strict

# 9. Commit
/ww-commit

# 10. Let AI learn from the experience
/ww-evolve
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | First project walkthrough, CLI commands |
| [Development Workflow](docs/workflow.md) | Full workflow diagram and decision table |
| [Reflex Loop](docs/loop.md) | Iterative generate → evaluate → refine protocol |
| [Core Skills](docs/skills.md) | Detailed reference for every command |
| [Subagents](docs/subagents.md) | Planning, implementation, and loop subagents |
| [Skill Evolution](docs/evolve.md) | How fixes feed into smarter skills |
| [Plan Files](docs/plan-files.md) | Plan formats and self-improvement patches |
| [Security](docs/security.md) | Security scanning for external skills |
| [Extensions](docs/extensions.md) | Writing and installing extensions |
| [Configuration](docs/configuration.md) | `.ww-kit.json`, MCP, project structure |

---

## Links

- [skills.sh](https://skills.sh) — Skill marketplace
- [Agent Skills Spec](https://agentskills.io) — Skill specification
- [Claude Code](https://claude.ai/code) — Anthropic's AI coding agent

## License

MIT
