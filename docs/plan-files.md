[← Skill Evolution](evolve.md) · [Back to README](../README.md) · [Security →](security.md)

# Plan Files

ww-kit uses markdown files to track implementation plans:

| Source | Plan File | After Completion |
|--------|-----------|------------------|
| `/ww-plan fast` | `.ww-kit/PLAN.md` | Offer to delete |
| `/ww-plan full` | `.ww-kit/plans/<branch-name>.md` | Keep (user decides) |

## Artifact Ownership Quick Map

To avoid ownership conflicts, artifact writers are command-scoped:

| Artifact                                                                  | Primary owner command | Notes                                                                                          |
|---------------------------------------------------------------------------|-----------------------|------------------------------------------------------------------------------------------------|
| `.ww-kit/DESCRIPTION.md`                                              | `/ww`                | `/ww-do` may update only when implementation context actually changed                  |
| `.ww-kit/ARCHITECTURE.md`                                             | `/ww-arch`   | `/ww-do` may update structure notes when implementation changes structure              |
| `.ww-kit/ROADMAP.md`                                                  | `/wws-roadmap`        | `/ww-do` may mark completed milestones with evidence                                   |
| `.ww-kit/RULES.md`                                                    | `/ww-rules`          | convention source of truth                                                                     |
| `.ww-kit/RESEARCH.md`                                                 | `/ww-explore`        | explore-mode writable artifact                                                                 |
| `.ww-kit/PLAN.md` and `.ww-kit/plans/<branch>.md`                 | `/ww-plan`           | `/ww-improve` refines existing plans                                                          |
| `.ww-kit/FIX_PLAN.md` and `.ww-kit/patches/*.md`                  | `/ww-fix`            | fix workflow artifacts; context files (including `DESCRIPTION.md`) remain read-only by default |
| `.ww-kit/skill-context/*`                                             | `/ww-evolve`         | project-specific skill overrides derived from patches                                          |
| `.ww-kit/evolutions/*.md`, `.ww-kit/evolutions/patch-cursor.json` | `/ww-evolve`         | evolution logs + incremental patch cursor                                                      |

Quality commands (`/ww-commit`, `/ww-review`, `/ww-verify`) treat these files as read-only context by default.

## Research File (Optional)

`.ww-kit/RESEARCH.md` is a persisted exploration artifact. Use it to capture constraints, decisions, and open questions during `/ww-explore` so you can `/clear` and still feed the same context into `/ww-plan`.

Typical structure:
- `## Active Summary (input for /ww-plan)` — compact, up-to-date snapshot
- `## Sessions` — append-only history (keep prior notes verbatim)

## Roadmap Linkage (Optional)

If `.ww-kit/ROADMAP.md` exists, `/ww-plan` may include a `## Roadmap Linkage` section in the plan file.
This makes milestone alignment explicit for `/ww-do` completion marking and `/ww-verify` roadmap gates.

**Example plan file:**

```markdown
# Implementation Plan: User Authentication

Branch: feature/user-authentication
Created: 2024-01-15

## Settings
- Testing: no
- Logging: verbose
- Docs: yes          # /ww-do shows mandatory docs checkpoint, then routes through /wws-docs

## Research Context (optional)
Source: .ww-kit/RESEARCH.md (Active Summary)
Goal: Add OAuth + email login
Constraints: Must support existing session middleware
Decisions: Use JWT for API auth
Open questions: Do we need refresh tokens?

## Commit Plan
- **Commit 1** (tasks 1-3): "feat: add user model and types"
- **Commit 2** (tasks 4-6): "feat: implement auth service"

## Tasks

### Phase 1: Setup
- [ ] Task 1: Create User model
- [ ] Task 2: Add auth types

### Phase 2: Implementation
- [x] Task 3: Implement registration
- [ ] Task 4: Implement login
```

## Self-Improvement Patches

ww-kit has a built-in learning loop. Every bug fix creates a **patch** — a structured knowledge artifact that helps AI avoid the same mistakes in the future.

```
/ww-fix → finds bug → fixes it → creates patch → /ww-evolve distills new patches into skill-context → smarter future runs
```

**How it works:**

1. `/ww-fix` fixes a bug and creates a patch file in `.ww-kit/patches/YYYY-MM-DD-HH.mm.md`
2. Each patch documents: **Problem**, **Root Cause**, **Solution**, **Prevention**, and **Tags**
3. `/ww-evolve` reads patches incrementally using `.ww-kit/evolutions/patch-cursor.json` (first run reads all)
4. Workflow skills (`/ww-do`, `/ww-fix`, `/ww-improve`) prefer skill-context rules and use only limited recent patch fallback when needed

**Example patch** (`.ww-kit/patches/2026-02-07-14.30.md`):

```markdown
# Null reference in UserProfile when user has no avatar

**Date:** 2026-02-07 14:30
**Files:** src/components/UserProfile.tsx
**Severity:** medium

## Problem
TypeError: Cannot read property 'url' of undefined when rendering UserProfile.

## Root Cause
`user.avatar` is optional in DB but accessed without null check.

## Solution
Added optional chaining: `user.avatar?.url` with fallback.

## Prevention
- Always null-check optional DB fields in UI
- Add "empty state" test cases

## Tags
`#null-check` `#react` `#optional-field`
```

The more you use `/ww-fix`, the smarter AI becomes on your project. Patches accumulate and create a project-specific knowledge base.

**Periodic evolution** -- run `/ww-evolve` to analyze new patches and automatically improve skills:

```
/ww-evolve      # Analyze patches + project → improve all skills
```

This closes the full learning loop: **fix → patch → evolve → better skills → fewer bugs → smarter fixes**.

## Skill Acquisition Strategy

ww-kit follows this strategy for skills:

```
For each recommended skill:
  1. Search skills.sh: npx skills search <name>
  2. If found → Install: npx skills install --agent <agent> <name>
  3. Security scan → python3 security-scan.py <path>
     - BLOCKED? → remove, warn user, skip
     - WARNINGS? → show to user, ask confirmation
  4. If not found → Generate: /wws-skill <name>
  5. Has reference docs? → Learn: /wws-skill <url1> [url2]...
```

**Never reinvent existing skills** - always check skills.sh first. **Never trust external skills blindly** - always scan before use. When reference documentation is available, use **Learn Mode** to generate skills from real sources.

## See Also

- [Development Workflow](workflow.md) — how plan files fit into the development loop
- [Core Skills](skills.md) — full reference for `/ww-fix`, `/ww-evolve`, and other skills
- [Security](security.md) — how external skills are scanned before use
