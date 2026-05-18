import yaml from 'js-yaml';
import type { Prompt, PromptMeta, PromptVariable, PromptSystem, PromptOutputSchema } from '../types';

export function promptToYaml(p: Prompt): string {
  const obj: Record<string, unknown> = {
    meta: {
      name: p.meta.name,
      description: p.meta.description,
      tags: p.meta.tags,
      platform: p.meta.platform,
    },
    system: {
      role: p.system.role,
    },
    user: p.user,
  };

  if (p.meta.nameZh) (obj.meta as Record<string,unknown>).nameZh = p.meta.nameZh;
  if (p.meta.descriptionZh) (obj.meta as Record<string,unknown>).descriptionZh = p.meta.descriptionZh;
  if (p.system.roleZh) (obj.system as Record<string,unknown>).roleZh = p.system.roleZh;
  if (p.system.personality) (obj.system as Record<string,unknown>).personality = p.system.personality;
  if (p.system.personalityZh) (obj.system as Record<string,unknown>).personalityZh = p.system.personalityZh;
  if (p.system.rules && p.system.rules.length > 0) (obj.system as Record<string,unknown>).rules = p.system.rules;
  if (p.system.rulesZh && p.system.rulesZh.length > 0) (obj.system as Record<string,unknown>).rulesZh = p.system.rulesZh;
  if (p.system.stop_rules && p.system.stop_rules.length > 0) (obj.system as Record<string,unknown>).stop_rules = p.system.stop_rules;
  if (p.system.stop_rulesZh && p.system.stop_rulesZh.length > 0) (obj.system as Record<string,unknown>).stop_rulesZh = p.system.stop_rulesZh;
  if (p.userZh) obj.userZh = p.userZh;

  if (p.variables.length > 0) {
    obj.variables = p.variables.map(v => {
      const vo: Record<string, unknown> = { name: v.name, label: v.label, type: v.type };
      if (v.labelZh) vo.labelZh = v.labelZh;
      if (v.options) vo.options = v.options;
      if (v.optionsZh) vo.optionsZh = v.optionsZh;
      if (v.default !== undefined) vo.default = v.default;
      if (v.required) vo.required = true;
      return vo;
    });
  }

  if (p.output_schema) {
    const os: Record<string, unknown> = { type: p.output_schema.type };
    if (p.output_schema.schema) os.schema = p.output_schema.schema;
    obj.output_schema = os;
  }

  const header = '#  ' + p.meta.name + '\n#\n';
  return header + '\n' + yaml.dump(obj, { indent: 2, lineWidth: 120, noCompatMode: true });
}

export function yamlToPrompt(yamlStr: string, id: string, source: Prompt['source'] = 'forked', forkedFrom?: string): Prompt | null {
  try {
    const clean = yamlStr.replace(/^#.*\n/gm, '');
    const obj = yaml.load(clean) as Record<string, unknown>;
    if (!obj || typeof obj !== 'object') return null;

    const metaObj = (obj.meta || {}) as Record<string, unknown>;
    const systemObj = (obj.system || {}) as Record<string, unknown>;

    const meta: PromptMeta = {
      name: String(metaObj.name || ''),
      nameZh: metaObj.nameZh ? String(metaObj.nameZh) : undefined,
      description: String(metaObj.description || ''),
      descriptionZh: metaObj.descriptionZh ? String(metaObj.descriptionZh) : undefined,
      tags: Array.isArray(metaObj.tags) ? metaObj.tags as string[] : [],
      platform: (String(metaObj.platform || 'codex')) as PromptMeta['platform'],
    };

    const variables: PromptVariable[] = Array.isArray(obj.variables)
      ? (obj.variables).map((v) => ({
          name: String(v.name || ''),
          label: String(v.label || ''),
          labelZh: v.labelZh ? String(v.labelZh) : undefined,
          type: String(v.type || 'string') as PromptVariable['type'],
          options: Array.isArray(v.options) ? v.options as string[] : undefined,
          optionsZh: Array.isArray(v.optionsZh) ? v.optionsZh as string[] : undefined,
          default: v.default,
          required: Boolean(v.required),
        }))
      : [];

    const system: PromptSystem = {
      role: String(systemObj.role || ''),
      roleZh: systemObj.roleZh ? String(systemObj.roleZh) : undefined,
      personality: systemObj.personality ? String(systemObj.personality) : undefined,
      personalityZh: systemObj.personalityZh ? String(systemObj.personalityZh) : undefined,
      rules: Array.isArray(systemObj.rules) ? systemObj.rules as string[] : undefined,
      rulesZh: Array.isArray(systemObj.rulesZh) ? systemObj.rulesZh as string[] : undefined,
      stop_rules: Array.isArray(systemObj.stop_rules) ? systemObj.stop_rules as string[] : undefined,
      stop_rulesZh: Array.isArray(systemObj.stop_rulesZh) ? systemObj.stop_rulesZh as string[] : undefined,
    };

    const user = String(obj.user || '');
    const userZh = obj.userZh ? String(obj.userZh) : undefined;

    const osObj = obj.output_schema as Record<string, unknown> | undefined;
    const output_schema: PromptOutputSchema | undefined = osObj
      ? { type: String(osObj.type || ''), schema: osObj.schema ? String(osObj.schema) : undefined }
      : undefined;

    return { id, yaml: yamlStr, meta, variables, system, user, userZh, output_schema, source, forkedFrom, createdAt: Date.now(), updatedAt: Date.now(), version: 1, versions: [] };
  } catch { return null; }
}

export function renderPrompt(p: Prompt, values: Record<string, string | boolean>, lang?: string): string {
  const isZh = lang === 'zh-CN';
  let user = (isZh && p.userZh) ? p.userZh : p.user;
  for (const v of p.variables) {
    const val = values[v.name] ?? v.default;
    if (val !== undefined && val !== null) user = user.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), String(val));
  }
  const parts: string[] = [];
  const role = (isZh && p.system.roleZh) ? p.system.roleZh : p.system.role;
  parts.push(`Role: ${role}`);
  const personality = (isZh && p.system.personalityZh) ? p.system.personalityZh : p.system.personality;
  if (personality) parts.push(isZh ? `个性：${personality}` : `Personality: ${personality}`);
  const rules = (isZh && p.system.rulesZh) ? p.system.rulesZh : p.system.rules;
  if (rules && rules.length > 0) {
    parts.push(isZh ? '规则：' : 'Rules:');
    rules.forEach(r => parts.push(`- ${r}`));
  }
  const stopRules = (isZh && p.system.stop_rulesZh) ? p.system.stop_rulesZh : p.system.stop_rules;
  if (stopRules && stopRules.length > 0) {
    parts.push(isZh ? '停止规则：' : 'Stop rules:');
    stopRules.forEach(r => parts.push(`- ${r}`));
  }
  if (p.output_schema) {
    parts.push(isZh ? `输出格式：${p.output_schema.type}` : `Output format: ${p.output_schema.type}`);
    if (p.output_schema.schema) parts.push(p.output_schema.schema);
  }
  parts.push(user);
  return parts.join('\n\n');
}

export function templateToCleanYaml(t: Prompt | Record<string, unknown>, lang?: string): string {
  const anyT = t as Prompt | Record<string, unknown>;
  if (t.meta && t.system) {
    const isZh = lang === 'zh-CN';
    const filtered: Record<string, unknown> = {
      id: (anyT as Record<string,unknown>).id || '',
      yaml: '',
      meta: {
        name: isZh && (anyT as Record<string,unknown>).meta.nameZh ? (anyT as Record<string,unknown>).meta.nameZh : (anyT as Record<string,unknown>).meta.name,
        description: isZh && (anyT as Record<string,unknown>).meta.descriptionZh ? (anyT as Record<string,unknown>).meta.descriptionZh : (anyT as Record<string,unknown>).meta.description,
        tags: (anyT as Record<string,unknown>).meta.tags,
        platform: (anyT as Record<string,unknown>).meta.platform,
      },
      system: {
        role: isZh && (anyT as Record<string,unknown>).system.roleZh ? (anyT as Record<string,unknown>).system.roleZh : (anyT as Record<string,unknown>).system.role,
        personality: isZh && (anyT as Record<string,unknown>).system.personalityZh ? (anyT as Record<string,unknown>).system.personalityZh : (anyT as Record<string,unknown>).system.personality,
        rules: isZh && (anyT as Record<string,unknown>).system.rulesZh ? (anyT as Record<string,unknown>).system.rulesZh : ((anyT as Record<string,unknown>).system.rules || []),
        stop_rules: isZh && (anyT as Record<string,unknown>).system.stop_rulesZh ? (anyT as Record<string,unknown>).system.stop_rulesZh : ((anyT as Record<string,unknown>).system.stop_rules || []),
      },
      user: isZh && (anyT as Record<string,unknown>).userZh ? (anyT as Record<string,unknown>).userZh : (anyT as Record<string,unknown>).user,
      variables: ((anyT as Record<string,unknown>).variables || []).map((v: PromptVariable) => ({
        name: v.name,
        label: isZh && v.labelZh ? v.labelZh : v.label,
        type: v.type,
        options: isZh && v.optionsZh ? v.optionsZh : v.options,
        default: v.default,
        required: v.required,
      })),
      source: t.source || 'library',
      createdAt: t.createdAt || Date.now(),
      updatedAt: Date.now(),
      version: t.version || 1,
      versions: [],
    };
    if ((anyT as Record<string,unknown>).output_schema) filtered.output_schema = (anyT as Record<string,unknown>).output_schema;
    return promptToYaml(filtered);
  }
  const isZh = lang === 'zh-CN';
  const a = t as Prompt;
  const meta = { name: (isZh && a.nameZh ? a.nameZh : a.name) || '', nameZh: a.nameZh || undefined, description: (isZh && a.shortZh ? a.shortZh : a.short) || '', descriptionZh: a.shortZh || undefined, tags: a.tags || a.category || [], platform: 'codex' as const };
  const system = { role: '', rules: [], rulesZh: [] };
  const user = (isZh && a.promptZh ? a.promptZh : a.prompt) || '';
  const userZh = a.promptZh || undefined;
  const variables = (a.variables || []).map((v) => ({ name: v.name || '', label: (isZh && v.labelZh ? v.labelZh : v.label) || '', labelZh: v.labelZh || undefined, type: v.type || 'string', options: (isZh && v.optionsZh ? v.optionsZh : v.options) || undefined, optionsZh: v.optionsZh || undefined, default: v.default, required: v.required }));
  return promptToYaml({ id: a.id || '', yaml: '', meta, variables, system, user, userZh, source: 'library', createdAt: Date.now(), updatedAt: Date.now(), version: 1, versions: [] });
}

export function yamlToTemplate(y: string, id: string): (Prompt & { name?: string; short?: string; description?: string; category?: string[]; tags?: string[]; difficulty?: string; prompt?: string; promptZh?: string }) | null {
  const p = yamlToPrompt(y, id, 'forked');
  if (!p) return null;
  return { ...p, name: p.meta.name, short: p.meta.description.slice(0, 80), description: p.meta.description, category: p.meta.tags, tags: p.meta.tags, difficulty: 'Intermediate' as const, prompt: p.user, promptZh: p.userZh, variables: p.variables.map(v => ({ name: v.name, label: v.label, labelZh: v.labelZh, type: v.type, options: v.options, optionsZh: v.optionsZh, default: v.default, required: v.required })) };
}

export const templateToYaml = templateToCleanYaml;