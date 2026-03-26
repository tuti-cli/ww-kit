[← Extensions](extensions.md) · [Back to README](../README.md)

# Configuration

## `.ww-kit.json`

```json
{
  "version": "2.8.0",
  "agents": [
    {
      "id": "claude",
      "skillsDir": ".claude/skills",
      "subagentsDir": ".claude/agents",
      "installedSkills": ["aif", "ww-plan", "ww-improve", "ww-do", "ww-commit", "wws-build"],
      "installedSubagents": [
        "best-practices-sidecar.md",
        "commit-preparer.md",
        "docs-auditor.md",
        "implement-coordinator.md",
        "implement-worker.md",
        "loop-critic.md",
        "loop-evaluator.md",
        "loop-invariant-prep.md",
        "loop-orchestrator.md",
        "loop-perf-prep.md",
        "loop-planner.md",
        "loop-producer.md",
        "loop-refiner.md",
        "loop-test-prep.md",
        "plan-coordinator.md",
        "plan-polisher.md",
        "review-sidecar.md",
        "security-sidecar.md"
      ],
      "mcp": {
        "github": true,
        "postgres": false,
        "filesystem": false,
        "chromeDevtools": false,
        "playwright": false
      }
    },
    {
      "id": "codex",
      "skillsDir": ".codex/skills",
      "installedSkills": ["aif", "ww-plan", "ww-do"],
      "mcp": {
        "github": false,
        "postgres": false,
        "filesystem": false,
        "chromeDevtools": false,
        "playwright": false
      }
    }
  ],
  "extensions": [
    {
      "name": "aif-ext-example",
      "source": "https://github.com/user/ww-ext-example.git",
      "version": "1.0.0"
    }
  ]
}
```

The `agents` array can include any supported agent IDs: `claude`, `cursor`, `windsurf`, `roocode`, `kilocode`, `antigravity`, `opencode`, `warp`, `zencoder`, `codex`, `copilot`, `gemini`, `junie`, or `universal`. Each agent keeps its own `skillsDir`, installed skills list, and MCP preferences. Claude Code agents also persist `subagentsDir` and `installedSubagents`, so `ww-kit update` can refresh `.claude/agents/` alongside skills. ww-kit additionally stores internal `managedSkills` and `managedSubagents` hash maps in `.ww-kit.json`; they are omitted from the example above for brevity.

The optional `extensions` array tracks installed extensions by name, original source, and version. `ww-kit update` now refreshes these extensions from their saved sources before base-skill updates, and `ww-kit extension update [name] --force` refreshes them without running the full base-skill update flow.

Extension refresh uses the saved `source` field:

- npm sources are checked against the npm registry and skipped when the published version is unchanged
- GitHub sources fetch `extension.json` through the GitHub API before cloning
- local paths and non-GitHub git sources require `--force` for refresh

When GitHub-backed extension refreshes are frequent, set `GITHUB_TOKEN` to raise the GitHub API rate limit used by these checks.

## MCP Configuration

ww-kit can configure these MCP servers:

| MCP Server | Use Case | Env Variable |
|------------|----------|--------------|
| GitHub | PRs, issues, repo operations | `GITHUB_TOKEN` |
| Postgres | Database queries | `DATABASE_URL` |
| Filesystem | Advanced file operations | - |
| Chrome Devtools | Browser inspection, debugging, performance | - |
| Playwright | Browser automation, web testing | - |

Configuration saved to agent's settings file (e.g. `.mcp.json` for Claude Code, `.cursor/mcp.json` for Cursor, `.vscode/mcp.json` for GitHub Copilot, `.roo/mcp.json` for Roo Code, `.kilocode/mcp.json` for Kilo Code, `opencode.json` for OpenCode). GitHub Copilot uses `servers` as the root object in `mcp.json`; other standard agents use `mcpServers` (OpenCode uses `mcp`).

### Environment Variables

MCP configs use `${VAR}` placeholders for credentials (GitHub Copilot receives `${env:VAR}` in `.vscode/mcp.json`). Set them before launching the agent:

```bash
export GITHUB_TOKEN="ghp_your_token"
export DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

Or replace the placeholders with actual values directly in the config file:

```json
{
  "mcpServers": {
    "github": {
      "env": { "GITHUB_TOKEN": "ghp_your_token" }
    }
  }
}
```

## Project Structure

After initialization (example for Claude Code — other agents use their own directory):

```
your-project/
├── .claude/                   # Agent config dir (varies: .cursor/, .codex/, .ai/, etc.)
│   ├── agents/
│   │   ├── best-practices-sidecar.md
│   │   ├── commit-preparer.md
│   │   ├── docs-auditor.md
│   │   ├── implement-coordinator.md
│   │   ├── implement-worker.md
│   │   ├── loop-critic.md
│   │   ├── loop-evaluator.md
│   │   ├── loop-invariant-prep.md
│   │   ├── loop-orchestrator.md
│   │   ├── loop-perf-prep.md
│   │   ├── loop-planner.md
│   │   ├── loop-producer.md
│   │   ├── loop-refiner.md
│   │   ├── loop-test-prep.md
│   │   ├── plan-coordinator.md
│   │   ├── plan-polisher.md
│   │   ├── review-sidecar.md
│   │   └── security-sidecar.md
│   ├── skills/
│   │   ├── aif/
│   │   ├── ww-plan/
│   │   ├── ww-improve/
│   │   ├── ww-do/
│   │   ├── ww-commit/
│   │   ├── wws-docker/
│   │   ├── wws-build/
│   │   ├── ww-verify/
│   │   ├── wws-docs/
│   │   ├── ww-reference/
│   │   ├── ww-review/
│   │   └── wws-skill/
│   └── settings.local.json    # Permissions config (gitignored)
├── .ww-kit/               # ww-kit working directory
│   ├── DESCRIPTION.md         # Project specification
│   ├── ARCHITECTURE.md        # Architecture decisions and guidelines
│   ├── PLAN.md                # Current plan (from /ww-plan fast)
│   ├── SECURITY.md            # Ignored security items (from /wws-security ignore)
│   ├── extensions/            # Installed extensions (from ww-kit extension add)
│   │   └── <extension-name>/
│   │       └── extension.json
│   ├── references/            # Knowledge references from external sources (from /ww-reference)
│   │   └── <topic>.md
│   ├── plans/                 # Plans from /ww-plan full
│   │   └── <branch-name>.md
│   ├── skill-context/         # Project-specific rules for built-in skills (from /ww-evolve)
│   │   ├── ww-fix/
│   │   │   └── SKILL.md
│   │   └── ww-review/
│   │       └── SKILL.md
│   ├── patches/               # Self-improvement patches (from /ww-fix)
│   │   └── 2026-02-07-14.30.md
│   ├── evolutions/            # Evolution logs (from /ww-evolve)
│   │   ├── 2026-02-08-10.00.md
│   │   └── patch-cursor.json  # Incremental evolve cursor (latest processed patch)
│   └── evolution/             # Active reflex loop state (from /ww-loop)
│       ├── current.json
│       └── <task-alias>/
│           ├── run.json
│           ├── history.jsonl
│           └── artifact.md
├── .mcp.json                  # MCP servers config (Claude Code project scope)
└── .ww-kit.json           # ww-kit config
```

## Reflex Loop Files

`/ww-loop` keeps state lean and resumable between sessions:

- `.ww-kit/evolution/current.json` — active loop pointer (to current run)
- `.ww-kit/evolution/<task-alias>/run.json` — current run snapshot (loop execution state)
- `.ww-kit/evolution/<task-alias>/history.jsonl` — append-only event history
- `.ww-kit/evolution/<task-alias>/artifact.md` — latest artifact output

For full phase contracts and stop conditions, see [Reflex Loop](loop.md).

## Evolution Cursor File

`/ww-evolve` uses a lightweight cursor to process patches incrementally:

- `.ww-kit/evolutions/patch-cursor.json` — last processed patch marker
- First run (no cursor): evolve reads all patches
- Subsequent runs: evolve reads patches newer than the cursor (plus a small overlap window to catch missed points)
- To force a full rescan: delete `patch-cursor.json` and run `/ww-evolve` again

## Best Practices

### Artifact Ownership and Context Gates
- Keep context artifact ownership command-scoped (roadmap by `/wws-roadmap`, rules by `/ww-rules`, architecture by `/ww-arch`, research by `/ww-explore`).
- Treat `/ww-commit`, `/ww-review`, and `/ww-verify` as read-only consumers of context artifacts by default.
- Use `WARN` for non-blocking gate findings (missing optional files, ambiguous mapping) and `ERROR` for blocking violations.

### Logging
All implementations include verbose, configurable logging:
- Use log levels (DEBUG, INFO, WARN, ERROR)
- Control via `LOG_LEVEL` environment variable
- Implement rotation for file-based logs

### Commits
- Commit checkpoints every 3-5 tasks for large features
- Follow conventional commits format
- Meaningful messages, not just "update code"

### Testing
- Always asked before creating plan
- If "no tests" - no test tasks created
- Never sneaks in test code

## See Also

- [Getting Started](getting-started.md) — installation, supported agents, first project
- [Development Workflow](workflow.md) — how to use the workflow skills
- [Reflex Loop](loop.md) — contracts and storage layout for `/ww-loop`
- [Extensions](extensions.md) — writing and installing extensions
- [Security](security.md) — how external skills are scanned before use
