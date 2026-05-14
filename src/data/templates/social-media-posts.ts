import type { LibraryTemplate } from '../../types';

export const socialMediaPosts: LibraryTemplate = {
  "id": "social-media-posts",
  "meta": {
    "name": "Social Media Posts Generator",
    "nameZh": "社交媒体内容生成",
    "description": "Generate platform-specific social media posts",
    "descriptionZh": "生成各平台适配的社交媒体内容",
    "tags": [
      "writing",
      "social-media"
    ],
    "platform": "gpt"
  },
  "variables": [
    {
      "name": "topic",
      "label": "Topic",
      "labelZh": "主题",
      "type": "string",
      "required": true
    },
    {
      "name": "platform",
      "label": "Platform",
      "labelZh": "平台",
      "type": "enum",
      "options": [
        "Twitter/X",
        "LinkedIn",
        "All"
      ],
      "optionsZh": [
        "Twitter/X",
        "LinkedIn",
        "全部"
      ],
      "default": "All"
    }
  ],
  "system": {
    "role": "Social media strategist",
    "roleZh": "社交媒体策略师",
    "personality": "Platform-native tone",
    "personalityZh": "贴合平台调性",
    "stop_rules": [
      "No clickbait",
      "Use hashtags sparingly"
    ],
    "stop_rulesZh": [
      "不用标题党",
      "适量使用标签"
    ],
    "rules": [
      "Twitter/X: max 280 chars",
      "LinkedIn: 3-5 paragraphs",
      "Hook in first line",
      "End with CTA"
    ],
    "rulesZh": [
      "Twitter/X：最多 280 字",
      "LinkedIn：3-5 段",
      "首行要抓人",
      "以 CTA 结尾"
    ]
  },
  "user": "## Task\nCreate social posts about {{topic}} for {{platform}}.\n\nOutput text + hashtags for each platform.",
  "userZh": "## 目标\n为 {{topic}} 创建 {{platform}} 社交媒体内容。\n\n输出每个平台的帖文和标签。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "writing"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Mention links, images, or CTAs to include.",
  "usage_tipsZh": "注明需要包含的链接、图片或 CTA。"
};
