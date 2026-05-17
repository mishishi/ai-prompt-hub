import type { LibraryTemplate, Prompt, Platform } from '../types';
import { fillVars } from './fill';

function isZh(lang: string): boolean { return lang === 'zh-CN'; }

export function renderPrompt(t: LibraryTemplate | Prompt, lang: string, values: Record<string, string | boolean | string[]>): string {
  // Handle Prompt type
  if ('meta' in t && 'system' in t) {
    const p = t as Prompt;
    const zh = isZh(lang);
    let user = (zh && p.userZh) ? p.userZh : p.user;
    for (const v of p.variables) {
      const val = values[v.name] ?? v.default;
      if (val !== undefined && val !== null) {
        user = user.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), String(val));
      }
    }
    const parts: string[] = [];
    const role = (zh && p.system.roleZh) ? p.system.roleZh : p.system.role;
    parts.push(`Role: ${role}`);
    const personality = (zh && p.system.personalityZh) ? p.system.personalityZh : p.system.personality;
    if (personality) parts.push(zh ? `个性：${personality}` : `Personality: ${personality}`);
    const rules = (zh && p.system.rulesZh && p.system.rulesZh.length > 0) ? p.system.rulesZh : p.system.rules;
    if (rules && rules.length > 0) {
      parts.push(zh ? '规则：' : 'Rules:');
      rules.forEach(r => parts.push(`- ${r}`));
    }
    const stopRules = (zh && p.system.stop_rulesZh && p.system.stop_rulesZh.length > 0) ? p.system.stop_rulesZh : p.system.stop_rules;
    if (stopRules && stopRules.length > 0) {
      parts.push(zh ? '停止规则：' : 'Stop rules:');
      stopRules.forEach(r => parts.push(`- ${r}`));
    }
    if (p.output_schema) {
      parts.push(zh ? `输出格式：${p.output_schema.type}` : `Output format: ${p.output_schema.type}`);
      if (p.output_schema.schema) parts.push(p.output_schema.schema);
    }
    parts.push(user);
    return parts.join('\n\n');
  }

  // Handle LibraryTemplate type
  const lt = t as LibraryTemplate;
  const zh = isZh(lang);
  const userText = (zh && lt.userZh) ? lt.userZh : lt.user;
  const filled = fillVars(userText, lt.variables, values);
  const parts: string[] = [];
  const role = (zh && lt.system.roleZh) ? lt.system.roleZh : lt.system.role;
  parts.push(zh ? `角色：${role}` : `Role: ${role}`);
  const personality = (zh && lt.system.personalityZh) ? lt.system.personalityZh : lt.system.personality;
  if (personality) parts.push(zh ? `个性：${personality}` : `Personality: ${personality}`);
  const ltRules = (zh && lt.system.rulesZh && lt.system.rulesZh.length > 0) ? lt.system.rulesZh : lt.system.rules;
  if (ltRules && ltRules.length > 0) {
    parts.push(zh ? '规则：' : 'Rules:');
    ltRules.forEach(r => parts.push(`- ${r}`));
  }
  const ltStopRules = (zh && lt.system.stop_rulesZh && lt.system.stop_rulesZh.length > 0) ? lt.system.stop_rulesZh : lt.system.stop_rules;
  if (ltStopRules && ltStopRules.length > 0) {
    parts.push(zh ? '停止规则：' : 'Stop rules:');
    ltStopRules.forEach(r => parts.push(`- ${r}`));
  }
  if (lt.output_schema) {
    parts.push(zh ? `输出格式：${lt.output_schema.type}` : `Output format: ${lt.output_schema.type}`);
    if (lt.output_schema.schema) parts.push(lt.output_schema.schema);
  }
  parts.push(filled);
  return parts.join('\n\n');
}

export function getPlatformLabel(p: Platform): string {
  const labels: Record<Platform, string> = { codex: 'Codex', claude: 'Claude Code', gpt: 'ChatGPT' };
  return labels[p] || p;
}