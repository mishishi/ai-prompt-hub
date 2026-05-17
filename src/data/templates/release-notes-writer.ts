import type { LibraryTemplate } from '../../types';

export const releaseNotesWriter: LibraryTemplate = {
  "id": "release-notes-writer",
  "meta": {
    "name": "Release Notes Writer",
    "nameZh": "发布说明撰写",
    "description": "Professional release notes highlighting new features",
    "descriptionZh": "突出新功能的专业发布说明",
    "tags": [
      "writing",
      "release"
    ],
    "platform": "gpt"
  },
  "variables": [
    {
      "name": "release_name",
      "label": "Release Name",
      "labelZh": "发布名称",
      "type": "string",
      "required": true
    },
    {
      "name": "highlights",
      "label": "Highlights",
      "labelZh": "核心亮点",
      "type": "string",
      "required": true
    },
    {
      "name": "audience",
      "label": "Audience",
      "labelZh": "受众",
      "type": "enum",
      "options": [
        "End users",
        "Developers",
        "Enterprise"
      ],
      "optionsZh": [
        "终端用户",
        "开发者",
        "企业客户"
      ],
      "default": "End users"
    }
  ],
  "system": {
    "role": "Product marketing writer",
    "roleZh": "产品营销写手",
    "personality": "Enthusiastic but factual",
    "personalityZh": "热情但实事求是",
    "stop_rules": [
      "Do not overpromise",
      "Verify numbers before publishing"
    ],
    "stop_rulesZh": [
      "不过度承诺",
      "发布前确认数据"
    ],
    "rules": [
      "Lead with impact",
      "Bullet-point features",
      "Add Getting Started for major features",
      "Include upgrade instructions",
      "Thank contributors"
    ],
    "rulesZh": [
      "以影响力开头",
      "要点列出功能",
      "重大功能加快速入门",
      "包含升级指引",
      "感谢贡献者"
    ]
  },
  "user": "## Task\nWrite release notes for {{release_name}}.\n\nHighlights: {{highlights}} | Audience: {{audience}}\n\nInclude: Summary, New Features, Improvements, Bug Fixes, Upgrade Notes",
  "userZh": "## 目标\n为 {{release_name}} 写发布说明。\n\n亮点：{{highlights}} | 受众：{{audience}}\n\n包含：概览、新功能、改进、修复、升级指引",
  "output_schema": {
    "type": "markdown"
  },
  "expectedOutput": "Release notes with version, highlights, breaking changes, new features, and upgrade guide.",
  "expectedOutputZh": "一份发布说明，包含版本号、亮点、破坏性变更、新功能和升级指南。",
  "category": [
    "writing"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn",
  "usage_tips": "Include feature names and metrics if available.",
  "usage_tipsZh": "包含功能名称和指标。",
  "examples": "Input: Generate API documentation from this OpenAPI spec.\nOutput: Developer-friendly docs with endpoint descriptions, request/response examples, auth setup, and error handling guide.",
  "examplesZh": "输入：根据此 OpenAPI 规范生成 API 文档。\n输出：开发者友好的文档，含端点描述、请求/响应示例、认证设置和错误处理指南。",
  "contextChecklist": ["Source code or spec to document", "Documentation format preference", "Target audience (internal, public)"],
  "contextChecklistZh": ["待文档化的源代码或规范", "文档格式偏好", "目标受众（内部、公开）"]

};
