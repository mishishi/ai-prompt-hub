import type { LibraryTemplate } from '../../types';

export function tName(t: LibraryTemplate, lang?: string): string {
  return (lang === 'zh-CN' && t.meta.nameZh) ? t.meta.nameZh : t.meta.name;
}
export function tShort(t: LibraryTemplate, lang?: string): string {
  return (lang === 'zh-CN' && t.meta.descriptionZh) ? t.meta.descriptionZh : t.meta.description;
}
export function tDesc(t: LibraryTemplate, lang?: string): string | undefined {
  return (lang === 'zh-CN' && t.meta.descriptionZh) ? t.meta.descriptionZh : t.meta.description;
}
export function tTips(t: LibraryTemplate, lang?: string): string | undefined {
  return (lang === 'zh-CN' && t.usage_tipsZh) ? t.usage_tipsZh : t.usage_tips;
}
export function tLabel(v: { label: string; labelZh?: string }, lang?: string): string {
  return (lang === 'zh-CN' && v.labelZh) ? v.labelZh : v.label;
}
export function tOptions(v: { options?: string[]; optionsZh?: string[] }, lang?: string): string[] {
  return (lang === 'zh-CN' && v.optionsZh) ? v.optionsZh : (v.options || []);
}
export function tStage(s: any, lang?: string): string { return s?.stage || ''; }
export function tSkillWhen(s: any, lang?: string): string { return s?.when || ''; }
export function tSkillHow(s: any, lang?: string): string { return s?.how || ''; }