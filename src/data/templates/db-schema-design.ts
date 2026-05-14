import type { LibraryTemplate } from '../../types';

export const dbSchemaDesign: LibraryTemplate = {
  "id": "db-schema-design",
  "meta": {
    "name": "Database Schema Design",
    "nameZh": "数据库 Schema 设计",
    "description": "Design normalized database schemas with indexes and migrations",
    "descriptionZh": "设计规范化的数据库 Schema，含索引和迁移方案",
    "tags": [
      "database",
      "schema",
      "sql",
      "postgresql"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "db",
      "label": "Database",
      "labelZh": "数据库",
      "type": "enum",
      "options": [
        "PostgreSQL",
        "MySQL",
        "SQLite",
        "MongoDB"
      ],
      "optionsZh": [
        "PostgreSQL",
        "MySQL",
        "SQLite",
        "MongoDB"
      ],
      "default": "PostgreSQL"
    },
    {
      "name": "domain",
      "label": "Domain",
      "labelZh": "业务领域",
      "type": "string",
      "default": "e-commerce",
      "required": true
    }
  ],
  "system": {
    "role": "Database architect who designs performant, normalized schemas",
    "roleZh": "数据库架构师，设计高性能且规范化的表结构",
    "personality": "Pragmatic architect — chooses the simplest solution that meets requirements",
    "personalityZh": "务实架构师——选择满足需求的最简方案",
    "stop_rules": ["Do not over-engineer — start with the minimal viable design","If requirements are ambiguous, propose 2 options instead of assuming one","Never suggest breaking changes without a migration path"],
    "stop_rulesZh": ["不要过度设计——从最小可用设计开始","如果需求不明确，给出 2 个选项而非假设","永远不要建议破坏性变更而不提供迁移路径"],
    "rules": [
      "Normalize to 3NF by default — denormalize only with reason",
      "Add indexes for every foreign key and frequent query pattern",
      "Use appropriate column types — never VARCHAR for everything",
      "Include created_at and updated_at on every table",
      "Design migrations to be forward and backward compatible",
      "Consider query patterns before adding indexes"
    ],
    "rulesZh": [
      "默认遵循 3NF——反规范化必须有充分理由",
      "每个外键和常用查询模式都要建索引",
      "使用合适的列类型——永远不要全用 VARCHAR",
      "每张表都加 created_at 和 updated_at",
      "设计的迁移要支持前进和回滚",
      "加索引前先考虑查询模式"
    ]
  },
  "user": "## Task\nDesign a {{db}} schema for a {{domain}} application.\n\n## Requirements\nDesign a {{db}} schema for a {{domain}} application.\n\nProvide:\n1. Entity relationship description\n2. All tables with columns, types, constraints\n3. Indexes with reasoning\n4. Migration strategy\n5. Sample queries for common operations\n\n## Acceptance Criteria\n- [ ] Resource model fields and types are complete\n- [ ] API follows RESTful conventions\n- [ ] Includes error response format and status codes\n- [ ] Has pagination/sorting/filtering strategy\n\n## Constraints\n- Do not use verbs in resource names — use plural nouns\n- Do not return 200 for errors\n- Do not mix inconsistent response formats",
  "userZh": "## 目标\n为 {{domain}} 应用设计 {{db}} 数据库 Schema。\n\n## 要求\n为 {{domain}} 应用设计 {{db}} 数据库 Schema。\n\n请提供：\n1. 实体关系描述\n2. 所有表的列、类型、约束\n3. 索引及原因说明\n4. 迁移策略\n5. 常用操作的示例查询\n\n## 验收标准\n- [ ] 资源模型字段和类型完整清晰\n- [ ] 接口符合 RESTful 规范\n- [ ] 包含错误响应格式和状态码\n- [ ] 有分页/排序/筛选方案\n\n## 约束\n- 不要用动词命名资源——用复数名词\n- 错误时不要返回 200 状态码\n- 不要混用不同的响应格式",
  "output_schema": {
    "type": "code"
  },
  
  "category": [
    "architecture"
  ],
  "difficulty": "Advanced",
  "mode": "single-turn"
};
