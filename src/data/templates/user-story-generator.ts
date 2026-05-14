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
  "user": "## Task\nGenerate user stories for: {{feature}}\n\nPersona: {{persona}} | Format: {{format}}\n\nOutput: 3-5 well-formed stories with acceptance criteria.",
  "userZh": "## 目标\n为 {{feature}} 生成用户故事。\n\n用户画像：{{persona}} | 格式：{{format}}\n\n输出：3-5 个完善的故事及验收标准。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "product"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Describe pain points and desired outcome for richer stories.",
  "usage_tipsZh": "描述痛点和期望结果可获得更丰富故事。"
};
