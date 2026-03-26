import inquirer from 'inquirer';
import chalk from 'chalk';
import { getAvailableSkills } from '../../core/installer.js';
import { getAgentConfig } from '../../core/agents.js';
import { formatSkillChoiceName } from './skill-hints.js';

export interface McpSelection {
  mcpGithub: boolean;
  mcpFilesystem: boolean;
  mcpPostgres: boolean;
  mcpChromeDevtools: boolean;
  mcpPlaywright: boolean;
}

export interface WizardAnswers {
  selectedSkills: string[];
  mcp: McpSelection;
}

export async function runWizard(): Promise<WizardAnswers> {
  const availableSkills = await getAvailableSkills();
  const agent = getAgentConfig();

  console.log(chalk.dim(`  Target: ${agent.displayName}\n`));
  console.log('  Run /ww after setup to analyze your project and generate relevant skills.\n');

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedSkills',
      message: 'Base skills to install:',
      choices: availableSkills.map(skill => ({
        name: formatSkillChoiceName(skill, hint => chalk.gray(hint)),
        short: skill,
        value: skill,
        checked: true,
      })),
    },
  ]);

  let mcpAnswers: McpSelection = {
    mcpGithub: false,
    mcpFilesystem: false,
    mcpPostgres: false,
    mcpChromeDevtools: false,
    mcpPlaywright: false,
  };

  const { configureMcp } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'configureMcp',
      message: 'Configure MCP servers?',
      default: false,
    },
  ]);

  if (configureMcp) {
    mcpAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'mcpGithub',
        message: 'GitHub MCP (PRs, issues, repo operations)?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'mcpPostgres',
        message: 'Postgres MCP (database queries)?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'mcpFilesystem',
        message: 'Filesystem MCP (advanced file operations)?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'mcpChromeDevtools',
        message: 'Chrome Devtools MCP (inspect, debug, performance insights, analyze network requests)?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'mcpPlaywright',
        message: 'Playwright MCP (browser automation, web testing, interaction via accessibility tree)?',
        default: false,
      },
    ]);
  }

  return {
    selectedSkills: answers.selectedSkills,
    mcp: mcpAnswers,
  };
}
