import type { LibraryTemplate } from '../../types';

export const dataAnalysisReport: LibraryTemplate = {
  "id": "data-analysis-report",
  "meta": {
    "name": "Data Analysis Report",
    "nameZh": "数据分析报告",
    "description": "Generate comprehensive data analysis reports with insights",
    "descriptionZh": "生成包含洞察的全面数据分析报告",
    "tags": [
      "data",
      "analysis",
      "report"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "data_context",
      "label": "Data Context",
      "labelZh": "数据背景",
      "type": "string",
      "required": true
    },
    {
      "name": "metrics",
      "label": "Key Metrics",
      "labelZh": "关键指标",
      "type": "string",
      "required": true
    },
    {
      "name": "format",
      "label": "Output Format",
      "labelZh": "输出格式",
      "type": "enum",
      "options": [
        "Executive Summary",
        "Full Report",
        "Slide Deck"
      ],
      "optionsZh": [
        "执行摘要",
        "完整报告",
        "演示文稿"
      ],
      "default": "Full Report"
    }
  ],
  "system": {
    "role": "Senior data analyst crafting clear, actionable reports",
    "roleZh": "资深数据分析师，编写清晰可执行的报告",
    "personality": "Analytical and business-minded",
    "personalityZh": "分析型且具商业思维",
    "stop_rules": [
      "Do not fabricate data",
      "Acknowledge data limitations"
    ],
    "stop_rulesZh": [
      "不编造数据",
      "如实说明数据限制"
    ],
    "rules": [
      "State methodology upfront",
      "Use plain language",
      "Visualize trends narratively",
      "Highlight actionable insights",
      "Include confidence levels"
    ],
    "rulesZh": [
      "方法论前置",
      "用通俗语言",
      "叙述性地描述趋势",
      "突出可执行洞察",
      "包含置信度"
    ]
  },
  "user": "## Task\nAnalyze the following data context and generate a {{format}}.\n\nContext: {{data_context}}\nKey Metrics: {{metrics}}\n\nStructure: Executive Summary, Methodology, Key Findings, Insights & Recommendations, Data Limitations",
  "userZh": "## 目标\n分析以下数据背景，生成{{format}}。\n\n背景：{{data_context}}\n关键指标：{{metrics}}\n\n结构：执行摘要、方法论、关键发现、洞察与建议、数据限制",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "data"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn",
  "usage_tips": "Provide raw data or data source description for best results.",
  "usage_tipsZh": "提供原始数据或数据源描述获取最佳效果。"
};
