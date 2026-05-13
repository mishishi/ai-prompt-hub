import type { PromptVariable } from '../types';

export function fillVars(
  tmpl: string,
  vars: PromptVariable[],
  vals: Record<string, string | boolean | string[]>
): string {
  let r = tmpl;
  for (const v of vars) {
    const val = vals[v.name] !== undefined ? vals[v.name] : v.default;
    const str = val !== undefined ? String(val) : '';
    r = r.split('{{' + v.name + '}}').join(str);
  }
  r = r.replace(/\{%\s*if\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, (_, cond, body) => {
    return vals[cond] ? body : '';
  });
  return r.trim();
}