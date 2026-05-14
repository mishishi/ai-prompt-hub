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
  "user": "## Task\nDesign dashboard metrics for {{domain}}.\n\nBusiness Goals: {{goals}} | Tool: {{tool}}\n\nOutput: North Star metric, KPI tree, visualization suggestions, alert rules.",
  "userZh": "## 目标\n为 {{domain}} 设计仪表板指标。\n\n业务目标：{{goals}} | 工具：{{tool}}\n\n输出：北极星指标、KPI 树、可视化建议、预警规则。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "data"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn",
  "usage_tips": "Describe user segments and data sources for richer metrics.",
  "usage_tipsZh": "描述用户分层和数据源可获得更丰富的指标。"
};
