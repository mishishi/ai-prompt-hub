import type { LibraryTemplate } from '../../types';

export const dashboardMetrics: LibraryTemplate = {
  "id": "dashboard-metrics",
  "meta": {
    "name": "Dashboard Metrics Designer",
    "nameZh": "仪表板指标设计",
    "description": "Design key metrics and KPI frameworks for dashboards",
    "descriptionZh": "为仪表板设计关键指标和 KPI 框架",
    "tags": [
      "data",
      "dashboard",
      "kpi"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "domain",
      "label": "Domain",
      "labelZh": "业务领域",
      "type": "string",
      "required": true
    },
    {
      "name": "goals",
      "label": "Business Goals",
      "labelZh": "业务目标",
      "type": "string",
      "required": true
    },
    {
      "name": "tool",
      "label": "BI Tool",
      "labelZh": "BI 工具",
      "type": "enum",
      "options": [
        "Metabase",
        "Superset",
        "Tableau",
        "Grafana",
        "Custom"
      ],
      "optionsZh": [
        "Metabase",
        "Superset",
        "Tableau",
        "Grafana",
        "自定义"
      ],
      "default": "Metabase"
    }
  ],
  "system": {
    "role": "BI architect designing actionable dashboard metrics",
    "roleZh": "BI 架构师，设计可执行仪表板指标",
    "personality": "Business-outcome driven",
    "personalityZh": "以业务成果为导向",
    "stop_rules": [
      "Avoid vanity metrics",
      "Limit to 5-7 KPIs per dashboard"
    ],
    "stop_rulesZh": [
      "避免虚荣指标",
      "每个仪表板 5-7 个 KPI"
    ],
    "rules": [
      "Define North Star metric first",
      "Group metrics by user journey",
      "Include leading and lagging indicators",
      "Set alert thresholds",
      "Document calculation formulas"
    ],
    "rulesZh": [
      "先定义北极星指标",
      "按用户旅程分组",
      "包含先导和滞后指标",
      "设置预警阈值",
      "记录计算公式"
    ]
  },
  "user": "## Task\nDesign a dashboard metrics framework for {{domain}}.\n\n## Business Goals\n{{goals}}\n\n## BI Tool\n{{tool}}\n\n## Requirements\n- Define the North Star metric first (the one metric that matters most)\n- Create a KPI tree (leading + lagging indicators)\n- Group metrics by user journey stage\n- Set alert thresholds for critical metrics\n- Document calculation formulas for each metric\n\n## Output\nProvide: 1) North Star metric definition 2) KPI hierarchy tree 3) Dashboard layout suggestion 4) Alert rules 5) Formula reference",
  "userZh": "## 目标\n为 {{domain}} 设计仪表板指标框架。\n\n## 业务目标\n{{goals}}\n\n## BI 工具\n{{tool}}\n\n## 要求\n- 首先定义北极星指标（最重要的那个指标）\n- 创建 KPI 树（先导指标 + 滞后指标）\n- 按用户旅程阶段分组指标\n- 为关键指标设置预警阈值\n- 记录每个指标的计算公式\n\n## 输出\n提供：1) 北极星指标定义 2) KPI 层级树 3) 仪表板布局建议 4) 预警规则 5) 公式参考",
  "output_schema": {
    "type": "markdown"
  },
  "expectedOutput": "A dashboard metrics strategy document with KPIs, data sources, visualization recommendations, and alert thresholds.",
  "expectedOutputZh": "一份仪表盘指标策略文档，包含KPI定义、数据源、可视化建议和告警阈值。",
  "category": [
    "data"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn",
  "usage_tips": "Describe user segments and data sources for richer metrics.",
  "usage_tipsZh": "描述用户分层和数据源可获得更丰富的指标。",
  "examples": "Input: Optimize this slow SQL query joining 5 tables.\nOutput: Rewritten query with proper indexes, EXPLAIN analysis, and 10x performance improvement.",
  "examplesZh": "输入：优化这个联表 5 张的慢 SQL 查询。\n输出：重写查询，含正确索引、EXPLAIN 分析和 10 倍性能提升。",
  "contextChecklist": ["Query or schema to optimize", "Database engine and version", "Current performance metrics"],
  "contextChecklistZh": ["待优化的查询或 Schema", "数据库引擎和版本", "当前性能指标"]
,
  "antiPatterns": ["Don't run queries without checking execution plans", "Don't optimize without measuring first"],
  "antiPatternsZh": ["不要不检查执行计划就运行查询", "不要不测量就优化"]

};
