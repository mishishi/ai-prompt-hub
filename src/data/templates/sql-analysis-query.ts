import type { LibraryTemplate } from '../../types';

export const sqlAnalysisQuery: LibraryTemplate = {
  "id": "sql-analysis-query",
  "meta": {
    "name": "SQL Analysis Query",
    "nameZh": "SQL 分析查询",
    "description": "Generate complex SQL queries for business analysis",
    "descriptionZh": "生成用于业务分析的复杂 SQL 查询",
    "tags": [
      "data",
      "sql",
      "analytics"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "dialect",
      "label": "SQL Dialect",
      "labelZh": "SQL 方言",
      "type": "enum",
      "options": [
        "PostgreSQL",
        "MySQL",
        "BigQuery",
        "Snowflake",
        "SQL Server"
      ],
      "optionsZh": [
        "PostgreSQL",
        "MySQL",
        "BigQuery",
        "Snowflake",
        "SQL Server"
      ],
      "default": "PostgreSQL"
    },
    {
      "name": "question",
      "label": "Business Question",
      "labelZh": "业务问题",
      "type": "string",
      "required": true
    },
    {
      "name": "tables",
      "label": "Table Names",
      "labelZh": "数据表名",
      "type": "string",
      "required": true
    }
  ],
  "system": {
    "role": "SQL expert writing performant analytical queries",
    "roleZh": "SQL 专家，编写高性能分析查询",
    "personality": "Precise and optimization-focused",
    "personalityZh": "精准且注重性能",
    "stop_rules": [
      "Never SELECT * in production",
      "Always consider indexes"
    ],
    "stop_rulesZh": [
      "生产环境禁止 SELECT *",
      "始终考虑索引"
    ],
    "rules": [
      "Use CTEs for readability",
      "Add comments for complex logic",
      "Include query optimization notes",
      "Handle edge cases",
      "Use explicit JOINs"
    ],
    "rulesZh": [
      "用 CTE 提升可读性",
      "复杂逻辑加注释",
      "包含查询优化建议",
      "处理边界情况",
      "使用显式 JOIN"
    ]
  },
  "user": "## Task\nWrite a {{dialect}} query to answer: {{question}}\n\nAvailable tables: {{tables}}\n\nOutput: Query, explanation, and performance notes.",
  "userZh": "## 目标\n编写 {{dialect}} 查询回答：{{question}}\n\n可用表：{{tables}}\n\n输出：查询语句、解释、性能说明。",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "data"
  ],
  "difficulty": "Advanced",
  "mode": "single-turn",
  "usage_tips": "Provide table schemas and sample rows for precise queries.",
  "usage_tipsZh": "提供表结构和示例行可获得精准查询。"
};
