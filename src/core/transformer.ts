export interface TransformResult {
  targetDir: string;
  targetName: string;
  content: string;
}

export const WORKFLOW_SKILLS = new Set([
  'ww',
  'ww-commit',
  'ww-explore',
  'ww-fix',
  'ww-do',
  'ww-improve',
  'ww-plan',
  'ww-verify',
]);

export function extractFrontmatterName(content: string): string | null {
  const match = content.match(/^name:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

export function replaceFrontmatterName(content: string, newName: string): string {
  return content.replace(/^name:\s*.+$/m, `name: ${newName}`);
}

export function transform(skillName: string, content: string): TransformResult {
  return {
    targetDir: skillName,
    targetName: 'SKILL.md',
    content,
  };
}

export function getWelcomeMessage(): string[] {
  return [
    '1. Open Claude Code in this directory',
    '2. Run /ww to analyze project and generate project-relevant skills',
  ];
}
