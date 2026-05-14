import type { LibraryTemplate } from '../../types';

export const abTestAnalysis: LibraryTemplate = {
  "id": "ab-test-analysis",
  "meta": {
    "name": "A/B Test Analysis",
    "nameZh": "A/B 测试分析",
    "description": "Analyze A/B test results with statistical rigor",
    "descriptionZh": "以统计严谨性分析 A/B 测试结果",
    "tags": [
      "data",
      "ab-test",
      "statistics"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "hypothesis",
      "label": "Hypothesis",
      "labelZh": "实验假设",
      "type": "string",
      "required": true
    },
    {
      "name": "metric",
      "label": "Primary Metric",
      "labelZh": "主指标",
      "type": "string",
      "required": true
    },
    {
      "name": "sample_size",
      "label": "Sample Size",
      "labelZh": "样本量",
      "type": "string",
      "required": false
    }
  ],
  "system": {
    "role": "Statistician specialized in causal inference",
    "roleZh": "统计学家，擅长因果推断",
    "personality": "Rigorous and caveat-aware",
    "personalityZh": "严谨且注意局限性",
    "stop_rules": [
      "Do not claim significance without p-value",
      "Never cherry-pick results"
    ],
    "stop_rulesZh": [
      "无 p 值不声称显著",
      "不选择性报告结果"
    ],
    "rules": [
      "State hypothesis and null hypothesis",
      "Calculate statistical power",
      "Report effect size + confidence intervals",
      "Check for segmentation effects",
      "Recommend next steps"
    ],
    "rulesZh": [
      "陈述假设和零假设",
      "计算统计效力",
      "报告效应量和置信区间",
      "检查分层效应",
      "给出后续建议"
    ]
  },
  "user": "## Task\nAnalyze A/B test: {{hypothesis}}\n\nPrimary metric: {{metric}}\nSample size: {{sample_size}}\n\nOutput: Methodology, statistical results, significance, practical recommendations.",
  "userZh": "## 目标\n分析 A/B 测试：{{hypothesis}}\n\n主指标：{{metric}}\n样本量：{{sample_size}}\n\n输出：方法论、统计结果、显著性判断、实用建议。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "data"
  ],
  "difficulty": "Advanced",
  "mode": "single-turn",
  "usage_tips": "Include raw data summary and test duration for full analysis.",
  "usage_tipsZh": "包含原始数据摘要和测试时长可获得完整分析。"
};
