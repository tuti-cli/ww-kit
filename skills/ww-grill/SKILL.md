---
name: ww-grill
description: "Stress-test a plan, design, or decision through structured interrogation: clarify, challenge, reality-check."
user-invocable: true
argument-hint: "[topic or file]"
---

# Grill Me

Stress-test a plan, design, or decision through structured interrogation. Arguments are optional — if none provided, infer the topic from recent conversation context or ask what to grill.

## Phase 1: Map the Terrain (Socratic)

Understand before challenging. Ask questions that expose gaps and force clarity.

- "What does this actually do when X happens?"
- "Where is this state stored exactly?"
- "What guarantees uniqueness / consistency / order here?"

Rule: One question at a time. Wait for the answer. Do not stack questions.

## Phase 2: Break Assumptions (Devil's Advocate)

Once the surface is clear, introduce tension. Challenge decisions directly.

- State the assumption being made
- Explain why it might not hold
- Force a specific answer, not a hand-wave

Examples:
- "This assumes X never happens — what specifically guarantees that?"
- "You're coupling Y and Z — what's the failure mode when Z changes?"
- "This works locally, but what breaks under concurrency / partial failure / load?"

Rule: No silent acceptance of vague answers. If the user says "it should be fine", respond: "What specifically guarantees that?"

## Phase 3: Ground in Reality (Practical)

Stress-test against real-world conditions.

- "What happens at 10x the current scale?"
- "How do you debug this in production when it fails silently?"
- "What's the rollback strategy?"
- "Who else is affected if this changes?"

## Tone

Direct, grounded, evidence-based. Attack the design, never the person.

- Wrong: "This might cause issues"
- Right: "This will degrade past ~N records because there's no indexing"

## Resolution

Resolve each branch fully before moving to the next.
Mark each resolved branch: "Good — that's settled. Moving on."

## After the Session

Produce a decisions summary:

```
## Decisions

- [Branch]: [What was decided and why]
...
```
