import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig, saveConfig, getCurrentVersion } from '../../core/config.js';
import { buildManagedSkillsState, buildManagedSubagentsState, installSkills, installSubagents, getAvailableSkills, partitionSkills } from '../../core/installer.js';
import { getAgentConfig } from '../../core/agents.js';
import { fileExists, removeDirectory, removeFile } from '../../utils/fs.js';

// Old v1 skill directory names that were renamed to aif-* in v2
const OLD_SKILL_NAMES = [
  'architecture',
  'best-practices',
  'build-automation',
  'ci',
  'commit',
  'dockerize',
  'docs',
  'evolve',
  'feature',
  'fix',
  'implement',
  'improve',
  'review',
  'security-checklist',
  'skill-generator',
  'task',
  'verify',
];

// Old v2 skill directory names before aif-* migration
const OLD_AIF_PREFIX_SKILL_NAMES = [
  'ai-factory',
  'ai-factory-architecture',
  'ai-factory-best-practices',
  'ai-factory-build-automation',
  'ai-factory-ci',
  'ai-factory-commit',
  'ai-factory-dockerize',
  'ai-factory-docs',
  'ai-factory-evolve',
  'ai-factory-fix',
  'ai-factory-implement',
  'ai-factory-improve',
  'ai-factory-plan',
  'ai-factory-review',
  'ai-factory-roadmap',
  'ai-factory-rules',
  'ai-factory-security-checklist',
  'ai-factory-skill-generator',
  'ai-factory-verify',
  'ai-factory-task',
  'ai-factory-feature',
];

async function removeLegacySkill(skillsDir: string, skillName: string): Promise<boolean> {
  const oldDir = path.join(skillsDir, skillName);
  if (await fileExists(oldDir)) {
    await removeDirectory(oldDir);
    return true;
  }
  return false;
}

export async function upgradeCommand(): Promise<void> {
  const projectDir = process.cwd();

  console.log(chalk.bold.blue('\n⚡ ww-kit — Upgrade\n'));

  const config = await loadConfig(projectDir);

  if (!config) {
    console.log(chalk.red('Error: No .ww-kit.json found.'));
    console.log(chalk.dim('Run "ww-kit init" to set up your project first.'));
    process.exit(1);
  }

  if (config.agents.length === 0) {
    console.log(chalk.red('Error: No agents configured in .ww-kit.json.'));
    console.log(chalk.dim('Run "ww-kit init" to configure your project.'));
    process.exit(1);
  }

  // Step 1: Migrate legacy plan directories
  const aiFactoryDir = path.join(projectDir, '.ww-kit');
  const featuresDir = path.join(aiFactoryDir, 'features');
  const changesDir = path.join(aiFactoryDir, 'changes');
  const plansDir = path.join(aiFactoryDir, 'plans');
  const evolutionsDir = path.join(aiFactoryDir, 'evolutions');
  const skillContextDir = path.join(aiFactoryDir, 'skill-context');

  if (await fileExists(changesDir) && !(await fileExists(plansDir))) {
    await fs.move(changesDir, plansDir);
    console.log(chalk.green('✓ Renamed .ww-kit/changes/ → .ww-kit/plans/\n'));
  }

  if (await fileExists(featuresDir) && !(await fileExists(plansDir))) {
    await fs.move(featuresDir, plansDir);
    console.log(chalk.green('✓ Renamed .ww-kit/features/ → .ww-kit/plans/\n'));
  }

  await fs.ensureDir(evolutionsDir);
  await fs.ensureDir(skillContextDir);

  const legacyCursorPath = path.join(aiFactoryDir, 'patch-cursor.json');
  const cursorPath = path.join(evolutionsDir, 'patch-cursor.json');
  if (await fileExists(legacyCursorPath)) {
    if (!(await fileExists(cursorPath))) {
      await fs.move(legacyCursorPath, cursorPath);
      console.log(chalk.green('✓ Moved patch-cursor.json → evolutions/patch-cursor.json\n'));
    } else {
      await removeFile(legacyCursorPath);
    }
  }

  const agent = config.agents[0];
  const agentConfig = getAgentConfig();
  const skillsDir = path.join(projectDir, agent.skillsDir);
  let removedCount = 0;

  console.log(chalk.dim('Scanning for old-format skills...\n'));

  for (const oldName of OLD_SKILL_NAMES) {
    if (await removeLegacySkill(skillsDir, oldName)) {
      console.log(chalk.yellow(`  Removed: ${oldName}/`));
      removedCount++;
    }
  }

  // Also remove old aif-* prefixed skills (now renamed to ww-*/wws-*)
  const OLD_AIF_SKILLS = [
    'aif', 'aif-architecture', 'aif-best-practices', 'aif-build-automation',
    'aif-ci', 'aif-commit', 'aif-dockerize', 'aif-docs', 'aif-evolve',
    'aif-explore', 'aif-fix', 'aif-grounded', 'aif-implement', 'aif-improve',
    'aif-loop', 'aif-plan', 'aif-reference', 'aif-review', 'aif-roadmap',
    'aif-rules', 'aif-security-checklist', 'aif-skill-generator', 'aif-verify',
  ];

  const obsoleteSkills = Array.from(new Set([
    'aif-task', 'aif-feature',
    ...OLD_SKILL_NAMES.map(n => `ai-factory-${n}`),
    ...OLD_AIF_PREFIX_SKILL_NAMES,
    ...OLD_AIF_SKILLS,
  ]));

  for (const oldSkill of obsoleteSkills) {
    if (await removeLegacySkill(skillsDir, oldSkill)) {
      console.log(chalk.yellow(`  Removed: ${oldSkill}/`));
      removedCount++;
    }
  }

  if (removedCount === 0) {
    console.log(chalk.dim('  No old-format skills found.\n'));
  } else {
    console.log(chalk.dim(`\n  Removed ${removedCount} old-format skill(s).\n`));
  }

  console.log(chalk.dim('Installing new-format skills...\n'));

  const availableSkills = await getAvailableSkills();
  const { custom: customSkills } = partitionSkills(agent.installedSkills);
  const installedSkills = await installSkills({
    projectDir,
    skillsDir: agent.skillsDir,
    skills: availableSkills,
  });
  const installedSubagents = await installSubagents({
    projectDir,
    subagentsDir: agentConfig.subagentsDir,
  });

  agent.installedSkills = [...installedSkills, ...customSkills];
  agent.installedSubagents = installedSubagents;
  agent.managedSubagents = await buildManagedSubagentsState(projectDir, agent, installedSubagents);
  agent.managedSkills = await buildManagedSkillsState(projectDir, agent, installedSkills);

  config.version = getCurrentVersion();
  await saveConfig(projectDir, config);

  console.log(chalk.green('✓ Upgrade to v2 complete!\n'));

  const { base: baseSkills, custom: finalCustomSkills } = partitionSkills(agent.installedSkills);

  console.log(chalk.bold('Installed skills:'));
  for (const skill of baseSkills) {
    console.log(chalk.dim(`  - ${skill}`));
  }

  if (finalCustomSkills.length > 0) {
    console.log(chalk.bold('Custom skills (preserved):'));
    for (const skill of finalCustomSkills) {
      console.log(chalk.dim(`  - ${skill}`));
    }
  }
  console.log('');
}
