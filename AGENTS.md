# ww-kit — Developer Guide

> This file is for AI agents working on this codebase. Read this first when starting a new session.

## What is this project?

**ww-kit** is an npm package + skill system that provides AI-powered development workflows for Claude Code. It provides:

1. **CLI tool** (`ww-kit init/update/upgrade`) — installs skills and configures MCP
2. **Built-in skills** (25 skills, `ww-*` and `wws-*` prefixed) — workflow commands for spec-driven development
3. **Spec-driven workflow** — structured approach: plan → implement → commit
4. **Claude Code only** — optimized for a single agent

## Project Structure

```
ww-kit/
├── src/                    # CLI source (TypeScript)
│   ├── cli/
│   │   ├── commands/       # init.ts, update.ts, upgrade.ts, extension.ts
│   │   └── wizard/         # prompts.ts, skill-hints.ts
│   ├── core/               # installer.ts, config.ts, mcp.ts, agents.ts, template.ts, transformer.ts
│   └── utils/              # fs.ts
├── skills/                 # Built-in skills (copied to user projects)
│   ├── ww/                          # Main setup skill
│   ├── ww-arch/                     # Architecture decisions + ADRs
│   ├── ww-audit/                    # Codebase health audit
│   ├── ww-commit/                   # Conventional commits
│   ├── ww-do/                       # Execute plan tasks
│   ├── ww-evolve/                   # Self-improve skills based on context
│   ├── ww-explore/                  # Explore mode (thinking partner)
│   ├── ww-fix/                      # Quick bug fixes (no plans)
│   ├── ww-grill/                    # Stress-test plans/designs
│   ├── ww-grounded/                 # Reliability gate for answers
│   ├── ww-improve/                  # Plan refinement
│   ├── ww-loop/                     # Iterative reflex loop
│   ├── ww-plan/                     # Plan implementation (fast/full/deep modes)
│   ├── ww-reference/                # External docs references
│   ├── ww-review/                   # Code review
│   ├── ww-rules/                    # Project rules and conventions
│   ├── ww-verify/                   # Verify implementation against plan
│   ├── wws-best-practices/          # Code quality guidelines
│   ├── wws-build/                   # Build automation generator
│   ├── wws-ci/                      # CI pipeline generator
│   ├── wws-docker/                  # Docker/compose generator
│   ├── wws-docs/                    # Documentation generation
│   ├── wws-roadmap/                 # Strategic project roadmap
│   ├── wws-security/                # Security audit checklist
│   └── wws-skill/                   # Generate new skills
├── subagents/              # Claude Code subagents
├── scripts/                # test-skills.sh
├── mcp/                    # MCP server templates
├── dist/                   # Compiled JS
└── bin/                    # CLI entry point
```

## Key Concepts

### Skills Location
- **Package skills**: `skills/` — source of truth, copied during install
- **User skills**: `.claude/skills/` in the target project

### Working Directory
All ww-kit files in user projects go to `.ww-kit/`:
- `.ww-kit/DESCRIPTION.md` — project specification
- `.ww-kit/ARCHITECTURE.md` — architecture decisions and guidelines
- `.ww-kit/PLAN.md` — task plan (from /ww-plan fast)
- `.ww-kit/plans/<branch>.md` — plans (from /ww-plan full)
- `.ww-kit/skill-context/<skill>/SKILL.md` — project-specific overrides (from /ww-evolve)
- `.ww-kit/evolutions/*.md` — evolution logs (from /ww-evolve)
- `.ww-kit/evolutions/patch-cursor.json` — incremental evolve cursor
- `.ww-kit/evolution/current.json` — active loop pointer (from /ww-loop)
- `.ww-kit/evolution/<alias>/run.json` — current loop state
- `.ww-kit/evolution/<alias>/history.jsonl` — loop event history
- `.ww-kit/evolution/<alias>/artifact.md` — latest loop artifact output

### Artifact Ownership Contract

| Artifact | Primary writer | Notes |
|----------|---------------|-------|
| `.ww-kit/DESCRIPTION.md` | `/ww` | `/ww-do` may update when context facts change |
| `.ww-kit/ARCHITECTURE.md` | `/ww-arch` | `/ww-do` may update structure notes |
| `.ww-kit/ROADMAP.md` | `/wws-roadmap` | `/ww-do` may mark completed milestones |
| `.ww-kit/RULES.md` | `/ww-rules` | conventions source of truth |
| `.ww-kit/RESEARCH.md` | `/ww-explore` | explore-mode writable artifact |
| `.ww-kit/PLAN.md` / `.ww-kit/plans/<branch>.md` | `/ww-plan` | `/ww-improve` refines existing plans |
| `.ww-kit/FIX_PLAN.md` and `.ww-kit/patches/*.md` | `/ww-fix` | fix workflow ownership |
| `.ww-kit/skill-context/*` | `/ww-evolve` | skill-context overrides |
| `.ww-kit/evolutions/*` | `/ww-evolve` | evolution logs |
| `.ww-kit/evolution/*` | `/ww-loop` | loop state ownership |

### Skill Naming
All skills use `ww-` prefix (workflow) or `wws-` prefix (generation/scaffolding):
- `/ww` — main setup
- `/ww-plan`, `/ww-do`, `/ww-commit` — core workflow
- `/ww-arch`, `/ww-grill`, `/ww-audit` — architecture & quality
- `/wws-docs`, `/wws-ci`, `/wws-docker` — generators

## Development Commands

```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Link globally for testing
npm link

# Test in a project
cd /some/project
ww-kit init

# Update skills after changes
ww-kit update
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/cli/index.ts` | CLI entry point |
| `src/cli/commands/init.ts` | Interactive wizard: select skills, configure MCP |
| `src/cli/commands/update.ts` | Re-install all skills, preserve custom skills |
| `src/cli/commands/upgrade.ts` | Migration: remove old skill names, install new |
| `src/cli/wizard/prompts.ts` | Interactive CLI questions |
| `src/core/agents.ts` | Claude Code agent config |
| `src/core/installer.ts` | Copies skills to project |
| `src/core/mcp.ts` | MCP server configuration |
| `src/core/template.ts` | `{{var}}` template substitution in SKILL.md |
| `src/core/config.ts` | `.ww-kit.json` config management |
| `scripts/test-skills.sh` | Test suite |
| `skills/ww-*/SKILL.md` | Skill instructions |

## Important Rules

1. **Skills don't implement** - `/ww` only sets up context
2. **DESCRIPTION.md is source of truth** - all skills read it for context
3. **Plans go to .ww-kit/** - keeps project root clean
4. **Verbose logging required** - all implementations must have configurable logging
5. **Commit checkpoints** - for plans with 5+ tasks
6. **ARCHITECTURE.md is architecture source of truth** - all skills follow its folder structure and dependency rules

## Common Changes

### Adding a new skill
1. Create `skills/ww-new-skill/SKILL.md`
2. Add to `getAvailableSkills()` if needed
3. Rebuild: `npm run build`
4. Validate: `npm test`

### Modifying workflow
1. Edit relevant skill in `skills/`
2. Update AGENTS.md if logic changes
3. Rebuild and test with `ww-kit update`
4. Validate: `npm test`

## Testing

### Automated tests

```bash
npm test
```

### Manual checklist

- [ ] `npm test` passes
- [ ] `ww-kit init` works in empty directory
- [ ] `ww-kit update` updates existing skills
- [ ] `/ww` in Claude Code shows interactive stack selection
- [ ] `/ww-plan` creates branch + plan file
- [ ] `/ww-do` finds and executes plan
- [ ] Skills read `.ww-kit/DESCRIPTION.md`
