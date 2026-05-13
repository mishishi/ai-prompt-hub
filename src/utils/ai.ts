const DAILY_QUOTA = 10;
const QUOTA_KEY = 'promptbench-quota';

interface QuotaData {
  date: string;
  used: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadQuota(): QuotaData {
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    const data = raw ? JSON.parse(raw) : { date: '', used: 0 };
    if (data.date !== getToday()) return { date: getToday(), used: 0 };
    return data;
  } catch { return { date: getToday(), used: 0 }; }
}

function saveQuota(q: QuotaData) {
  localStorage.setItem(QUOTA_KEY, JSON.stringify(q));
}

export function useQuota(): boolean {
  const q = loadQuota();
  if (q.used >= DAILY_QUOTA) return false;
  q.used++;
  saveQuota(q);
  return true;
}

export async function aiGenerate(intent: string, lang: 'en' | 'zh-CN'): Promise<string> {
  const systemPrompt = lang === 'zh-CN'
    ? `你是一个世界级 Prompt 工程专家。用户会描述他们的开发任务，你需要按照以下标准结构生成专业的 Prompt。\n\n你必须严格遵循这个结构：\n\n# Role\n[1-2 句话定义模型的职能、上下文和任务]\n\n# Personality\n[语气、态度和协作风格]\n\n# Goal\n[用户可见的最终成果]\n\n# Success criteria\n[最终回答必须满足的条件]\n\n# Constraints\n[策略、安全、业务、边界限制]\n\n# Output\n[输出的章节、长度和语气要求]\n\n# Stop rules\n[何时重试、降级、放弃、询问或停止]\n\n\n规则：\n- 用中文回复\n- 每个字段必须具体、可操作，不要写泛泛的空话\n- 字段名称（如 # Role, # Personality 等）保持英文原样\n- 不要加多余的解释，直接输出完整 Prompt\n- 确保每个 # 字段之间用空行分隔`
    : `You are a world-class prompt engineering expert. The user will describe their dev task, and you need to generate a professional prompt following this exact structure.\n\nYou MUST follow this structure:\n\n# Role\n[1-2 sentences defining the model function, context, and job]\n\n# Personality\n[tone, demeanor, and collaboration style]\n\n# Goal\n[user-visible outcome]\n\n# Success criteria\n[what must be true before the final answer]\n\n# Constraints\n[policy, safety, business, evidence, and side-effect limits]\n\n# Output\n[sections, length, and tone]\n\n# Stop rules\n[when to retry, fallback, abstain, ask, or stop]\n\n\nRules:\n- Reply in English\n- Every field must be specific and actionable, no vague filler\n- Keep field names (e.g., # Role, # Personality) in English\n- Do not add extra explanation, output the complete prompt directly\n- Ensure each # field is separated by a blank line`;

  const userMsg = lang === 'zh-CN'
    ? `请为以下任务生成一个结构化的 Prompt：${intent}`
    : `Generate a structured prompt for this task: ${intent}`;

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'MiniMax-M2.7-highspeed',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}