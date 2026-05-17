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
  "user": "## Task\nCreate compelling social media posts about {{topic}} for {{platform}}.\n\n## Requirements\n- Hook in the first line to grab attention\n- Include a clear call-to-action\n- Use appropriate tone for each platform\n- Twitter/X: max 280 characters, 1-2 relevant hashtags\n- LinkedIn: 3-5 paragraphs, professional tone, 3-5 hashtags\n\n## Output\nProvide the full post text plus a list of recommended hashtags for each platform.",
  "userZh": "## 目标\n为 {{topic}} 创建 {{platform}} 的社交媒体内容。\n\n## 要求\n- 首行要抓人眼球\n- 包含明确的行动号召（CTA）\n- 根据平台使用合适语调\n- Twitter/X：最多 280 字，1-2 个相关标签\n- 领英：3-5 段，专业语调，3-5 个标签\n\n## 输出\n提供完整帖文文案和推荐标签列表。",
  "output_schema": {
    "type": "markdown"
  },
  "expectedOutput": "A set of platform-optimized social media posts with hooks, body, hashtags, and media suggestions.",
  "expectedOutputZh": "一组适配各平台的社交媒体帖子，含钩子、正文、标签和媒体建议。",
  "category": [
    "writing"
  ],
  "difficulty": "Beginner",
  "mode": "single-turn",
  "usage_tips": "Mention links, images, or CTAs to include.",
  "usage_tipsZh": "注明需要包含的链接、图片或 CTA。"
};
