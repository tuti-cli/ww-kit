import chalk from 'chalk';
import path from 'path';
import { runWizard } from '../wizard/prompts.js';
import { buildManagedSkillsState, buildManagedSubagentsState, installSkills, installSubagents } from '../../core/installer.js';
import { saveConfig, configExists, loadConfig, getCurrentVersion, type AgentInstallation } from '../../core/config.js';
import { configureMcp, getMcpInstructions } from '../../core/mcp.js';
import { getAgentConfig } from '../../core/agents.js';
import { getWelcomeMessage } from '../../core/transformer.js';
import { applyExtensionInjections } from '../../core/injections.js';
import { collectReplacedSkills } from '../../core/extension-ops.js';

export async function initCommand(): Promise<void> {
  const projectDir = process.cwd();
  const agentConfig = getAgentConfig();

  console.log(chalk.bold.blue('\n⚡ ww-kit — Project Setup\n'));

  const hasExistingConfig = await configExists(projectDir);
  const existingConfig = hasExistingConfig ? await loadConfig(projectDir) : null;

  if (hasExistingConfig) {
    console.log(chalk.yellow('Warning: .ww-kit.json already exists.'));
    console.log('Running init will reinstall base skills.\n');
  }

  try {
    const answers = await runWizard();

    console.log(chalk.dim('\nInstalling skills...\n'));

    const installedSkills = await installSkills({
      projectDir,
      skillsDir: agentConfig.skillsDir,
      skills: answers.selectedSkills,
    });

    const installedSubagents = await installSubagents({
      projectDir,
      subagentsDir: agentConfig.subagentsDir,
    });

    const configuredMcp = await configureMcp(projectDir, {
      github: answers.mcp.mcpGithub,
      filesystem: answers.mcp.mcpFilesystem,
      postgres: answers.mcp.mcpPostgres,
      chromeDevtools: answers.mcp.mcpChromeDevtools,
      playwright: answers.mcp.mcpPlaywright,
    });

    const agent: AgentInstallation = {
      id: agentConfig.id,
      skillsDir: agentConfig.skillsDir,
      installedSkills,
      subagentsDir: agentConfig.subagentsDir,
      installedSubagents,
      mcp: {
        github: answers.mcp.mcpGithub,
        filesystem: answers.mcp.mcpFilesystem,
        postgres: answers.mcp.mcpPostgres,
        chromeDevtools: answers.mcp.mcpChromeDevtools,
        playwright: answers.mcp.mcpPlaywright,
      },
    };

    const existingExtensions = existingConfig?.extensions ?? [];

    if (existingExtensions.length > 0) {
      let totalInjections = 0;
      totalInjections += await applyExtensionInjections(projectDir, agent, existingExtensions);
      if (totalInjections > 0) {
        console.log(chalk.green(`✓ Re-applied ${totalInjections} extension injection(s)`));
      }
    }

    const replacedSkills = collectReplacedSkills(existingExtensions);
    const managedBaseSkills = agent.installedSkills.filter(skill => !replacedSkills.has(skill));
    agent.managedSkills = await buildManagedSkillsState(projectDir, agent, managedBaseSkills);
    agent.managedSubagents = await buildManagedSubagentsState(projectDir, agent, agent.installedSubagents ?? []);

    await saveConfig(projectDir, {
      version: getCurrentVersion(),
      agents: [agent],
      extensions: existingExtensions,
    });

    console.log(chalk.green('✓ Configuration saved to .ww-kit.json'));

    console.log(chalk.bold.green('\n✅ Setup complete!\n'));

    console.log(chalk.dim(`  Skills directory: ${path.join(projectDir, agent.skillsDir)}`));
    console.log(chalk.dim(`  Installed skills: ${agent.installedSkills.length}`));
    console.log(chalk.dim(`  Subagents directory: ${path.join(projectDir, agent.subagentsDir!)}`));
    console.log(chalk.dim(`  Installed subagents: ${agent.installedSubagents?.length ?? 0}`));

    if (configuredMcp.length > 0) {
      console.log(chalk.green(`  MCP servers configured: ${configuredMcp.join(', ')}`));
      const instructions = getMcpInstructions(configuredMcp);
      for (const instruction of instructions) {
        console.log(chalk.dim(`    ${instruction}`));
      }
    }
    console.log('');

    console.log(chalk.bold('Next steps:'));
    for (const line of getWelcomeMessage()) {
      console.log(chalk.dim(`  ${line}`));
    }
    console.log(chalk.dim(`  3. Use /ww-plan and /ww-commit for daily workflow`));
    console.log('');

  } catch (error) {
    if ((error as Error).message?.includes('User force closed')) {
      console.log(chalk.yellow('\nSetup cancelled.'));
      return;
    }
    throw error;
  }
}
