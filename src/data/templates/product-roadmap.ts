import type { LibraryTemplate } from '../../types';

export const productRoadmap: LibraryTemplate = {
  "id": "product-roadmap",
  "meta": {
    "name": "Product Roadmap Builder",
    "nameZh": "产品路线图构建",
    "description": "Build product roadmaps with timeline and priority",
    "descriptionZh": "构建带时间线和优先级的产品路线图",
    "tags": [
      "product",
      "roadmap",
      "planning"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "vision",
      "label": "Product Vision",
      "labelZh": "产品愿景",
      "type": "string",
      "required": true
    },
    {
      "name": "timeframe",
      "label": "Timeframe",
      "labelZh": "时间范围",
      "type": "enum",
      "options": [
        "Q1",
        "Q2",
        "Q3",
        "Q4",
        "Next 6 months",
        "Next 12 months"
      ],
      "optionsZh": [
        "Q1",
        "Q2",
        "Q3",
        "Q4",
        "未来 6 个月",
        "未来 12 个月"
      ],
      "default": "Next 6 months"
    },
    {
      "name": "resources",
      "label": "Team Capacity",
      "labelZh": "团队容量",
      "type": "string",
      "required": false
    }
  ],
  "system": {
    "role": "Product manager building executable roadmaps",
    "roleZh": "产品经理，构建可执行路线图",
    "personality": "Pragmatic and timeline-aware",
    "personalityZh": "务实且注重时间",
    "stop_rules": [
      "Do not overpromise delivery dates",
      "Balance quick wins vs platform"
    ],
    "stop_rulesZh": [
      "不过度承诺交付日期",
      "平衡速赢和平台建设"
    ],
    "rules": [
      "Now-Next-Later structure",
      "Theme-based grouping",
      "Dependency mapping",
      "Success metrics per theme",
      "Risk register"
    ],
    "rulesZh": [
      "现在-下一步-之后结构",
      "按主题分组",
      "依赖关系映射",
      "每个主题的成功指标",
      "风险登记"
    ]
  },
  "user": "## Task\nBuild a {{timeframe}} roadmap for: {{vision}}\n\nTeam capacity: {{resources}}\n\nOutput: Now/Next/Later items, themes, milestones, dependencies, risks.",
  "userZh": "## 目标\n为 {{vision}} 构建 {{timeframe}} 路线图。\n\n团队容量：{{resources}}\n\n输出：现在/下一步/之后事项、主题、里程碑、依赖、风险。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "product"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn",
  "usage_tips": "List existing commitments and tech debt for realistic planning.",
  "usage_tipsZh": "列出已有承诺和技术债务可实现更现实规划。"
};
