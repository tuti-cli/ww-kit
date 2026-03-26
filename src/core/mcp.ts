import path from 'path';
import { readJsonFile, writeJsonFile, getMcpDir, ensureDir, fileExists } from '../utils/fs.js';
import { getAgentConfig } from './agents.js';

export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

const KNOWN_MCP_TEMPLATE_KEYS = new Set(['command', 'args', 'env']);

export function validateMcpTemplate(template: unknown, key: string): asserts template is McpServerConfig {
  if (typeof template !== 'object' || template === null || Array.isArray(template)) {
    throw new Error(`MCP server "${key}": template must be an object`);
  }
  const t = template as Record<string, unknown>;
  const unknownKeys = Object.keys(t).filter(k => !KNOWN_MCP_TEMPLATE_KEYS.has(k));
  if (unknownKeys.length > 0) {
    throw new Error(`MCP server "${key}": template has unknown keys: ${unknownKeys.join(', ')}. Allowed keys: command, args, env`);
  }
  if (!t.command || typeof t.command !== 'string') {
    throw new Error(`MCP server "${key}": template must have a non-empty "command" string`);
  }
  if (t.args !== undefined && (!Array.isArray(t.args) || t.args.some(a => typeof a !== 'string'))) {
    throw new Error(`MCP server "${key}": template "args" must be an array of strings`);
  }
  if (
    t.env !== undefined && (
      typeof t.env !== 'object' ||
      t.env === null ||
      Array.isArray(t.env) ||
      Object.values(t.env).some(v => typeof v !== 'string')
    )
  ) {
    throw new Error(`MCP server "${key}": template "env" must be a record of strings`);
  }
}

export interface McpOptions {
  github: boolean;
  filesystem: boolean;
  postgres: boolean;
  chromeDevtools: boolean;
  playwright: boolean;
}

interface McpServerDefinition {
  key: keyof McpOptions;
  templateFile: string;
  instruction: string;
}

const MCP_SERVERS: McpServerDefinition[] = [
  {
    key: 'github',
    templateFile: 'github.json',
    instruction: 'GitHub MCP: Set GITHUB_TOKEN environment variable with your GitHub personal access token',
  },
  {
    key: 'filesystem',
    templateFile: 'filesystem.json',
    instruction: 'Filesystem MCP: No additional configuration needed. Server provides file access tools.',
  },
  {
    key: 'postgres',
    templateFile: 'postgres.json',
    instruction: 'Postgres MCP: Set DATABASE_URL environment variable with your PostgreSQL connection string',
  },
  {
    key: 'chromeDevtools',
    templateFile: 'chrome-devtools.json',
    instruction: 'Chrome Devtools MCP: No additional configuration needed. Server provides your coding agent control and inspect a live Chrome browser.',
  },
  {
    key: 'playwright',
    templateFile: 'playwright.json',
    instruction: 'Playwright MCP: No additional configuration needed. Server provides browser automation via accessibility tree for web testing and interaction.',
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ensureNestedRecord(object: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = object[key];
  if (isRecord(value)) {
    return value;
  }
  const next: Record<string, unknown> = {};
  object[key] = next;
  return next;
}

async function loadSettings(settingsPath: string): Promise<Record<string, unknown>> {
  if (!(await fileExists(settingsPath))) {
    return {};
  }

  const parsed = await readJsonFile<unknown>(settingsPath);
  return isRecord(parsed) ? parsed : {};
}

export async function configureMcp(projectDir: string, options: McpOptions): Promise<string[]> {
  const agent = getAgentConfig();
  const configuredServers: string[] = [];
  const settingsPath = path.join(projectDir, agent.settingsFile);
  const settingsDir = path.dirname(settingsPath);

  await ensureDir(settingsDir);

  const mcpTemplatesDir = path.join(getMcpDir(), 'templates');
  const settings = await loadSettings(settingsPath);

  for (const server of MCP_SERVERS) {
    if (!options[server.key]) {
      continue;
    }

    const template = await readJsonFile<McpServerConfig>(path.join(mcpTemplatesDir, server.templateFile));
    if (!template) {
      continue;
    }

    ensureNestedRecord(settings, 'mcpServers')[server.key] = template;
    configuredServers.push(server.key);
  }

  if (configuredServers.length > 0) {
    await writeJsonFile(settingsPath, settings);
  }

  return configuredServers;
}

export function getMcpInstructions(servers: string[]): string[] {
  const selected = new Set(servers);
  return MCP_SERVERS
    .filter(server => selected.has(server.key))
    .map(server => server.instruction);
}

export async function configureExtensionMcpServers(
  projectDir: string,
  servers: { key: string; template: McpServerConfig }[],
): Promise<string[]> {
  const agent = getAgentConfig();
  const settingsPath = path.join(projectDir, agent.settingsFile);
  await ensureDir(path.dirname(settingsPath));
  const settings = await loadSettings(settingsPath);
  const configured: string[] = [];

  for (const { key, template } of servers) {
    ensureNestedRecord(settings, 'mcpServers')[key] = template;
    configured.push(key);
  }

  if (configured.length > 0) {
    await writeJsonFile(settingsPath, settings);
  }

  return configured;
}

export async function removeExtensionMcpServers(
  projectDir: string,
  keys: string[],
): Promise<void> {
  const agent = getAgentConfig();
  const settingsPath = path.join(projectDir, agent.settingsFile);
  const settings = await loadSettings(settingsPath);
  const container = settings['mcpServers'];

  if (!isRecord(container)) return;

  let changed = false;
  for (const key of keys) {
    if (key in container) {
      delete container[key];
      changed = true;
    }
  }

  if (changed) {
    await writeJsonFile(settingsPath, settings);
  }
}
