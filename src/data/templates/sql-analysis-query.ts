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
  "user": "## Task\nWrite a {{dialect}} SQL query to answer the following business question.\n\n## Question\n{{question}}\n\n## Available Tables\n{{tables}}\n\n## Requirements\n- Use CTEs for complex logic to improve readability\n- Add inline comments explaining non-obvious logic\n- Handle NULLs and edge cases explicitly\n- Consider query performance (index usage, avoid full table scans)\n\n## Output\nProvide: 1) The complete SQL query 2) A brief explanation of the approach 3) Performance notes (index recommendations, expected execution plan)",
  "userZh": "## 目标\n编写 {{dialect}} 查询，回答以下业务问题。\n\n## 问题\n{{question}}\n\n## 可用数据表\n{{tables}}\n\n## 要求\n- 使用 CTE 处理复杂逻辑，提升可读性\n- 为非显而易见的逻辑添加行内注释\n- 显式处理 NULL 值和边界情况\n- 考虑查询性能（索引利用，避免全表扫描）\n\n## 输出\n提供：1) 完整 SQL 查询 2) 方案简述 3) 性能说明（索引建议、预期执行计划）",
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
