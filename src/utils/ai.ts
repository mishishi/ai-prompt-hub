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
    ? `你是一个 Prompt 工程专家。用户会描述他们的开发任务，你需要生成一个专业、结构化的 Prompt。

规则：
- 用用户的语言回复
- 生成完整的 system prompt + user prompt
- 包含角色定义、约束条件、输出格式要求
- 不要加多余的解释，直接输出 Prompt 内容`
    : `You are a prompt engineering expert. The user will describe their dev task, and you need to generate a professional, structured prompt.

Rules:
- Reply in the user's language
- Generate a complete system prompt + user prompt
- Include role definition, constraints, and output format requirements
- Do not add extra explanation, output the prompt directly`;

  const userMsg = lang === 'zh-CN'
    ? `请为以下任务生成一个专业的 Prompt：${intent}`
    : `Generate a professional prompt for this task: ${intent}`;

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