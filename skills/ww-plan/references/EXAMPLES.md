# ww-plan Examples

## Argument Parsing

### Fast mode explicit

```text
/ww-plan fast Add product search API
-> mode=fast, description="Add product search API"
```

### Full mode explicit

```text
/ww-plan full Add user authentication with OAuth
-> mode=full, description="Add user authentication with OAuth"
```

### Full mode with description omitted (defaults from RESEARCH.md)

```text
/ww-plan full
-> mode=full
-> description defaults to .ww-kit/RESEARCH.md Active Summary Topic (if present)
```

### Full mode with parallel worktree

```text
/ww-plan full --parallel Add Stripe checkout
-> mode=full, parallel=true, description="Add Stripe checkout"
```

### List subcommand

```text
/ww-plan --list
-> show worktrees, STOP
```

### Cleanup subcommand

```text
/ww-plan --cleanup feature/user-auth
-> remove worktree, STOP
```

### No mode provided

```text
/ww-plan Add user authentication
-> ask mode interactively, description="Add user authentication"
```

### No mode + no description (defaults from RESEARCH.md)

```text
/ww-plan
-> ask mode interactively
-> description defaults to .ww-kit/RESEARCH.md Active Summary Topic (if present)
```

## Flow Scenarios

### Scenario 1: Fast mode

```text
/ww-plan fast Add product search API

-> mode=fast
-> Asks about tests (No)
-> Explores codebase
-> Creates 4 tasks
-> Saves plan to .ww-kit/PLAN.md
-> STOP
```

### Scenario 2: Full mode (normal)

```text
/ww-plan full Add user authentication with OAuth

-> mode=full
-> Quick reconnaissance
-> Branch: feature/user-authentication
-> If ROADMAP.md exists: asks about milestone linkage, user picks one (or skips)
-> Asks about tests (Yes), logging (Verbose), docs (Yes)
-> Creates branch
-> Explores codebase deeply
-> Creates 8 tasks with commit checkpoints
-> Saves plan to .ww-kit/plans/feature-user-authentication.md
-> STOP - user runs /ww-do when ready
```

### Scenario 3: Full mode (parallel)

```text
/ww-plan full --parallel Add Stripe checkout

-> mode=full, parallel=true
-> Quick reconnaissance
-> Branch: feature/stripe-checkout
-> If ROADMAP.md exists: asks about milestone linkage, user picks one (or skips)
-> Asks about tests (No), logging (Verbose), docs (No)
-> Creates worktree ../my-project-feature-stripe-checkout
-> Copies context files, cd into worktree
-> Explores codebase deeply
-> Creates 6 tasks
-> Saves plan to .ww-kit/plans/feature-stripe-checkout.md
-> Auto-invokes /ww-do (parallel = autonomous)
```

### Scenario 4: Interactive mode selection

```text
/ww-plan Add user authentication

-> No mode keyword found
-> Asks: Full (Recommended) or Fast?
-> User picks Full
-> Continues as full mode flow
```
