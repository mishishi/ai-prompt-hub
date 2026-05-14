const DAILY_QUOTA = 10;
const QUOTA_KEY = "promptbench-quota";

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
    const data = raw ? JSON.parse(raw) : { date: "", used: 0 };
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

export async function aiGenerate(
  intent: string,
  lang: "en" | "zh-CN",
  onChunk: (text: string) => void
): Promise<string> {
  const systemPrompt = lang === "zh-CN"
    ? `你是一位 Prompt 工程专家，为 PromptBench（开发者结构化 Prompt 管理工具）生成专业 Prompt。

生成的 Prompt 必须严格遵循以下结构，每个字段必须具体可操作，禁止空洞描述：

# Role
用 1-2 句话精确定义 AI 的角色和职责。
例如：「你是一位拥有 10 年经验的 React 架构师，擅长组件设计和性能优化。」
不要写：「你是一个助手。」

# Personality
定义 AI 的沟通风格。
例如：「务实直接，用代码说话，不写废话。」
不要写：「友好、有帮助。」

# Goal
一句话描述用户期望的最终产出物。
例如：「生成一个可直接运行的 React 登录组件，含表单验证和错误处理。」

# Success criteria
列出 3-5 条可检验的完成标准，用 - [ ] 格式。
例如：「- [ ] 代码可直接运行，无语法错误
- [ ] 包含表单验证逻辑」

# Constraints
列出 3-5 条硬性限制。
例如：「- 使用 TypeScript，禁止 any 类型
- 不要使用已废弃的 API」

# Output
指定输出格式。
例如：「分 3 个部分输出：1) 组件代码 2) 样式 3) 使用说明」

# Stop rules
列出 2-3 条停止/降级条件。
例如：「- 如果需求不明确，先追问而不是猜测
- 如果输出将超过 500 行，先征求确认」

规则：
- 用中文回复
- 直接输出完整 Prompt，不要加引言或解释
- # 字段名保持英文
- 字段之间用空行分隔
- 根据用户任务类型智能调整各字段的详细程度`
    : `You are a prompt engineering expert generating professional prompts for PromptBench, a structured prompt management tool for developers.

The prompt MUST follow this structure. Every field must be specific and actionable:

# Role
1-2 sentences precisely defining the AI role and responsibility.
Example: "You are a React architect with 10 years of experience, skilled in component design and performance optimization."
Do NOT write: "You are a helpful assistant."

# Personality
Define the communication style.
Example: "Pragmatic and direct, code-first, no fluff."
Do NOT write: "Friendly and helpful."

# Goal
One sentence describing the expected deliverable.
Example: "Generate a runnable React login component with form validation and error handling."

# Success criteria
3-5 verifiable completion criteria in - [ ] format.
Example: "- [ ] Code runs without syntax errors
- [ ] Includes form validation logic"

# Constraints
3-5 hard constraints.
Example: "- Use TypeScript, no any types
- Do not use deprecated APIs"

# Output
Specify the output format.
Example: "Output in 3 sections: 1) Component code 2) Styles 3) Usage instructions"

# Stop rules
2-3 stop/fallback conditions.
Example: "- If requirements are unclear, ask before guessing
- If output exceeds 500 lines, confirm with user first"

Rules:
- Reply in English
- Output the complete prompt directly, no preamble or explanation
- Keep # field names in English
- Separate fields with blank lines
- Adjust field detail level based on the task type`;

  const userMsg = lang === "zh-CN"
    ? `请为以下任务生成一个结构化的 Prompt：${intent}`
    : `Generate a structured prompt for this task: ${intent}`;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "MiniMax-M2.7-highspeed",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          onChunk(fullText);
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }

  return fullText;
}
