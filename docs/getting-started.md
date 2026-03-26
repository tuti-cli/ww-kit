[← Back to README](../README.md) · Next: [Development Workflow →](workflow.md)

# Getting Started

## What is ww-kit?

ww-kit is a **stack-agnostic** CLI tool and skill system that works with any language, framework, or platform:

1. **Analyzes your project** — understands your codebase structure and conventions
2. **Installs relevant skills** — downloads from [skills.sh](https://skills.sh) or generates custom ones
3. **Configures MCP servers** — GitHub, Postgres, Filesystem, Playwright based on your needs
4. **Provides spec-driven workflow** — structured feature development with plans, tasks, and commits

## Supported Agents

ww-kit works with any AI coding agent. During `ww-kit init`, you choose one or more target agents and skills are installed to each agent's correct directory with paths adapted automatically:

| Agent | Config Directory | Skills Directory |
|-------|-----------------|-----------------|
| Claude Code | `.claude/` | `.claude/skills/` |
| Cursor | `.cursor/` | `.cursor/skills/` |
| Windsurf | `.windsurf/` | `.windsurf/skills/` |
| Roo Code | `.roo/` | `.roo/skills/` |
| Kilo Code | `.kilocode/` | `.kilocode/skills/` |
| Antigravity | `.agent/` | `.agent/skills/`, `.agent/workflows/` |
| OpenCode | `.opencode/` | `.opencode/skills/` |
| Warp | `.warp/` | `.warp/skills/` |
| Zencoder | `.zencoder/` | `.zencoder/skills/` |
| Codex CLI | `.codex/` | `.codex/skills/` |
| GitHub Copilot | `.github/` | `.github/skills/` |
| Gemini CLI | `.gemini/` | `.gemini/skills/` |
| Junie | `.junie/` | `.junie/skills/` |
| Qwen Code | `.qwen/` | `.qwen/skills/` |
| Universal / Other | `.agents/` | `.agents/skills/` |

When Claude Code is selected, ww-kit also installs bundled Claude subagents into `.claude/agents/` and tracks them in `.ww-kit.json`. This is Claude-only and is documented in [Subagents](subagents.md).

MCP server configuration is supported for Claude Code, Cursor, GitHub Copilot, Roo Code, Kilo Code, OpenCode, and Qwen Code. Other agents get skills installed with correct paths but without MCP auto-configuration.

## Your First Project

```bash
# 1. Install ww-kit
npm install -g ww-kit

# 2. Go to your project
cd my-project

# 3. Initialize — pick agents, install skills, configure MCP
ww-kit init

# 4. Open your AI agent (Claude Code, Cursor, etc.) and run:
/ww

# 5. Optional discovery before planning
/ww-explore Add user authentication with OAuth

# 6. Start building
/ww-plan Add user authentication with OAuth
```

If scope is unclear, start with `/ww-explore` (optionally save results to `.ww-kit/RESEARCH.md`); if the task is clear but the answer must be strictly verified, use `/ww-grounded`; if the direction is already clear, jump straight to `/ww-plan`. From there, ww-kit creates a branch (full mode), builds a plan, and you run `/ww-do` to execute it step by step.

## CLI Commands

```bash
# Initialize project
ww-kit init

# Update skills to latest version (also checks for CLI updates)
ww-kit update

# Force clean reinstall of currently installed base skills
ww-kit update --force

# Migrate existing skills from v1 naming to v2 naming
ww-kit upgrade

# Install an extension (local path, git URL, or npm package)
ww-kit extension add ./my-extension

# List installed extensions
ww-kit extension list

# Update extensions from their sources
ww-kit extension update

# Update a specific extension (use --force to refresh unchanged versions)
ww-kit extension update my-extension --force

# Remove extension
ww-kit extension remove my-extension
```

For v1 -> v2 migration, run `ww-kit upgrade` to rename old skills to the new `aif-*` prefix.

`ww-kit update` now:
- Checks for extension updates from their sources (npm, GitHub, etc.) before updating base skills
- Prints per-agent status buckets for base skills (`changed`, `unchanged`, `skipped`, `removed`)
- For Claude Code, also refreshes managed `.claude/agents/` subagents and prints a separate `Subagents` status block
- Skills newly available in the package but not previously installed are shown as `skipped` (not auto-installed)

## Next Steps

- [Development Workflow](workflow.md) — understand the full flow from plan to commit
- [Reflex Loop](loop.md) — run iterative generate → evaluate → critique → refine cycles
- [Core Skills](skills.md) — all available slash commands
- [Configuration](configuration.md) — customize `.ww-kit.json` and MCP servers
