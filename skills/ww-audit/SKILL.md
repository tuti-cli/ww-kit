---
name: ww-audit
description: "Analyze codebase health: dependencies, code quality, test coverage, security, and tech debt."
user-invocable: true
argument-hint: "[--legacy | --debt-only]"
---

# Audit

Analyze codebase health, dependencies, quality, and security.

## Usage

- `/ww-audit` — standard health check
- `/ww-audit --legacy` — deep legacy analysis for migration planning
- `/ww-audit --debt-only` — update TECH-DEBT.md from existing AUDIT.md

## Standard Mode

### 1. Dependency Scan
- Check for outdated packages
- Check for known vulnerabilities
- List abandoned/unmaintained dependencies

### 2. Code Quality
- Run lint and report issues
- Check file sizes (flag files over 300 lines)
- Detect code duplication patterns

### 3. Test Coverage
- Run test suite with coverage if available
- Report coverage percentages
- Flag uncovered critical paths

### 4. Security Findings
- Check for hardcoded secrets
- Check for SQL injection patterns
- Check for XSS vulnerabilities
- Check dependency vulnerabilities

### 5. Write Report
- Write `.ww-kit/AUDIT.md` with findings
- Write `.ww-kit/TECH-DEBT.md` with prioritized items grouped by severity

## Legacy Mode (--legacy)

Everything in standard, plus:

### EOL Detection
- Identify end-of-life dependencies
- Flag deprecated language features
- Detect abandoned packages

### Migration Assessment
- Identify upgrade paths for major dependencies
- Estimate migration complexity per dependency
- Flag breaking changes

### Pattern Detection
- Find deprecated coding patterns
- Identify anti-patterns specific to stack
- List modernization opportunities

## Debt Only Mode (--debt-only)

1. Read existing `.ww-kit/AUDIT.md`
2. Convert findings to prioritized `.ww-kit/TECH-DEBT.md`
3. Group by: critical / high / medium / low

## Report Format

### AUDIT.md
```markdown
# Codebase Audit — [date]

## Summary
[Overall health score and key findings]

## Dependencies
[Outdated, vulnerable, abandoned]

## Code Quality
[Lint issues, large files, duplication]

## Test Coverage
[Coverage stats, uncovered areas]

## Security
[Vulnerabilities found]

## Recommendations
[Prioritized action items]
```

### TECH-DEBT.md
```markdown
# Tech Debt Registry

## Critical
- [Item]: [impact] — [effort estimate]

## High
- [Item]: [impact] — [effort estimate]

## Medium
- [Item]: [impact] — [effort estimate]

## Low
- [Item]: [impact] — [effort estimate]
```
