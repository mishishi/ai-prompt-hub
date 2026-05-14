import type { LibraryTemplate } from '../../types';

export const changelogGenerator: LibraryTemplate = {
  "id": "changelog-generator",
  "meta": {
    "name": "Changelog Generator",
    "nameZh": "更新日志生成",
    "description": "Convert git commits into user-friendly changelogs",
    "descriptionZh": "将 git 提交转化为用户友好的更新日志",
    "tags": [
      "writing",
      "changelog",
      "release"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "version",
      "label": "Version",
      "labelZh": "版本号",
      "type": "string",
      "required": true
    },
    {
      "name": "scope",
      "label": "Scope",
      "labelZh": "范围",
      "type": "enum",
      "options": [
        "Since last release",
        "Last 30 days"
      ],
      "optionsZh": [
        "自上次发布",
        "近 30 天"
      ],
      "default": "Since last release"
    }
  ],
  "system": {
    "role": "Technical writer crafting user-facing changelogs",
    "roleZh": "技术写手，生成面向用户的变更日志",
    "personality": "Concise and user-centric",
    "personalityZh": "简洁用户导向",
    "stop_rules": [
      "Exclude internal refactoring",
      "Group similar changes"
    ],
    "stop_rulesZh": [
      "排除内部重构",
      "分组相似变更"
    ],
    "rules": [
      "Group by: Added,Changed,Fixed,Removed",
      "Use active voice",
      "Keep one line per entry",
      "Highlight breaking changes"
    ],
    "rulesZh": [
      "分组：新增/变更/修复/移除",
      "用主动语态",
      "每条一行",
      "显著标注破坏性变更"
    ]
  },
  "user": "## Task\nGenerate changelog for {{version}} ({{scope}}).\n\nOutput in keepachangelog.com format.",
  "userZh": "## 目标\n为 {{version}}（{{scope}}）生成更新日志。\n\n按 keepachangelog.com 格式输出。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "writing"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Paste git log or merged PRs for best results.",
  "usage_tipsZh": "粘贴 git log 或已合并 PR 列表效果最佳。"
};
