export interface AgentConfig {
  id: string;
  displayName: string;
  configDir: string;
  skillsDir: string;
  subagentsDir: string;
  settingsFile: string;
  supportsMcp: boolean;
}

const CLAUDE_CONFIG: AgentConfig = {
  id: 'claude',
  displayName: 'Claude Code',
  configDir: '.claude',
  skillsDir: '.claude/skills',
  subagentsDir: '.claude/agents',
  settingsFile: '.mcp.json',
  supportsMcp: true,
};

export function getAgentConfig(): AgentConfig {
  return CLAUDE_CONFIG;
}
