[← Development Workflow](workflow.md) · [Back to README](../README.md) · [Skill Evolution →](evolve.md)

# Core Skills

## Workflow Skills

These skills form the core development loop. See [Development Workflow](workflow.md) for the full diagram and how they connect.

### `/ww-explore [topic or plan name]`
Explore ideas, constraints, and trade-offs before planning:
```
/ww-explore real-time collaboration
/ww-explore the auth system is getting unwieldy
/ww-explore add-auth-system
```
- Uses a thinking-partner mode: open questions, option mapping, and ASCII visualization
- Reads project context from `.ww-kit/DESCRIPTION.md`, `ARCHITECTURE.md`, `RULES.md`, `.ww-kit/RESEARCH.md`, and active plan files when present
- Does **not** implement code in this mode; when direction is clear, move to `/ww-plan`
- Can optionally persist exploration context to `.ww-kit/RESEARCH.md` so you can `/clear` and still feed results into `/ww-plan`
- Best when the problem is still fuzzy: requirements unclear, trade-offs unresolved, or you want to inspect the codebase before choosing a direction

### `/ww-plan [fast|full] <description>`
Plans implementation for a feature or task:
```
/ww-plan Add user authentication with OAuth       # Asks which mode
/ww-plan fast Add product search API              # Quick plan, no branch
/ww-plan full Add user authentication with OAuth  # Git branch + full plan
```

Two modes:
- **Fast** — no git branch, saves plan to `.ww-kit/PLAN.md`, asks fewer questions
- **Full** — creates git branch (`feature/user-authentication`), asks about testing/logging/docs policy, saves plan to `.ww-kit/plans/<branch>.md`

Both modes explore your codebase for patterns, create tasks with dependencies, and include commit checkpoints for 5+ tasks.

If `.ww-kit/RESEARCH.md` exists, `/ww-plan` reads the `Active Summary` and includes it as `Research Context` in the plan.

If `.ww-kit/ROADMAP.md` exists, `/ww-plan` may also capture a `Roadmap Linkage` section (milestone name + brief rationale) to make milestone alignment explicit.

**Parallel mode** — work on multiple features simultaneously using `git worktree`:
```
/ww-plan full --parallel Add Stripe checkout
```
- Creates a separate working directory (`../my-project-feature-stripe-checkout`)
- Copies AI context files (`.ww-kit/`, `.claude/`, `CLAUDE.md`)
- Each feature gets its own Claude Code session — no branch switching, no conflicts

**Manage parallel features:**
```
/ww-plan --list                          # Show all active worktrees
/ww-plan --cleanup feature/stripe-checkout # Remove worktree and branch
```

### `/wws-roadmap [check | vision or requirements]`
Creates or updates a strategic project roadmap:
```
/wws-roadmap                              # Analyze project and create roadmap
/wws-roadmap SaaS for project management  # Create roadmap from vision
/wws-roadmap                              # Update existing roadmap (interactive)
/wws-roadmap check                        # Auto-scan codebase, mark done milestones
```
- Reads `.ww-kit/DESCRIPTION.md` + `ARCHITECTURE.md` for context
- **First run** — explores codebase, asks for major goals, generates `.ww-kit/ROADMAP.md`
- **Subsequent runs** — review progress, add milestones, reprioritize, mark completed
- **`check`** — automated progress scan: analyzes codebase for evidence of completed milestones, reports done/partial/not started, marks completed with confirmation
- Milestones are high-level goals (not granular tasks — that's `/ww-plan`)
- `/ww-do` automatically marks roadmap milestones done when work completes

### `/ww-improve [--list] [@plan-file] [prompt]`
Refine an existing plan with a second iteration:
```
/ww-improve                                    # Auto-review: find gaps, missing tasks, wrong deps
/ww-improve --list                             # Show available plans only (no refinement)
/ww-improve @my-custom-plan.md                 # Improve an explicit plan file
/ww-improve добавь валидацию и обработку ошибок # Improve based on specific feedback
```
- Plan source priority: `@plan-file` argument, then branch-based `.ww-kit/plans/<branch>.md`, then `.ww-kit/PLAN.md`, then `.ww-kit/FIX_PLAN.md`
- `--list` mode is read-only: shows available plan files and exits
- Performs deeper codebase analysis than the initial `/ww-plan` planning
- Finds missing tasks (migrations, configs, middleware)
- Fixes task dependencies and descriptions
- Removes redundant tasks
- Shows improvement report and asks for approval before applying
- If no plan found — suggests running `/ww-plan` (feature/task) or `/ww-fix` (bugfix) first

### `/ww-loop [new|resume|status|stop|list|history|clean] [task or alias]`
Runs a strict iterative Reflex Loop with phase-based execution and quality gates:
```
/ww-loop new OpenAPI 3.1 spec + DDD notes + JSON examples
/ww-loop resume
/ww-loop status
/ww-loop stop
/ww-loop list
/ww-loop history courses-api-ddd
/ww-loop clean courses-api-ddd
```
- Uses 6 phases: PLAN -> PRODUCE||PREPARE -> EVALUATE -> CRITIQUE -> REFINE (PRODUCE and PREPARE run in parallel)
- Evaluation uses weighted rules with score formula and severity levels (`fail`, `warn`, `info`)
- Persists state between sessions in `.ww-kit/evolution/`:
  - `current.json` (active loop pointer to current run)
  - `<alias>/run.json` (single source of truth for current state)
  - `<alias>/history.jsonl` (append-only event log)
  - `<alias>/artifact.md` (latest artifact output)
- `list` shows all loop runs, `history` shows event timeline, `clean` removes stopped/completed/failed loop runs
- Default `max_iterations` is `4`
- Before iteration 1, always explicitly confirms success criteria and max iterations with the user (even if already provided in task text)
- Stops on threshold reached, no major issues, iteration limit, stagnation, or explicit user stop
- If stopped by `iteration_limit` with unmet criteria, final summary includes distance-to-success (threshold gap + remaining fail-rule blockers)
- Full protocol and schemas: [Reflex Loop](loop.md)

### `/ww-do`
Executes the plan:
```
/ww-do        # Continue from where you left off
/ww-do --list # Show available plans only (no execution)
/ww-do @my-custom-plan.md # Execute using an explicit plan file
/ww-do 5      # Start from task #5
/ww-do status # Check progress
```
- **Reads skill-context first** (`.ww-kit/skill-context/ww-do/SKILL.md`) and only uses limited recent patch fallback when needed
- Finds plan file (`@plan-file` if provided; otherwise branch-based `.ww-kit/plans/<branch>.md`, then `.ww-kit/PLAN.md`, then `.ww-kit/FIX_PLAN.md` → redirects to `/ww-fix`)
- `--list` mode is read-only: shows available plan files and exits
- Executes tasks one by one
- Prompts for commits at checkpoints
- Docs policy after completion:
  - `Docs: yes` → mandatory documentation checkpoint (update docs / create feature page / skip)
  - `Docs: no` or unset → `WARN [docs]` only (no mandatory checkpoint)
  - Docs updates are always routed through `/wws-docs`
- Offers to delete .ww-kit/PLAN.md when done

### `/ww-verify [--strict]`
Verifies completed implementation against the plan:
```
/ww-verify          # Check all tasks were fully implemented
/ww-verify --strict # Strict mode — zero tolerance before merge
```

**Optional step after `/ww-do`** — when implementation finishes, you'll be asked if you want to verify.

- **Task completion audit** — goes through every task in the plan, uses `Glob`/`Grep`/`Read` to confirm the code actually implements each requirement. Reports `COMPLETE`, `PARTIAL`, or `NOT FOUND` per task
- **Build & test check** — runs the project's build command, test suite, and linters on changed files
- **Consistency checks** — searches for leftover `TODO`/`FIXME`/`HACK`, undocumented environment variables, missing dependencies, plan-vs-code naming drift
- **Context gates (read-only)** — checks architecture/roadmap/rules alignment before final status; missing optional roadmap/rules files are warnings
- **Issue remediation** — if issues found, first suggests `/ww-fix <issue summary>` (recommended), with optional direct fix in-session
- **Follow-up suggestions** — if all green, suggests `/wws-security`, `/ww-review`, then `/ww-commit`

**Strict mode** (`--strict`) is recommended before merging: requires all tasks complete, build passing, tests passing, lint clean, zero TODOs in changed files, and passing architecture/rules/roadmap gates. For `feat`/`fix`/`perf`, missing roadmap milestone linkage is reported as a warning, not a failure.

### `/ww-fix [bug description]`
Bug fix with optional plan-first mode:
```
/ww-fix TypeError: Cannot read property 'name' of undefined
```
- Asks to choose mode: **Fix now** (immediate) or **Plan first** (review before fixing)
- Investigates codebase to find root cause
- Applies fix WITH logging (`[FIX]` prefix for easy filtering)
- Suggests test coverage for the bug
- Creates a **self-improvement patch** in `.ww-kit/patches/`

**Plan-first mode** — for complex bugs or when you want to review the approach:
```
/ww-fix Something is broken    # Choose "Plan first" when asked
```
- Investigates the codebase, creates `.ww-kit/FIX_PLAN.md` with analysis, fix steps, risks
- Stops after creating the plan — you review it at your own pace
- When ready, run without arguments to execute the plan:
```
/ww-fix                        # Detects FIX_PLAN.md, executes the fix, deletes the plan
```

### `/ww-evolve [skill-name|"all"]`
Self-improve skills based on project experience:
```
/ww-evolve          # Evolve all skills
/ww-evolve fix      # Evolve only /ww-fix skill
/ww-evolve all      # Evolve all skills
```
- Reads patches incrementally from `.ww-kit/patches/` using `.ww-kit/evolutions/patch-cursor.json` (first run reads all)
- Analyzes project tech stack, conventions, and codebase patterns
- Identifies gaps in existing skills (missing guards, tech-specific pitfalls)
- Proposes targeted improvements with user approval
- Writes project-specific overrides to `.ww-kit/skill-context/<skill>/SKILL.md` (skills treat these as higher-priority rules)
- Saves evolution log to `.ww-kit/evolutions/`
- The more `/ww-fix` patches you accumulate, the smarter `/ww-evolve` becomes

---

## Utility Skills

### `/ww`
Analyzes your project and sets up context:
- Scans project files to understand the codebase
- Searches [skills.sh](https://skills.sh) for relevant skills
- Generates custom skills via `/wws-skill`
- Configures MCP servers
- Generates architecture document via `/ww-arch`

When called with a description:
```
/ww project management tool with GitHub integration
```
- Creates `.ww-kit/DESCRIPTION.md` with enhanced project specification
- Creates `.ww-kit/ARCHITECTURE.md` with architecture decisions and guidelines
- Transforms your idea into a structured, professional description

**Does NOT implement your project** - only sets up context.

### `/ww-grounded <question or task>`
Reliability gate that prevents guessing:
```
/ww-grounded Explain how feature flags work in this codebase
/ww-grounded Update dependencies to the latest secure versions (no assumptions)
```
- Only provides a final answer if confidence is **100/100** based on evidence (repo files, command output, provided docs)
- If confidence is < 100, returns **INSUFFICIENT INFORMATION** with a concrete checklist of what’s needed to reach 100
- Forces verification for changeable facts (“latest”, “current”, version-specific behavior)
- Best when the task is already clear but the answer must be strictly verified: high-stakes questions, version-sensitive facts, or any prompt that says “no assumptions”

#### `/ww-explore` vs `/ww-grounded`

| Skill | Use it for | Output style | If things are unclear |
|-------|------------|--------------|------------------------|
| `/ww-explore` | discovery, requirement shaping, trade-off discussion, repo investigation before planning | open-ended thinking partner | keeps exploring, reframing, and comparing options |
| `/ww-grounded` | evidence-only answers, strict verification, high-stakes or changeable facts | confidence-gated answer with explicit evidence | stops and returns `INSUFFICIENT INFORMATION` |

Typical sequence when both are useful:
1. `/ww-explore` — figure out what problem you are really solving.
2. `/ww-grounded` — verify the important claims or current-state facts.
3. `/ww-plan` — turn the clarified, verified direction into executable tasks.

For the workflow view of where these fit, see [Development Workflow](workflow.md).

### `/ww-arch [clean|ddd|microservices|monolith|layers]`
Generates architecture guidelines tailored to your project:
```
/ww-arch           # Analyze project and recommend
/ww-arch clean     # Use Clean Architecture
/ww-arch monolith  # Use Modular Monolith
```
- Reads `.ww-kit/DESCRIPTION.md` for project context
- Recommends architecture pattern based on team size, domain complexity, and tech stack
- Generates `.ww-kit/ARCHITECTURE.md` with folder structure, dependency rules, code examples
- All examples adapted to your project's language and framework
- Called automatically by `/ww` during setup, but can also be used standalone

### `/wws-docs [--web]`
Generates and maintains project documentation:
```
/wws-docs          # Generate or improve documentation
/wws-docs --web    # Also generate HTML version in docs-html/
```

**Smart detection** — adapts to your project's current state:
- **No README?** — analyzes your codebase and creates a lean README (~100 lines) as a landing page + `docs/` directory with topic pages
- **Long README?** — proposes splitting into a landing-page README with detailed content moved to `docs/`
- **Docs exist?** — audits for stale content, broken links, missing topics, and outdated formatting

**Scattered .md cleanup** — finds loose markdown files in your project root (CONTRIBUTING.md, ARCHITECTURE.md, SETUP.md, DEPLOYMENT.md, etc.) and proposes consolidating them into a structured `docs/` directory. No more documentation scattered across 10 root-level files.

**Stays in sync with your code** — when `/ww-plan full` asks for docs policy and you choose `Docs: yes`, `/ww-do` shows a mandatory docs checkpoint and routes changes through `/wws-docs`. If `Docs: no` (or unset), `/ww-do` emits `WARN [docs]` so potential drift is visible without blocking the flow.

**Documentation website** — `--web` flag generates a complete static HTML site in `docs-html/` with navigation bar, dark mode support, and clean typography. Ready to host on GitHub Pages or any static hosting.

**Quality checks:**
- Every docs/ page gets prev/next navigation header + "See Also" cross-links
- Technical review — verifies links, structure, code examples, no content loss
- Readability review — "new user eyes" checklist: is it clear, scannable, jargon-free?

### `/wws-docker [--audit]`
Generates, enhances, or audits Docker configuration for your project:
```
/wws-docker          # Auto-detect mode based on existing files
/wws-docker --audit  # Force audit mode on existing Docker files
```

**Three modes** (auto-detected):
1. **Generate** — no Docker files exist → interactive setup (choose DB, reverse proxy, cache), then create everything from scratch
2. **Enhance** — only local Docker exists (no production files) → audit & improve local, then create production config with deploy scripts
3. **Audit** — full Docker setup exists → run security checklist, fix gaps, add missing best practices

**Generated file structure:**
- Root: `Dockerfile`, `compose.yml`, `compose.override.yml`, `compose.production.yml`, `.dockerignore`, `.env.example` — only files Docker expects by convention
- `docker/` — service configs (angie/, postgres/, php/, redis/) — only directories that are needed
- `deploy/scripts/` — 6 production ops scripts: deploy, update, logs, health-check, rollback, backup (with tiered retention)

**Interactive setup** — when generating from scratch, asks about infrastructure: database (PostgreSQL, MySQL, MongoDB), reverse proxy (Angie preferred over Nginx, Traefik), cache (Redis, Memcached), queue (RabbitMQ).

**Security audit** — production checklist (OWASP Docker Security Cheat Sheet):
- Container isolation (read-only, no-new-privileges, cap_drop, non-root, tmpfs)
- Port exposure (no ports on infrastructure in prod, only proxy exposes 80/443)
- Network security (internal backend, no host networking, no Docker socket)
- Health checks on every service, log rotation, stdout/stderr logging
- Resource limits (CPU, memory, PIDs), secrets management, image pinning
- Over-engineering check (don't add services the code doesn't use)

After completion, suggests `/wws-build` and `/wws-docs`.

Supports Go, Node.js, Python, and PHP with framework-specific configurations.

### `/wws-build [makefile|taskfile|justfile|mage]`
Generates or enhances build automation files:
```
/wws-build              # Auto-detect or ask which tool
/wws-build makefile     # Generate a Makefile
/wws-build taskfile     # Generate a Taskfile.yml
/wws-build justfile     # Generate a justfile
/wws-build mage         # Generate a magefile.go
```

**Two modes — generate or enhance:**
- **No build file exists?** — analyzes your project (language, framework, package manager, Docker, DB, linters) and generates a complete, best-practice build file from scratch
- **Build file already exists?** — scans for gaps (missing targets, no help command, no Docker targets despite Dockerfile, missing preamble) and enhances it surgically, preserving your existing structure

**Docker-aware** — when Dockerfile or docker-compose is detected:
- Generates container lifecycle targets (`docker-build`, `docker-push`, `docker-logs`)
- Separates dev vs production (`docker-dev`, `docker-prod-build`)
- Adds `infra-up`/`infra-down` for dependency services (postgres, redis)
- Creates container-exec variants (`docker-test`, `docker-lint`, `docker-shell`) for Docker-first projects

**Post-generation integration:**
- Updates README and existing docs with quick command reference
- Suggests creating `AGENTS.md` with build commands for AI agents
- Finds and updates any markdown files that already list project commands

Supports Go, Node.js, Python, and PHP with framework-specific targets (Laravel artisan, Next.js, FastAPI, etc.).

### `/wws-ci [github|gitlab] [--enhance]`
Generates, enhances, or audits CI/CD pipeline configuration:
```
/wws-ci                   # Auto-detect platform and mode
/wws-ci github            # Generate GitHub Actions workflow
/wws-ci gitlab            # Generate GitLab CI pipeline
/wws-ci --enhance         # Force enhance mode on existing CI
```

**Three modes** (auto-detected):
1. **Generate** — no CI config exists → asks which platform (GitHub/GitLab), optional features (security, coverage, matrix), then creates pipeline from scratch
2. **Enhance** — CI exists but incomplete → analyzes gaps (missing lint/SA/security jobs), adds missing jobs
3. **Audit** — full CI setup exists → audits against best practices, reports issues, fixes gaps

**One workflow per concern** — separate files, not a monolith:
- `lint.yml` — code-style, static analysis, rector (PHPStan, ESLint, Clippy, golangci-lint)
- `tests.yml` — test suite with optional matrix builds and service containers
- `build.yml` — compilation/bundling verification
- `security.yml` — dependency audit + dependency review (composer audit, govulncheck, cargo deny)

**Per-language tools detected automatically:**
- **PHP**: PHP-CS-Fixer/Pint/PHPCS, PHPStan/Psalm, Rector, PHPUnit/Pest
- **Python**: Ruff/Black+isort+Flake8, mypy, pytest, bandit (supports both uv and pip)
- **Node.js/TypeScript**: ESLint/Prettier/Biome, tsc, Jest/Vitest
- **Go**: golangci-lint, go test, govulncheck
- **Rust**: cargo fmt, clippy, cargo test, cargo audit/deny
- **Java**: Checkstyle/PMD/SpotBugs, JUnit, OWASP (Maven and Gradle)

**CI best practices** built-in:
- Concurrency groups, `fail-fast: false`, dependency caching per language
- GitLab: `policy: pull` on downstream jobs, codequality/junit report integration, DAG with `needs:`
- GitHub: explicit `permissions`, `actions/dependency-review-action` for PR security
- Service containers (PostgreSQL, Redis) when tests need external dependencies

After completion, suggests `/wws-build` and `/wws-docker`.

### `/ww-rules [rule text]`
Adds project-specific rules and conventions:
```
/ww-rules Always use DTO instead of arrays
/ww-rules                                    # Interactive — asks what to add
```
- Rules are saved to `.ww-kit/RULES.md`
- Each invocation appends a new rule
- Rules are automatically loaded by `/ww-do` before task execution
- Use for coding conventions, naming rules, architectural constraints

### `/ww-commit`
Creates conventional commits:
- Analyzes staged changes
- Generates meaningful commit message
- Follows conventional commits format
- Runs read-only architecture/roadmap/rules gate checks before commit proposal
- Warning-first by default (no implicit strict mode)
- For `feat`/`fix`/`perf`, warns when roadmap milestone linkage is missing

### `/ww-review [PR number or URL]`
Reviews staged changes or PR diffs:
```
/ww-review
/ww-review 123
/ww-review https://github.com/org/repo/pull/123
```
- Checks correctness, security, performance, and maintainability
- Adds read-only context-gate findings (architecture/roadmap/rules) to review output
- Uses `WARN` for non-blocking context drift and `ERROR` only for explicitly blocking review criteria

### `/ww-reference <url|path> [url2|path2] [--name <ref-name>] [--update]`
Creates knowledge references from external sources for AI agents:
```
/ww-reference https://zod.dev --name zod-validation
/ww-reference https://docs.astro.build/en/getting-started/ https://docs.astro.build/en/guides/content-collections/
/ww-reference ./docs/api-spec.yaml --name internal-api
/ww-reference --update --name zod-validation
/ww-reference list
/ww-reference show zod-validation
```
- Fetches URLs (with automatic sub-page crawling, up to 8 pages per source), processes local files, or searches the web interactively
- Synthesizes structured reference documents: overview, core concepts, API/interface, usage patterns, configuration, best practices, pitfalls
- Saves to `.ww-kit/references/<name>.md` with source attribution and timestamps
- Maintains an index in `.ww-kit/references/INDEX.md`
- `--update` re-fetches sources and refreshes an existing reference
- `list` / `show <name>` / `delete <name>` for managing existing references
- References are available to all ww-kit skills — `/ww-plan`, `/ww-do`, `/ww-grounded` can read them for domain context
- Best when AI needs knowledge it wasn't trained on: new libraries, internal APIs, project-specific specs, or rapidly changing documentation

### `/wws-skill`
Generates new skills:
```
/wws-skill project-api
```
- Creates SKILL.md with proper frontmatter
- Follows [Agent Skills](https://agentskills.io) specification
- Can include references, scripts, templates

**Learn Mode** — pass URLs to generate skills from real documentation:
```
/wws-skill https://docs.example.com/tutorial/
/wws-skill https://docs.example.com/guide https://docs.example.com/reference
/wws-skill my-skill https://docs.example.com/api
```
- Fetches and deeply studies each URL
- Enriches with web search for best practices and pitfalls
- Synthesizes a structured knowledge base
- Generates a complete skill package with references from real sources
- Supports multiple URLs, mixed sources (docs + blogs), and optional skill name hint

### `/wws-security [category]`
Security audit based on OWASP Top 10 and best practices:
```
/wws-security                  # Full audit
/wws-security auth             # Authentication & sessions
/wws-security injection        # SQL/NoSQL/Command injection
/wws-security xss              # Cross-site scripting
/wws-security csrf             # CSRF protection
/wws-security secrets          # Secrets & credentials
/wws-security api              # API security
/wws-security infra            # Infrastructure & headers
/wws-security prompt-injection # LLM prompt injection
/wws-security race-condition   # Race conditions & TOCTOU
```

Each category includes a checklist, vulnerable/safe code examples (TypeScript, PHP), and an automated audit script.

**Ignoring items** — if a finding is intentionally accepted, mark it as ignored:
```
/wws-security ignore no-csrf
```
- Asks for a reason, saves to `.ww-kit/SECURITY.md`
- Future audits skip these items but still show them in an **"Ignored Items"** section for transparency
- Review ignored items periodically — risks change over time

## See Also

- [Development Workflow](workflow.md) — how workflow skills connect end-to-end
- [Reflex Loop](loop.md) — strict loop protocol for iterative quality gating
- [Plan Files](plan-files.md) — where workflow artifacts are stored
