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

export function getRemainingQuota(): number {
  const q = loadQuota();
  return Math.max(0, DAILY_QUOTA - q.used);
}

export async function aiGenerate(
  intent: string,
  lang: "en" | "zh-CN",
  onChunk: (text: string) => void,
  refineContext?: { previousResult: string; feedback: string }
): Promise<string> {
  const systemPrompt = lang === "zh-CN"
    ? `你是一位 Prompt 工程专家，为 PromptBench（开发者结构化 Prompt 管理工具）生成专业 Prompt。

生成的 Prompt 至少包含以下 7 个核心字段作为基础结构。但你的目标是生成一个「开箱即用」的高质量 Prompt，所以请根据任务类型，智能添加以下扩展字段：

# Examples（适用所有任务）
提供 1-2 个简短的输入→输出示例，展示期望的效果。
格式：「Input: xxx
Expected output: xxx」

# Context Checklist（适用需要用户提供上下文的场景）
列出用户使用该 Prompt 前应准备的材料清单。
格式：「- [ ] 准备 xxx
- [ ] 确认 xxx」

# Anti-patterns（适用复杂/高风险任务）
列出 2-3 个常见错误或误用方式。
格式：「- ❌ 不要只给结论不给证据
- ❌ 不要跳过错误处理」

# Quality Gates（适用交付物可验证的任务）
交付前自我检查清单。
格式：「- [ ] 输出可直接运行
- [ ] 每个建议有具体代码」

# Model Notes（适用模型差异敏感的任务）
标注该 Prompt 的目标模型及注意事项。
格式：「优化于 Claude/GPT/通用」

---

核心字段（必须有）：

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

如果提供了 refineContext，说明用户对上一次生成的 Prompt 不满意。请根据 feedback 修改上一版 Prompt，只修改不满意的部分，保留其余内容。

规则：
- 用中文回复
- 直接输出完整 Prompt，不要加引言或解释
- # 字段名保持英文
- 字段之间用空行分隔
- 根据用户任务类型智能调整各字段的详细程度
- 核心 7 字段是底线必须覆盖，扩展字段（Examples/Context Checklist/Anti-patterns/Quality Gates/Model Notes）根据场景智能添加，宁可多不可少
- 根据用户的 feedback 针对性调整，不要大改结构`
    : `You are a prompt engineering expert generating professional prompts for PromptBench, a structured prompt management tool for developers.

The prompt must include these 7 core sections as baseline. But your goal is to generate a production-ready prompt. Go beyond the minimum — intelligently add these extensions based on the task:

# Examples (recommended for all tasks)
Provide 1-2 short input→output pairs showing expected results.
Format: "Input: xxx
Expected output: xxx"

# Context Checklist (when user needs to prepare materials)
List materials to prepare before using this prompt.
Format: "- [ ] Prepare xxx
- [ ] Confirm xxx"

# Anti-patterns (for complex/high-risk tasks)
List 2-3 common mistakes or misuse patterns.
Format: "- DO NOT give conclusions without evidence
- DO NOT skip error handling"

# Quality Gates (when output is verifiable)
Pre-delivery self-check list.
Format: "- [ ] Output can run directly
- [ ] Each suggestion includes concrete code"

# Model Notes (when model choice matters)
Note target model and caveats.
Format: "Optimized for Claude/GPT/General"

---

Core sections (required):

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

If refineContext is provided, the user is not satisfied with the previous prompt. Revise it based on the feedback — only change what they asked, keep everything else.

Rules:
- Reply in English
- Output the complete prompt directly, no preamble or explanation
- Keep # field names in English
- Separate fields with blank lines
- Adjust field detail level based on the task type
- 7 core sections are the baseline, extensions (Examples/Context Checklist/Anti-patterns/Quality Gates/Model Notes) are encouraged — when in doubt, add more
- Target only issues mentioned in the feedback, do not overhaul the entire prompt`;

  const userMsg = refineContext
    ? (lang === "zh-CN"
      ? `原始任务：${intent}

上一版 Prompt：
${refineContext.previousResult}

用户修改意见：${refineContext.feedback}

请根据以上意见重新生成改进后的 Prompt。`
      : `Original task: ${intent}

Previous prompt:
${refineContext.previousResult}

User feedback: ${refineContext.feedback}

Please regenerate the improved prompt based on the feedback above.`)
    : lang === "zh-CN"
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

export async function evaluatePrompt(
  promptText: string,
  lang: "en" | "zh-CN",
  onChunk: (text: string) => void
): Promise<string> {
  const system = lang === "zh-CN"
    ? "你是一位 Prompt 质量评审专家。请对以下 Prompt 进行评分和改进建议。用以下格式回复：Score: <0-100>\n✅ <优点1>\n✅ <优点2>\n⚠️ <可改进1>\n⚠️ <可改进2>\n💡 <建议1>\n💡 <建议2>"
    : "You are a prompt quality reviewer. Score the following prompt and provide improvement suggestions. Reply in this format: Score: <0-100>\n✅ <strength1>\n✅ <strength2>\n⚠️ <improvement1>\n⚠️ <improvement2>\n💡 <suggestion1>\n💡 <suggestion2>";

  const userMsg = lang === "zh-CN" ? `请评审以下 Prompt：\n\n${promptText}` : `Please evaluate this prompt:\n\n${promptText}`;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "MiniMax-M2.7-highspeed",
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error?.message || `API error ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let full = "";
  const buffer: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    buffer.push(chunk);
    const text = buffer.join("");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try {
        const j = JSON.parse(data);
        const content = j.choices?.[0]?.delta?.content || "";
        full += content;
      } catch {}
    }
    buffer.length = 0;
    buffer.push(lines[lines.length - 1]);
    onChunk(full);
  }
  return full;
}
