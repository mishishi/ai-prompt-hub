import type { LibraryTemplate } from '../../types';

export const sprintRetrospective: LibraryTemplate = {
  "id": "sprint-retrospective",
  "meta": {
    "name": "Sprint Retrospective",
    "nameZh": "Sprint 回顾总结",
    "description": "Generate structured sprint retrospective reports",
    "descriptionZh": "生成结构化 Sprint 回顾报告",
    "tags": [
      "product",
      "agile",
      "retro"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "sprint_name",
      "label": "Sprint Name",
      "labelZh": "Sprint 名称",
      "type": "string",
      "required": true
    },
    {
      "name": "achievements",
      "label": "Key Achievements",
      "labelZh": "关键成果",
      "type": "string",
      "required": true
    },
    {
      "name": "challenges",
      "label": "Challenges",
      "labelZh": "遇到的挑战",
      "type": "string",
      "required": true
    },
    {
      "name": "retro_format",
      "label": "Format",
      "labelZh": "格式",
      "type": "enum",
      "options": [
        "Start/Stop/Continue",
        "Mad/Sad/Glad",
        "4Ls",
        "Sailboat"
      ],
      "optionsZh": [
        "开始/停止/继续",
        "气/悲/喜",
        "4L",
        "帆船模型"
      ],
      "default": "Start/Stop/Continue"
    }
  ],
  "system": {
    "role": "Scrum master facilitating effective retrospectives",
    "roleZh": "Scrum Master，引导高效回顾",
    "personality": "Empathetic and action-oriented",
    "personalityZh": "有同理心且行动导向",
    "stop_rules": [
      "No blame culture",
      "Focus on process, not people"
    ],
    "stop_rulesZh": [
      "不指责文化",
      "关注流程非个人"
    ],
    "rules": [
      "Celebrate wins first",
      "Identify root causes",
      "Action items with owners",
      "Track carry-over from last retro",
      "Team health check"
    ],
    "rulesZh": [
      "先庆祝成果",
      "识别根因",
      "行动项有人负责",
      "追踪上次回顾遗留项",
      "团队健康检查"
    ]
  },
  "user": "## Task\nGenerate a {{retro_format}} sprint retrospective for {{sprint_name}}.\n\n## Key Achievements\n{{achievements}}\n\n## Challenges Faced\n{{challenges}}\n\n## Requirements\n- Celebrate wins and acknowledge contributions first\n- Identify root causes for challenges, not just symptoms\n- Create specific action items with owners and deadlines\n- Track carry-over items from the previous retrospective\n- Include a brief team health check\n\n## Output\nProvide: 1) Summary 2) What went well 3) What to improve 4) Action items with owners 5) Team health score",
  "userZh": "## 目标\n为 {{sprint_name}} 生成 {{retro_format}} 回顾总结。\n\n## 关键成果\n{{achievements}}\n\n## 遇到的挑战\n{{challenges}}\n\n## 要求\n- 首先庆祝成果并肯定团队贡献\n- 识别挑战的根本原因而非表面症状\n- 创建具体的行动项，附带负责人和截止日期\n- 追踪上次回顾的遗留事项\n- 包含简短的团队健康检查\n\n## 输出\n提供：1) 摘要 2) 进展顺利之处 3) 改进方向 4) 含负责人的行动项 5) 团队健康评分",
  "output_schema": {
    "type": "markdown"
  },
  "expectedOutput": "A sprint retrospective document with what went well, what to improve, action items, and team health metrics.",
  "expectedOutputZh": "一份Sprint回顾文档，包含做得好、需改进、行动项和团队健康指标。",
  "category": [
    "product"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Include team feedback and metrics for deeper retro analysis.",
  "usage_tipsZh": "包含团队反馈和指标可获得更深入回顾。",
  "examples": "Input: Write a PRD for a mobile payment feature.\nOutput: Structured PRD with problem statement, user personas, functional requirements, non-functional requirements, success metrics, and timeline.",
  "examplesZh": "输入：为移动支付功能撰写 PRD。\n输出：结构化 PRD，含问题陈述、用户画像、功能需求、非功能需求、成功指标和时间线。",
  "contextChecklist": ["Product context and goals", "User research or feedback available", "Stakeholder requirements"],
  "contextChecklistZh": ["产品背景和目标", "可用的用户研究或反馈", "利益相关者需求"]

};
