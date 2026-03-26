const SKILL_HINTS: Record<string, string> = {
    'ww': 'Set up AI context',
    'ww-arch': 'Architecture decisions and ADRs',
    'ww-commit': 'Conventional commit helper',
    'ww-do': 'Execute current plan tasks',
    'ww-evolve': 'Evolve skills from patches',
    'ww-explore': 'Explore ideas and options',
    'ww-fix': 'Fix specific bugs quickly',
    'ww-grounded': 'Reliability gate (no guesses)',
    'ww-improve': 'Improve existing plan quality',
    'ww-loop': 'Iterative quality refinement loop',
    'ww-plan': 'Plan tasks for feature',
    'ww-reference': 'Create knowledge refs from URLs/docs',
    'ww-review': 'Review staged changes/PR',
    'ww-rules': 'Project rules and conventions',
    'ww-verify': 'Verify implementation completeness',
    'wws-best-practices': 'Clean code guidelines',
    'wws-build': 'Build file automation',
    'wws-ci': 'CI/CD pipeline setup',
    'wws-docker': 'Docker and Compose setup',
    'wws-docs': 'Docs generation and maintenance',
    'wws-roadmap': 'Roadmap and milestones',
    'wws-security': 'Security audit checklist',
    'wws-skill': 'Generate new agent skills',
};

const DEFAULT_SKILL_HINT = 'Additional custom skill';
const DEFAULT_HINT_MAX_LENGTH = 44;

function truncateHint(hint: string, maxLength: number): string {
    if (hint.length <= maxLength) {
        return hint;
    }

    const base = hint.slice(0, Math.max(0, maxLength - 3)).trimEnd();
    return `${base}...`;
}

export function getSkillHint(skillId: string): string {
    return SKILL_HINTS[skillId] ?? DEFAULT_SKILL_HINT;
}

export function formatSkillChoiceName(
    skillId: string,
    renderHint: (hint: string) => string,
    maxHintLength: number = DEFAULT_HINT_MAX_LENGTH,
): string {
    const hint = truncateHint(getSkillHint(skillId), maxHintLength);
    return `${skillId} ${renderHint(`- ${hint}`)}`;
}
