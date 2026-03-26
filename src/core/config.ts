import path from 'path';
import { createRequire } from 'module';
import { readJsonFile, writeJsonFile, fileExists } from '../utils/fs.js';
import { getAgentConfig } from './agents.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export interface McpConfig {
  github: boolean;
  filesystem: boolean;
  postgres: boolean;
  chromeDevtools: boolean;
  playwright: boolean;
}

export interface ManagedArtifactState {
  sourceHash: string;
  installedHash: string;
}

export interface AgentInstallation {
  id: string;
  skillsDir: string;
  installedSkills: string[];
  managedSkills?: Record<string, ManagedArtifactState>;
  subagentsDir?: string;
  installedSubagents?: string[];
  managedSubagents?: Record<string, ManagedArtifactState>;
  mcp: McpConfig;
}

export interface ExtensionRecord {
  name: string;
  source: string;
  version: string;
  replacedSkills?: string[];
}

export interface AppConfig {
  version: string;
  agents: AgentInstallation[];
  extensions?: ExtensionRecord[];
}

interface LegacyConfig {
  version?: string;
  agent?: string;
  skillsDir?: string;
  installedSkills?: string[];
  mcp?: Partial<McpConfig>;
}

const CONFIG_FILENAME = '.ww-kit.json';
const CURRENT_VERSION: string = pkg.version;

function getConfigPath(projectDir: string): string {
  return path.join(projectDir, CONFIG_FILENAME);
}

function normalizeMcp(mcp?: Partial<McpConfig>): McpConfig {
  return {
    github: mcp?.github ?? false,
    filesystem: mcp?.filesystem ?? false,
    postgres: mcp?.postgres ?? false,
    chromeDevtools: mcp?.chromeDevtools ?? false,
    playwright: mcp?.playwright ?? false,
  };
}

function normalizeManagedArtifacts(raw: unknown): Record<string, ManagedArtifactState> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const result: Record<string, ManagedArtifactState> = {};

  for (const [skillName, state] of Object.entries(raw as Record<string, unknown>)) {
    if (!skillName || typeof state !== 'object' || !state) {
      continue;
    }

    const sourceHash = (state as { sourceHash?: unknown }).sourceHash;
    const installedHash = (state as { installedHash?: unknown }).installedHash;

    if (typeof sourceHash === 'string' && sourceHash.length > 0 && typeof installedHash === 'string' && installedHash.length > 0) {
      result[skillName] = { sourceHash, installedHash };
    }
  }

  return result;
}

export async function loadConfig(projectDir: string): Promise<AppConfig | null> {
  const configPath = getConfigPath(projectDir);
  const raw = await readJsonFile<AppConfig & LegacyConfig>(configPath);
  if (!raw) {
    return null;
  }

  if (Array.isArray(raw.agents)) {
    const agentConfig = getAgentConfig();
    const normalizedAgents = raw.agents.map(agent => ({
      id: agent.id,
      skillsDir: agent.skillsDir || agentConfig.skillsDir,
      installedSkills: Array.isArray(agent.installedSkills) ? agent.installedSkills : [],
      managedSkills: normalizeManagedArtifacts((agent as { managedSkills?: unknown }).managedSkills),
      subagentsDir: agent.subagentsDir || agentConfig.subagentsDir,
      installedSubagents: Array.isArray(agent.installedSubagents) ? agent.installedSubagents : [],
      managedSubagents: normalizeManagedArtifacts((agent as { managedSubagents?: unknown }).managedSubagents),
      mcp: normalizeMcp(agent.mcp),
    }));

    return {
      version: raw.version ?? CURRENT_VERSION,
      agents: normalizedAgents,
      extensions: Array.isArray(raw.extensions) ? raw.extensions : [],
    };
  }

  // Legacy single-agent format
  if (raw.agent) {
    const agentConfig = getAgentConfig();
    return {
      version: raw.version ?? CURRENT_VERSION,
      agents: [{
        id: agentConfig.id,
        skillsDir: raw.skillsDir ?? agentConfig.skillsDir,
        installedSkills: raw.installedSkills ?? [],
        managedSkills: {},
        subagentsDir: agentConfig.subagentsDir,
        installedSubagents: [],
        managedSubagents: {},
        mcp: normalizeMcp(raw.mcp),
      }],
      extensions: [],
    };
  }

  return {
    version: raw.version ?? CURRENT_VERSION,
    agents: [],
    extensions: [],
  };
}

export async function saveConfig(projectDir: string, config: AppConfig): Promise<void> {
  const configPath = getConfigPath(projectDir);
  await writeJsonFile(configPath, config);
}

export async function configExists(projectDir: string): Promise<boolean> {
  const configPath = getConfigPath(projectDir);
  return fileExists(configPath);
}

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}
