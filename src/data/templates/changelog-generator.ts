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
  "user": "## Task\nGenerate a changelog for version {{version}} ({{scope}}).\n\n## Input\nProvide the list of commits, merged PRs, or release notes since the last release.\n\n## Output Structure\n- Group entries by category: Added, Changed, Fixed, Removed, Security\n- One line per change, active voice\n- Highlight breaking changes with a warning prefix\n- Follow keepachangelog.com format\n\n## Example\n### Added\n- Support for OAuth 2.0 social login\n### Fixed\n- Race condition in session timeout handler",
  "userZh": "## 目标\n为版本 {{version}}（{{scope}}）生成更新日志。\n\n## 输入\n提供自上次发布以来的 commit 列表、合并 PR 或发布说明。\n\n## 输出结构\n- 按分类归组：新增、变更、修复、移除、安全\n- 每条一行，主动语态\n- 破坏性变更用警告前缀标注\n- 遵循 keepachangelog.com 格式\n\n## 示例\n### 新增\n- 支持 OAuth 2.0 社交登录\n### 修复\n- 修复 session 超时处理中的竞态条件",
  "output_schema": {
    "type": "markdown"
  },
  "expectedOutput": "A well-formatted changelog following Keep a Changelog conventions, with Added/Changed/Fixed/Removed sections.",
  "expectedOutputZh": "一份遵循 Keep a Changelog 规范的变更日志，按新增/变更/修复/移除分类。",
  "category": [
    "writing"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Paste git log or merged PRs for best results.",
  "usage_tipsZh": "粘贴 git log 或已合并 PR 列表效果最佳。",
  "examples": "Input: Generate API documentation from this OpenAPI spec.\nOutput: Developer-friendly docs with endpoint descriptions, request/response examples, auth setup, and error handling guide.",
  "examplesZh": "输入：根据此 OpenAPI 规范生成 API 文档。\n输出：开发者友好的文档，含端点描述、请求/响应示例、认证设置和错误处理指南。",
  "contextChecklist": ["Source code or spec to document", "Documentation format preference", "Target audience (internal, public)"],
  "contextChecklistZh": ["待文档化的源代码或规范", "文档格式偏好", "目标受众（内部、公开）"]
,
  "antiPatterns": ["Don't generate docs without reviewing accuracy", "Don't forget to update docs when code changes"],
  "antiPatternsZh": ["不要不审查准确性就生成文档", "不要代码变更后忘记更新文档"]

};
