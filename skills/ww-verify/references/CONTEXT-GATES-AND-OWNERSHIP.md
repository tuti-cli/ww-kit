# Context Gates and Artifact Ownership Contract

Canonical contract for ww-kit workflow commands. This file defines:
- which command owns each artifact,
- which commands consume artifacts as read-only context,
- and how context gates behave in normal vs strict verification.

## Command-to-Artifact Matrix

| Command            | Primary write ownership                                                                                  | Read-only context                                                                                                                                     | Approved exceptions                                                                                                                                                   |
|--------------------|----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ww`              | `.ww-kit/DESCRIPTION.md`, `AGENTS.md` (setup map), skill installation and MCP config                 | Existing project files and context artifacts                                                                                                          | May invoke `ww-arch` to create/update `.ww-kit/ARCHITECTURE.md` during setup                                                                             |
| `ww-arch` | `.ww-kit/ARCHITECTURE.md`                                                                            | `.ww-kit/DESCRIPTION.md`                                                                                                                          | May update `DESCRIPTION.md` architecture pointer and `AGENTS.md` context table                                                                                        |
| `wws-roadmap`      | `.ww-kit/ROADMAP.md`                                                                                 | `.ww-kit/DESCRIPTION.md`, `.ww-kit/ARCHITECTURE.md`                                                                                           | `ww-do` may mark completed milestones after implementation                                                                                                    |
| `ww-rules`        | `.ww-kit/RULES.md`                                                                                   | Existing project context                                                                                                                              | None                                                                                                                                                                  |
| `ww-plan`         | `.ww-kit/PLAN.md`, `.ww-kit/plans/<branch>.md`                                                   | `.ww-kit/DESCRIPTION.md`, `.ww-kit/ARCHITECTURE.md`, `.ww-kit/RESEARCH.md`                                                                | `ww-improve` may refine existing plan files                                                                                                                          |
| `ww-do`    | Plan progress updates (checkboxes/task status)                                                           | `.ww-kit/RULES.md`, `.ww-kit/ARCHITECTURE.md`, `.ww-kit/DESCRIPTION.md`, `.ww-kit/skill-context/*`, limited recent patches (fallback) | May update `.ww-kit/DESCRIPTION.md` and `.ww-kit/ARCHITECTURE.md` only when stack/structure changed; may update `.ww-kit/ROADMAP.md` milestone completion |
| `ww-fix`          | `.ww-kit/FIX_PLAN.md` (plan mode), `.ww-kit/patches/*.md`                                        | `.ww-kit/DESCRIPTION.md`, `.ww-kit/skill-context/*`, limited recent patches (fallback)                                                       | None (context artifacts remain read-only by default)                                                                                                                  |
| `ww-evolve`       | `.ww-kit/evolutions/*.md`, `.ww-kit/evolutions/patch-cursor.json`, `.ww-kit/skill-context/*` | `.ww-kit/DESCRIPTION.md`, `.ww-kit/patches/*.md` (processed incrementally)                                                                    | None                                                                                                                                                                  |
| `wws-docs`         | `README.md`, `docs/*`, `AGENTS.md` documentation section                                                 | Project/context files for factual docs                                                                                                                | None                                                                                                                                                                  |
| `ww-explore`      | `.ww-kit/RESEARCH.md` only                                                                           | All context and codebase files for analysis                                                                                                           | None                                                                                                                                                                  |
| `ww-commit`       | Git commit object/message only                                                                           | Context artifacts are read-only gates                                                                                                                 | No context artifact writes by default                                                                                                                                 |
| `ww-review`       | Review output/comments only                                                                              | Context artifacts are read-only gates                                                                                                                 | No context artifact writes by default unless user explicitly asks                                                                                                     |
| `ww-verify`       | Verification report output                                                                               | Context artifacts are read-only gates                                                                                                                 | May move to fix flow after user confirmation; no default context artifact writes                                                                                      |

## Artifact Update Policy (Recommended)

- **Owner writes only:** An artifact should be updated by its owner command.
- **Implement may do factual deltas:** `ww-do` may update `.ww-kit/DESCRIPTION.md` and `.ww-kit/ARCHITECTURE.md` only when implementation materially changed stack/structure; it may mark roadmap milestones complete when evidence is clear.
- **Verify stays read-only:** `ww-verify` reports drift and suggests owner commands; it does not update context artifacts by default.
- **Rules are explicit:** Only `ww-rules` edits `.ww-kit/RULES.md`. Other commands may propose candidate rules and instruct the user to run `/ww-rules`.

## Context Gates (commit/review/verify)

These commands evaluate context consistency against:
- `.ww-kit/ARCHITECTURE.md`
- `.ww-kit/ROADMAP.md` (optional, graceful if missing)
- `.ww-kit/RULES.md` (optional, graceful if missing)

Gate outputs must use:
- `WARN` for non-blocking mismatches or missing optional files
- `ERROR` for blocking violations

### Architecture Gate
- **Pass:** Changes follow documented module/layer boundaries.
- **Warn:** Architecture document appears stale or mapping is ambiguous.
- **Fail:** Clear boundary/dependency violation against explicit architecture rules.

### Rules Gate
- **Pass:** Changes comply with explicit project rules.
- **Warn:** Rule relevance is uncertain or cannot be verified confidently.
- **Fail:** Clear violation of an explicit rule in `.ww-kit/RULES.md`.

### Roadmap Gate
- **Pass:** Changes align with an active milestone or approved roadmap direction.
- **Warn:** `.ww-kit/ROADMAP.md` missing, ambiguous milestone mapping, or no milestone linkage for `feat`/`fix`/`perf` work.
- **Fail (strict verify only):** Clear mismatch with roadmap direction after all available roadmap context is considered.

## Threshold Decisions (Resolved)

### Verify normal mode
- Architecture/rules clear violations: **fail**
- Roadmap mismatch: **warn** unless contradiction is explicit and severe
- Missing milestone linkage for `feat`/`fix`/`perf`: **warn**

### Verify strict mode
- Architecture clear violations: **fail**
- Rules clear violations: **fail**
- Roadmap clear mismatch: **fail**
- Missing milestone linkage for `feat`/`fix`/`perf` when `.ww-kit/ROADMAP.md` exists: **warn**

### Commit and review mode
- Context gates are read-only and non-destructive.
- Missing roadmap linkage for `feat`/`fix`/`perf`: **warn** by default.
- Blocking behavior is only allowed when explicitly requested by the user or policy extension.
