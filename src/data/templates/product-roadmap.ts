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
  "user": "## Task\nBuild a {{timeframe}} product roadmap based on the following vision.\n\n## Vision\n{{vision}}\n\n## Context\nTeam capacity: {{resources}}\n\n## Requirements\n- Structure as Now / Next / Later\n- Group items by strategic theme\n- Map dependencies between initiatives\n- Define success metrics for each theme\n- Include a risk register (top 3 risks with mitigation)\n\n## Output\nProvide: 1) Strategic themes 2) Now/Next/Later timeline 3) Key milestones 4) Dependency map 5) Risk register",
  "userZh": "## 目标\n基于以下愿景构建 {{timeframe}} 产品路线图。\n\n## 愿景\n{{vision}}\n\n## 背景\n团队容量：{{resources}}\n\n## 要求\n- 以 现在/下一步/之后 结构组织\n- 按战略主题分组\n- 映射各项之间的依赖关系\n- 为每个主题定义成功指标\n- 包含风险登记（前 3 个风险及缓解方案）\n\n## 输出\n提供：1) 战略主题 2) 现在/下一步/之后时间线 3) 关键里程碑 4) 依赖关系图 5) 风险登记",
  "output_schema": {
    "type": "markdown"
  },
  "expectedOutput": "A product roadmap with timeline, milestones, dependencies, and success metrics.",
  "expectedOutputZh": "一份产品路线图，包含时间线、里程碑、依赖关系和成功指标。",
  "category": [
    "product"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn",
  "usage_tips": "List existing commitments and tech debt for realistic planning.",
  "usage_tipsZh": "列出已有承诺和技术债务可实现更现实规划。"
};
