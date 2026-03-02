#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 *  Diego Framework
 *  Created by Jose Lee <joelee194210@gmail.com>
 *
 *  For Pampo — my Kwan Ambassador
 * ═══════════════════════════════════════════════════════════════
 *
 * Diego Tools — CLI utility for Diego framework operations
 *
 * Zero-dependency Node.js script. The deterministic brain of Diego.
 *
 * Usage: node diego-tools.cjs <command> [args] [--raw]
 *
 * State:
 *   state load                         Load project config + state
 *   state update <field> <value>       Update a STATE.md field
 *   state get [section]                Get STATE.md content or section
 *   state patch --field val ...        Batch update STATE.md fields
 *   state add-decision "text"          Log decision in STATE.md
 *   state snapshot                     Structured parse of STATE.md
 *
 * Phase:
 *   phase add "description"            Append phase to roadmap + create dir
 *   phase remove <N> [--force]         Remove phase, renumber subsequent
 *   phase complete <N>                 Mark phase done, update state + roadmap
 *   phase find <N>                     Find phase directory by number
 *   phase-plan-index <N>               Plans grouped by wave with status
 *
 * Init (compound, workflow-specific):
 *   init project                       Context for init-project workflow
 *   init plan-phase <N>                Context for plan-phase workflow
 *   init execute-phase <N>             Context for execute-phase workflow
 *   init do "description"              Context for do workflow
 *   init quick "description"           Context for quick workflow
 *   init fix "description"             Context for fix workflow
 *   init resume                        Context for resume-project workflow
 *   init verify <N>                    Context for verify-phase workflow
 *   init progress                      Context for progress workflow
 *
 * Model:
 *   resolve-model <agent-type>         Resolve model for agent based on profile
 *
 * Roadmap:
 *   roadmap get-phase <N>              Extract phase section from ROADMAP.md
 *   roadmap analyze                    Full roadmap parse with disk status
 *   roadmap update-plan-progress <N>   Update progress row from disk
 *
 * Git:
 *   commit "message" [--files f1 f2]   Commit with Diego conventions
 *
 * Template:
 *   template fill summary --phase N    Pre-filled SUMMARY.md
 *   template fill plan --phase N       Pre-filled PLAN.md
 *   template fill verification --phase N  Pre-filled VERIFICATION.md
 *
 * Utility:
 *   generate-slug "text"               URL-safe slug
 *   current-timestamp [format]         Timestamp (full|date|filename)
 *   verify-path-exists <path>          Check file/dir existence
 *   version                            Print Diego version
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ─── Model Profile Table ─────────────────────────────────────────────────────

const MODEL_PROFILES = {
  'diego-planner':    { quality: 'opus', balanced: 'opus',   budget: 'sonnet' },
  'diego-executor':   { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
  'diego-verifier':   { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'diego-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
  'diego-mapper':     { quality: 'sonnet', balanced: 'haiku', budget: 'haiku' },
  'diego-debugger':   { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
};

const DIEGO_DIR = path.join(process.env.HOME, '.claude', 'diego');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeReadFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

function safeWriteFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function findPlanningDir(cwd) {
  let dir = cwd || process.cwd();
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, '.planning'))) return path.join(dir, '.planning');
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.join(cwd || process.cwd(), '.planning');
}

function loadConfig(cwd) {
  const planDir = findPlanningDir(cwd);
  const configPath = path.join(planDir, 'config.json');
  const defaults = {
    model_profile: 'balanced',
    commit_docs: true,
    branching_strategy: 'none',
    phase_branch_template: 'diego/phase-{phase}-{slug}',
    milestone_branch_template: 'diego/{milestone}-{slug}',
    thorough_default: false,
    auto_unify: true,
  };
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function generateSlug(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

function currentTimestamp(format) {
  const now = new Date();
  if (format === 'date') return now.toISOString().split('T')[0];
  if (format === 'filename') return now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
  return now.toISOString();
}

function parseFrontmatter(content) {
  if (!content) return { frontmatter: {}, body: content || '' };
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.substring(0, idx).trim();
      let val = line.substring(idx + 1).trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (/^\d+$/.test(val)) val = parseInt(val, 10);
      fm[key] = val;
    }
  });
  return { frontmatter: fm, body: match[2] };
}

function serializeFrontmatter(fm, body) {
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n${body}`;
}

function output(data, raw) {
  if (raw || typeof data === 'string') {
    console.log(typeof data === 'string' ? data : JSON.stringify(data));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

function fatal(msg) {
  console.error('ERROR: ' + msg);
  process.exit(1);
}

function gitExec(gitArgs, cwd) {
  return execFileSync('git', gitArgs, { cwd, encoding: 'utf-8', stdio: 'pipe' });
}

// ─── State Commands ───────────────────────────────────────────────────────────

function stateLoad(cwd) {
  const planDir = findPlanningDir(cwd);
  const config = loadConfig(cwd);
  const stateContent = safeReadFile(path.join(planDir, 'STATE.md'));
  const state = stateContent ? parseFrontmatter(stateContent) : { frontmatter: {}, body: '' };

  return {
    exists: !!stateContent,
    planning_dir: planDir,
    config,
    state: state.frontmatter,
    has_project: !!safeReadFile(path.join(planDir, 'PROJECT.md')),
    has_roadmap: !!safeReadFile(path.join(planDir, 'ROADMAP.md')),
    has_requirements: !!safeReadFile(path.join(planDir, 'REQUIREMENTS.md')),
    current_phase: state.frontmatter.phase || null,
    current_plan: state.frontmatter.plan || null,
    status: state.frontmatter.status || 'not_started',
    profile: state.frontmatter.profile || config.model_profile,
  };
}

function stateUpdate(cwd, field, value) {
  const planDir = findPlanningDir(cwd);
  const statePath = path.join(planDir, 'STATE.md');
  const content = safeReadFile(statePath);
  if (!content) fatal('STATE.md not found');
  const { frontmatter, body } = parseFrontmatter(content);
  frontmatter[field] = value;
  frontmatter.last_updated = currentTimestamp();
  safeWriteFile(statePath, serializeFrontmatter(frontmatter, body));
  return { updated: field, value };
}

function stateGet(cwd, section) {
  const planDir = findPlanningDir(cwd);
  const content = safeReadFile(path.join(planDir, 'STATE.md'));
  if (!content) fatal('STATE.md not found');
  if (!section) return content;
  const { frontmatter, body } = parseFrontmatter(content);
  if (section === 'frontmatter') return frontmatter;
  const sectionRegex = new RegExp('## ' + section + '\\n([\\s\\S]*?)(?=\\n## |$)', 'i');
  const match = body.match(sectionRegex);
  return match ? match[1].trim() : '';
}

function statePatch(cwd, patches) {
  const planDir = findPlanningDir(cwd);
  const statePath = path.join(planDir, 'STATE.md');
  const content = safeReadFile(statePath);
  if (!content) fatal('STATE.md not found');
  const { frontmatter, body } = parseFrontmatter(content);
  Object.assign(frontmatter, patches);
  frontmatter.last_updated = currentTimestamp();
  safeWriteFile(statePath, serializeFrontmatter(frontmatter, body));
  return { patched: Object.keys(patches) };
}

function stateAddDecision(cwd, text) {
  const planDir = findPlanningDir(cwd);
  const statePath = path.join(planDir, 'STATE.md');
  const content = safeReadFile(statePath);
  if (!content) fatal('STATE.md not found');
  const timestamp = currentTimestamp('date');
  const entry = '- [' + timestamp + '] ' + text;
  let updated;
  if (content.includes('## Recent Decisions')) {
    updated = content.replace(/(## Recent Decisions\n)/, '$1' + entry + '\n');
  } else {
    const { frontmatter, body } = parseFrontmatter(content);
    updated = serializeFrontmatter(frontmatter, body + '\n## Recent Decisions\n' + entry + '\n');
  }
  safeWriteFile(statePath, updated);
  return { added: text };
}

function stateSnapshot(cwd) {
  const planDir = findPlanningDir(cwd);
  const content = safeReadFile(path.join(planDir, 'STATE.md'));
  if (!content) return { exists: false };
  const { frontmatter, body } = parseFrontmatter(content);
  const extractSection = (name) => {
    const regex = new RegExp('## ' + name + '\\n([\\s\\S]*?)(?=\\n## |$)', 'i');
    const match = body.match(regex);
    return match ? match[1].trim().split('\n').filter(l => l.trim()) : [];
  };
  return { exists: true, ...frontmatter, decisions: extractSection('Recent Decisions'), blockers: extractSection('Blockers') };
}

// ─── Phase Commands ───────────────────────────────────────────────────────────

function phaseFind(cwd, phaseNum) {
  const planDir = findPlanningDir(cwd);
  const phasesDir = path.join(planDir, 'phases');
  if (!fs.existsSync(phasesDir)) return { found: false, path: null };
  const padded = String(phaseNum).padStart(2, '0');
  try {
    const entries = fs.readdirSync(phasesDir);
    const match = entries.find(e => e.startsWith(padded + '-'));
    if (match) return { found: true, path: path.join(phasesDir, match), name: match };
  } catch {}
  return { found: false, path: null };
}

function phaseAdd(cwd, description) {
  const planDir = findPlanningDir(cwd);
  const roadmapPath = path.join(planDir, 'ROADMAP.md');
  const content = safeReadFile(roadmapPath);
  if (!content) fatal('ROADMAP.md not found');

  const phaseMatches = content.match(/## Phase (\d+)/g) || [];
  const numbers = phaseMatches.map(m => parseInt(m.match(/\d+/)[0]));
  const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  const padded = String(nextNum).padStart(2, '0');
  const slug = generateSlug(description);
  const dirName = padded + '-' + slug;

  const phaseDir = path.join(planDir, 'phases', dirName);
  fs.mkdirSync(phaseDir, { recursive: true });

  const newPhase = '\n## Phase ' + nextNum + ': ' + description + '\n- **Goal:** ' + description + '\n- **Status:** pending\n';
  safeWriteFile(roadmapPath, content.trimEnd() + '\n' + newPhase);

  return { phase: nextNum, directory: phaseDir, slug };
}

function phaseRemove(cwd, phaseNum, force) {
  const planDir = findPlanningDir(cwd);
  const roadmapPath = path.join(planDir, 'ROADMAP.md');
  const content = safeReadFile(roadmapPath);
  if (!content) fatal('ROADMAP.md not found');

  const phase = phaseFind(cwd, phaseNum);
  if (phase.found && !force) {
    try {
      const files = fs.readdirSync(phase.path);
      if (files.some(f => f.endsWith('-PLAN.md'))) {
        fatal('Phase ' + phaseNum + ' has plans. Use --force to remove.');
      }
    } catch {}
  }

  const sectionRegex = new RegExp('\\n## Phase ' + phaseNum + ':[^]*?(?=\\n## Phase \\d|$)', 'g');
  safeWriteFile(roadmapPath, content.replace(sectionRegex, ''));
  if (phase.found) fs.rmSync(phase.path, { recursive: true, force: true });
  return { removed: phaseNum };
}

function phaseComplete(cwd, phaseNum) {
  const planDir = findPlanningDir(cwd);
  const roadmapPath = path.join(planDir, 'ROADMAP.md');
  const content = safeReadFile(roadmapPath);
  if (!content) fatal('ROADMAP.md not found');

  const updated = content.replace(
    new RegExp('(## Phase ' + phaseNum + ':[^]*?- \\*\\*Status:\\*\\* )\\w+'),
    '$1completed'
  );
  safeWriteFile(roadmapPath, updated);
  stateUpdate(cwd, 'status', 'phase_completed');
  return { completed: phaseNum };
}

function phasePlanIndex(cwd, phaseNum) {
  const phase = phaseFind(cwd, phaseNum);
  if (!phase.found) return { found: false, plans: [] };

  try {
    const files = fs.readdirSync(phase.path);
    const plans = files.filter(f => f.endsWith('-PLAN.md')).sort();
    const summaries = files.filter(f => f.endsWith('-SUMMARY.md')).sort();

    const indexed = plans.map(planFile => {
      const content = safeReadFile(path.join(phase.path, planFile));
      const { frontmatter } = parseFrontmatter(content);
      const planNum = planFile.match(/(\d+-\d+)-PLAN/)?.[1] || planFile;
      const hasSummary = summaries.some(s => s.startsWith(planNum));

      return {
        file: planFile,
        path: path.join(phase.path, planFile),
        plan: planNum,
        wave: frontmatter.wave || 1,
        autonomous: frontmatter.autonomous !== false,
        status: hasSummary ? 'completed' : 'pending',
        summary: hasSummary ? path.join(phase.path, summaries.find(s => s.startsWith(planNum))) : null,
      };
    });

    const waves = {};
    indexed.forEach(p => {
      const w = p.wave;
      if (!waves[w]) waves[w] = [];
      waves[w].push(p);
    });

    return {
      found: true,
      phase_dir: phase.path,
      total_plans: plans.length,
      completed: indexed.filter(p => p.status === 'completed').length,
      plans: indexed,
      waves,
    };
  } catch {
    return { found: true, phase_dir: phase.path, plans: [], waves: {} };
  }
}

// ─── Init Commands (Compound) ─────────────────────────────────────────────────

function initProject(cwd) {
  const planDir = findPlanningDir(cwd);
  const config = loadConfig(cwd);
  const existing = fs.existsSync(planDir);
  return {
    planning_dir: planDir,
    exists: existing,
    has_project: existing && fs.existsSync(path.join(planDir, 'PROJECT.md')),
    has_roadmap: existing && fs.existsSync(path.join(planDir, 'ROADMAP.md')),
    has_state: existing && fs.existsSync(path.join(planDir, 'STATE.md')),
    config,
    template_dir: path.join(DIEGO_DIR, 'templates'),
    cwd: cwd || process.cwd(),
  };
}

function initPlanPhase(cwd, phaseNum) {
  const state = stateLoad(cwd);
  const phase = phaseFind(cwd, phaseNum);
  const config = loadConfig(cwd);
  const planIndex = phase.found ? phasePlanIndex(cwd, phaseNum) : { plans: [], waves: {} };

  const roadmapContent = safeReadFile(path.join(state.planning_dir, 'ROADMAP.md'));
  let phaseGoal = '';
  if (roadmapContent) {
    const match = roadmapContent.match(new RegExp('## Phase ' + phaseNum + ':[^]*?- \\*\\*Goal:\\*\\* ([^\n]+)'));
    if (match) phaseGoal = match[1];
  }

  const existingPlans = planIndex.plans || [];
  const planNums = existingPlans.map(p => { const m = p.plan.match(/\d+-(\d+)/); return m ? parseInt(m[1]) : 0; });
  const nextPlan = planNums.length > 0 ? Math.max(...planNums) + 1 : 1;
  const padPhase = String(phaseNum).padStart(2, '0');
  const padPlan = String(nextPlan).padStart(2, '0');

  return {
    planner_model: resolveModel(config, 'diego-planner'),
    phase: phaseNum,
    phase_dir: phase.found ? phase.path : null,
    phase_goal: phaseGoal,
    next_plan: padPhase + '-' + padPlan,
    existing_plans: existingPlans.length,
    incomplete_plans: existingPlans.filter(p => p.status !== 'completed'),
    config,
    thorough: config.thorough_default || false,
    template_dir: path.join(DIEGO_DIR, 'templates'),
  };
}

function initExecutePhase(cwd, phaseNum) {
  const config = loadConfig(cwd);
  const planIndex = phasePlanIndex(cwd, phaseNum);
  if (!planIndex.found) fatal('Phase ' + phaseNum + ' not found');

  const incompletePlans = planIndex.plans.filter(p => p.status !== 'completed');
  const incompleteWaves = {};
  incompletePlans.forEach(p => {
    if (!incompleteWaves[p.wave]) incompleteWaves[p.wave] = [];
    incompleteWaves[p.wave].push(p);
  });
  const waveNums = Object.keys(incompleteWaves).map(Number).sort((a, b) => a - b);

  return {
    executor_model: resolveModel(config, 'diego-executor'),
    planner_model: resolveModel(config, 'diego-planner'),
    phase: phaseNum,
    phase_dir: planIndex.phase_dir,
    total_plans: planIndex.total_plans,
    completed: planIndex.completed,
    incomplete_plans: incompletePlans.map(p => p.path),
    waves: incompleteWaves,
    first_wave: waveNums[0] || null,
    commit_docs: config.commit_docs,
    thorough: config.thorough_default || false,
    config,
  };
}

function initDo(cwd, description) {
  const config = loadConfig(cwd);
  const slug = generateSlug(description);
  const planDir = findPlanningDir(cwd);
  const quickDir = path.join(planDir, 'quick');
  let nextNum = 1;
  if (fs.existsSync(quickDir)) {
    try {
      const entries = fs.readdirSync(quickDir);
      const nums = entries.map(e => parseInt(e.match(/^(\d+)/)?.[1] || '0')).filter(n => n > 0);
      if (nums.length > 0) nextNum = Math.max(...nums) + 1;
    } catch {}
  }
  const taskDir = path.join(quickDir, String(nextNum).padStart(3, '0') + '-' + slug);
  fs.mkdirSync(taskDir, { recursive: true });

  return {
    planner_model: resolveModel(config, 'diego-planner'),
    executor_model: resolveModel(config, 'diego-executor'),
    description, slug, task_dir: taskDir, task_num: nextNum,
    commit_docs: config.commit_docs,
    thorough: config.thorough_default || false,
    config,
  };
}

function initQuick(cwd, description) {
  const config = loadConfig(cwd);
  const slug = generateSlug(description);
  const planDir = findPlanningDir(cwd);
  const quickDir = path.join(planDir, 'quick');
  let nextNum = 1;
  if (fs.existsSync(quickDir)) {
    try {
      const entries = fs.readdirSync(quickDir);
      const nums = entries.map(e => parseInt(e.match(/^(\d+)/)?.[1] || '0')).filter(n => n > 0);
      if (nums.length > 0) nextNum = Math.max(...nums) + 1;
    } catch {}
  }
  const taskDir = path.join(quickDir, String(nextNum).padStart(3, '0') + '-' + slug);
  fs.mkdirSync(taskDir, { recursive: true });

  return {
    executor_model: resolveModel(config, 'diego-executor'),
    description, slug, task_dir: taskDir, task_num: nextNum,
    commit_docs: config.commit_docs,
    thorough: config.thorough_default || false,
    config,
  };
}

function initFix(cwd, description) {
  const config = loadConfig(cwd);
  const slug = generateSlug(description);
  const planDir = findPlanningDir(cwd);
  const quickDir = path.join(planDir, 'quick');
  let nextNum = 1;
  if (fs.existsSync(quickDir)) {
    try {
      const entries = fs.readdirSync(quickDir);
      const nums = entries.map(e => parseInt(e.match(/^(\d+)/)?.[1] || '0')).filter(n => n > 0);
      if (nums.length > 0) nextNum = Math.max(...nums) + 1;
    } catch {}
  }
  const taskDir = path.join(quickDir, String(nextNum).padStart(3, '0') + '-fix-' + slug);
  fs.mkdirSync(taskDir, { recursive: true });

  return {
    debugger_model: resolveModel(config, 'diego-debugger'),
    planner_model: resolveModel(config, 'diego-planner'),
    executor_model: resolveModel(config, 'diego-executor'),
    description, slug, task_dir: taskDir, task_num: nextNum,
    commit_docs: config.commit_docs,
    thorough: config.thorough_default || false,
    config,
  };
}

function initResume(cwd) {
  const planDir = findPlanningDir(cwd);
  const state = stateLoad(cwd);
  const handoffPath = path.join(planDir, 'HANDOFF.md');
  const handoff = fs.existsSync(handoffPath) ? safeReadFile(handoffPath) : null;
  return { state, handoff, has_handoff: !!handoff, planning_dir: planDir };
}

function initVerify(cwd, phaseNum) {
  const config = loadConfig(cwd);
  const planIndex = phasePlanIndex(cwd, phaseNum);
  const planDir = findPlanningDir(cwd);
  const roadmapContent = safeReadFile(path.join(planDir, 'ROADMAP.md'));
  let phaseGoal = '';
  if (roadmapContent) {
    const match = roadmapContent.match(new RegExp('## Phase ' + phaseNum + ':[^]*?- \\*\\*Goal:\\*\\* ([^\n]+)'));
    if (match) phaseGoal = match[1];
  }
  return {
    verifier_model: resolveModel(config, 'diego-verifier'),
    phase: phaseNum, phase_dir: planIndex.phase_dir, phase_goal: phaseGoal,
    plans: planIndex.plans, completed: planIndex.completed, total: planIndex.total_plans, config,
  };
}

function initProgress(cwd) {
  const state = stateLoad(cwd);
  const planDir = findPlanningDir(cwd);
  let totalPhases = 0, completedPhases = 0;
  const roadmapContent = safeReadFile(path.join(planDir, 'ROADMAP.md'));
  if (roadmapContent) {
    totalPhases = (roadmapContent.match(/## Phase \d+/g) || []).length;
    completedPhases = (roadmapContent.match(/Status:\*\* completed/g) || []).length;
  }
  let currentPhaseStatus = null;
  if (state.current_phase) currentPhaseStatus = phasePlanIndex(cwd, state.current_phase);

  return { state, total_phases: totalPhases, completed_phases: completedPhases, current_phase_status: currentPhaseStatus, planning_dir: planDir };
}

// ─── Model Resolution ─────────────────────────────────────────────────────────

function resolveModel(configOrCwd, agentType) {
  const config = typeof configOrCwd === 'object' ? configOrCwd : loadConfig(configOrCwd);
  const profile = config.model_profile || 'balanced';
  const agentKey = agentType.startsWith('diego-') ? agentType : 'diego-' + agentType;
  if (!MODEL_PROFILES[agentKey]) return 'sonnet';
  return MODEL_PROFILES[agentKey][profile] || MODEL_PROFILES[agentKey].balanced || 'sonnet';
}

// ─── Roadmap Commands ─────────────────────────────────────────────────────────

function roadmapGetPhase(cwd, phaseNum) {
  const planDir = findPlanningDir(cwd);
  const content = safeReadFile(path.join(planDir, 'ROADMAP.md'));
  if (!content) fatal('ROADMAP.md not found');
  const regex = new RegExp('## Phase ' + phaseNum + ':([\\s\\S]*?)(?=\\n## Phase \\d|$)');
  const match = content.match(regex);
  if (!match) return { found: false };
  const section = match[0];
  return {
    found: true,
    name: (section.match(/## Phase \d+: (.+)/) || [])[1] || '',
    goal: (section.match(/- \*\*Goal:\*\* (.+)/) || [])[1] || '',
    status: (section.match(/- \*\*Status:\*\* (\w+)/) || [])[1] || 'pending',
    section,
  };
}

function roadmapAnalyze(cwd) {
  const planDir = findPlanningDir(cwd);
  const content = safeReadFile(path.join(planDir, 'ROADMAP.md'));
  if (!content) fatal('ROADMAP.md not found');
  const phases = [];
  const regex = /## Phase (\d+): (.+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const num = parseInt(match[1]);
    const phaseInfo = roadmapGetPhase(cwd, num);
    const diskInfo = phaseFind(cwd, num);
    const planIndex = diskInfo.found ? phasePlanIndex(cwd, num) : null;
    phases.push({
      number: num, name: match[2], ...phaseInfo,
      has_directory: diskInfo.found, directory: diskInfo.path,
      plans: planIndex ? planIndex.total_plans : 0,
      completed_plans: planIndex ? planIndex.completed : 0,
    });
  }
  return { phases, total: phases.length };
}

function roadmapUpdatePlanProgress(cwd, phaseNum) {
  const planDir = findPlanningDir(cwd);
  const roadmapPath = path.join(planDir, 'ROADMAP.md');
  const content = safeReadFile(roadmapPath);
  if (!content) fatal('ROADMAP.md not found');
  const planIndex = phasePlanIndex(cwd, phaseNum);
  const padded = String(phaseNum).padStart(2, '0');
  if (content.includes('| Phase |')) {
    const updated = content.replace(
      new RegExp('\\| ' + padded + ' \\|([^|]*\\|[^|]*\\|) \\d+ \\| \\d+ \\|'),
      '| ' + padded + ' |$1 ' + planIndex.total_plans + ' | ' + planIndex.completed + ' |'
    );
    safeWriteFile(roadmapPath, updated);
  }
  return { phase: phaseNum, total: planIndex.total_plans, completed: planIndex.completed };
}

// ─── Git Commands ─────────────────────────────────────────────────────────────

function gitCommit(cwd, message, files) {
  try {
    gitExec(['rev-parse', '--is-inside-work-tree'], cwd);
  } catch {
    return { committed: false, reason: 'not a git repository' };
  }
  try {
    if (files && files.length > 0) {
      gitExec(['add', ...files], cwd);
    } else {
      gitExec(['add', '.planning/'], cwd);
    }
    try {
      gitExec(['diff', '--cached', '--quiet'], cwd);
      return { committed: false, reason: 'no changes to commit' };
    } catch { /* staged changes exist */ }

    const result = gitExec(['commit', '-m', message], cwd);
    const hashMatch = result.match(/\[[\w/-]+ ([a-f0-9]+)\]/);
    return { committed: true, hash: hashMatch ? hashMatch[1] : null, message };
  } catch (e) {
    return { committed: false, reason: e.message };
  }
}

// ─── Template Commands ────────────────────────────────────────────────────────

function templateFill(type, args) {
  const templatePath = path.join(DIEGO_DIR, 'templates', type + '.md');
  const template = safeReadFile(templatePath);
  if (!template) fatal('Template not found: ' + type + '.md');
  let filled = template;
  if (args.phase) filled = filled.replace(/\{phase_number\}/g, args.phase);
  if (args.plan) filled = filled.replace(/\{plan_number\}/g, args.plan);
  if (args.timestamp) filled = filled.replace(/\{timestamp\}/g, args.timestamp);
  else filled = filled.replace(/\{timestamp\}/g, currentTimestamp());
  filled = filled.replace(/\{[a-z_]+\}/g, '');
  return filled;
}

// ─── CLI Router ───────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const rawMode = args.includes('--raw');
  const forceFlag = args.includes('--force');
  const cleanArgs = args.filter(a => a !== '--raw' && a !== '--force');
  if (cleanArgs.length === 0) fatal('Usage: diego-tools <command> [args]');

  const cmd = cleanArgs[0];
  const sub = cleanArgs[1];
  const cwd = process.cwd();

  try {
    switch (cmd) {
      case 'version': {
        const v = safeReadFile(path.join(DIEGO_DIR, 'VERSION'));
        output(v ? v.trim() : 'unknown', true);
        break;
      }

      case 'state': {
        switch (sub) {
          case 'load': output(stateLoad(cwd), rawMode); break;
          case 'update': output(stateUpdate(cwd, cleanArgs[2], cleanArgs[3]), rawMode); break;
          case 'get': output(stateGet(cwd, cleanArgs[2]), true); break;
          case 'patch': {
            const patches = {};
            for (let i = 2; i < cleanArgs.length; i += 2) {
              patches[cleanArgs[i].replace(/^--/, '')] = cleanArgs[i + 1];
            }
            output(statePatch(cwd, patches), rawMode);
            break;
          }
          case 'add-decision': output(stateAddDecision(cwd, cleanArgs[2]), rawMode); break;
          case 'snapshot': output(stateSnapshot(cwd), rawMode); break;
          default: fatal('Unknown state subcommand: ' + sub);
        }
        break;
      }

      case 'phase': {
        switch (sub) {
          case 'add': output(phaseAdd(cwd, cleanArgs[2]), rawMode); break;
          case 'remove': output(phaseRemove(cwd, parseInt(cleanArgs[2]), forceFlag), rawMode); break;
          case 'complete': output(phaseComplete(cwd, parseInt(cleanArgs[2])), rawMode); break;
          case 'find': output(phaseFind(cwd, parseInt(cleanArgs[2])), rawMode); break;
          default: fatal('Unknown phase subcommand: ' + sub);
        }
        break;
      }

      case 'phase-plan-index': output(phasePlanIndex(cwd, parseInt(sub)), rawMode); break;

      case 'init': {
        switch (sub) {
          case 'project': output(initProject(cwd), rawMode); break;
          case 'plan-phase': output(initPlanPhase(cwd, parseInt(cleanArgs[2])), rawMode); break;
          case 'execute-phase': output(initExecutePhase(cwd, parseInt(cleanArgs[2])), rawMode); break;
          case 'do': output(initDo(cwd, cleanArgs.slice(2).join(' ')), rawMode); break;
          case 'quick': output(initQuick(cwd, cleanArgs.slice(2).join(' ')), rawMode); break;
          case 'fix': output(initFix(cwd, cleanArgs.slice(2).join(' ')), rawMode); break;
          case 'resume': output(initResume(cwd), rawMode); break;
          case 'verify': output(initVerify(cwd, parseInt(cleanArgs[2])), rawMode); break;
          case 'progress': output(initProgress(cwd), rawMode); break;
          default: fatal('Unknown init subcommand: ' + sub);
        }
        break;
      }

      case 'resolve-model': output(resolveModel(cwd, sub), true); break;

      case 'roadmap': {
        switch (sub) {
          case 'get-phase': output(roadmapGetPhase(cwd, parseInt(cleanArgs[2])), rawMode); break;
          case 'analyze': output(roadmapAnalyze(cwd), rawMode); break;
          case 'update-plan-progress': output(roadmapUpdatePlanProgress(cwd, parseInt(cleanArgs[2])), rawMode); break;
          default: fatal('Unknown roadmap subcommand: ' + sub);
        }
        break;
      }

      case 'commit': {
        const filesIdx = cleanArgs.indexOf('--files');
        const files = filesIdx > 0 ? cleanArgs.slice(filesIdx + 1) : [];
        output(gitCommit(cwd, sub, files), rawMode);
        break;
      }

      case 'template': {
        if (sub !== 'fill') fatal('Unknown template subcommand: ' + sub);
        const type = cleanArgs[2];
        const templateArgs = {};
        for (let i = 3; i < cleanArgs.length; i += 2) {
          templateArgs[cleanArgs[i].replace(/^--/, '')] = cleanArgs[i + 1];
        }
        output(templateFill(type, templateArgs), true);
        break;
      }

      case 'generate-slug': output(generateSlug(cleanArgs.slice(1).join(' ')), true); break;
      case 'current-timestamp': output(currentTimestamp(sub || 'full'), true); break;
      case 'verify-path-exists': {
        const exists = fs.existsSync(sub);
        output({ exists, path: sub }, rawMode);
        break;
      }

      default: fatal('Unknown command: ' + cmd);
    }
  } catch (e) {
    if (e.message && !e.message.startsWith('ERROR:')) fatal(e.message);
    process.exit(1);
  }
}

main();
