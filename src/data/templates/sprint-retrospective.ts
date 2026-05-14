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
  "user": "## Task\nGenerate {{retro_format}} retro for {{sprint_name}}.\n\nAchievements: {{achievements}}\nChallenges: {{challenges}}\n\nOutput: Summary, what went well, what to improve, action items with owners.",
  "userZh": "## 目标\n为 {{sprint_name}} 生成 {{retro_format}} 回顾。\n\n成果：{{achievements}}\n挑战：{{challenges}}\n\n输出：摘要、进展顺利之处、改进方向、有负责人的行动项。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "product"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Include team feedback and metrics for deeper retro analysis.",
  "usage_tipsZh": "包含团队反馈和指标可获得更深入回顾。"
};
