import type { LibraryTemplate } from '../../types';

export const userStoryGenerator: LibraryTemplate = {
  "id": "user-story-generator",
  "meta": {
    "name": "User Story Generator",
    "nameZh": "用户故事生成器",
    "description": "Generate well-structured user stories from feature ideas",
    "descriptionZh": "从功能想法生成结构良好的用户故事",
    "tags": [
      "product",
      "agile",
      "user-story"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "feature",
      "label": "Feature Idea",
      "labelZh": "功能想法",
      "type": "string",
      "required": true
    },
    {
      "name": "persona",
      "label": "Target Persona",
      "labelZh": "目标用户",
      "type": "string",
      "required": true
    },
    {
      "name": "format",
      "label": "Format",
      "labelZh": "格式",
      "type": "enum",
      "options": [
        "As a...I want...So that...",
        "Gherkin",
        "Job Story"
      ],
      "optionsZh": [
        "作为...我想要...以便...",
        "Gherkin",
        "Job Story"
      ],
      "default": "As a...I want...So that..."
    }
  ],
  "system": {
    "role": "Agile product owner writing crisp user stories",
    "roleZh": "敏捷产品负责人，编写清晰用户故事",
    "personality": "User-obsessed and outcome-driven",
    "personalityZh": "以用户为中心、以结果为导向",
    "stop_rules": [
      "No implementation details in stories",
      "One action per story"
    ],
    "stop_rulesZh": [
      "故事不含实现细节",
      "每个故事一个动作"
    ],
    "rules": [
      "Include acceptance criteria",
      "Define Done conditions",
      "Estimate story points",
      "Link to business value",
      "Consider edge cases"
    ],
    "rulesZh": [
      "包含验收标准",
      "定义完成条件",
      "估算故事点",
      "关联业务价值",
      "考虑边缘情况"
    ]
  },
  "user": "## Task\nGenerate well-formed user stories for the following feature idea.\n\n## Feature\n{{feature}}\n\n## Target Persona\n{{persona}}\n\n## Format\n{{format}}\n\n## Requirements\n- Each story must include acceptance criteria\n- Define clear Done conditions\n- Consider both happy path and edge cases\n- Link each story to specific business value\n\n## Output\nGenerate 3-5 complete user stories. For each story include: Title, Story statement, Acceptance criteria (3-5 items), Priority (P0/P1/P2), Effort estimate (S/M/L)",
  "userZh": "## 目标\n为以下功能想法生成完善的用户故事。\n\n## 功能\n{{feature}}\n\n## 目标用户画像\n{{persona}}\n\n## 格式\n{{format}}\n\n## 要求\n- 每个故事必须包含验收标准\n- 定义明确的完成条件\n- 同时考虑正常流程和边缘情况\n- 为每个故事关联具体的业务价值\n\n## 输出\n生成 3-5 个完整用户故事。每个故事包含：标题、故事陈述、验收标准（3-5 条）、优先级（P0/P1/P2）、工作量估算（小/中/大）",
  "output_schema": {
    "type": "markdown"
  },
  "expectedOutput": "Well-formed user stories following the \"As a... I want... So that...\" format with acceptance criteria.",
  "expectedOutputZh": "符合\"As a... I want... So that...\"格式的完整用户故事，附带验收标准。",
  "category": [
    "product"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Describe pain points and desired outcome for richer stories.",
  "usage_tipsZh": "描述痛点和期望结果可获得更丰富故事。"
};
