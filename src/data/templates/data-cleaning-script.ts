import type { LibraryTemplate } from '../../types';

export const dataCleaningScript: LibraryTemplate = {
  "id": "data-cleaning-script",
  "meta": {
    "name": "Data Cleaning Script",
    "nameZh": "数据清洗脚本",
    "description": "Generate scripts to clean and preprocess messy datasets",
    "descriptionZh": "生成清洗和预处理脏数据的脚本",
    "tags": [
      "data",
      "cleaning",
      "python"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "file_format",
      "label": "File Format",
      "labelZh": "文件格式",
      "type": "enum",
      "options": [
        "CSV",
        "JSON",
        "Excel",
        "Parquet"
      ],
      "optionsZh": [
        "CSV",
        "JSON",
        "Excel",
        "Parquet"
      ],
      "default": "CSV"
    },
    {
      "name": "issues",
      "label": "Data Issues",
      "labelZh": "数据问题",
      "type": "string",
      "required": true
    },
    {
      "name": "language",
      "label": "Language",
      "labelZh": "编程语言",
      "type": "enum",
      "options": [
        "Python",
        "R",
        "SQL"
      ],
      "optionsZh": [
        "Python",
        "R",
        "SQL"
      ],
      "default": "Python"
    }
  ],
  "system": {
    "role": "Data engineer writing robust cleaning pipelines",
    "roleZh": "数据工程师，编写稳定的清洗管道",
    "personality": "Pragmatic and thorough",
    "personalityZh": "务实且全面",
    "stop_rules": [
      "Never drop data silently",
      "Always log transformations"
    ],
    "stop_rulesZh": [
      "不静默删除数据",
      "始终记录转换操作"
    ],
    "rules": [
      "Handle nulls explicitly",
      "Detect and handle outliers",
      "Normalize column names",
      "Validate data types",
      "Add summary statistics"
    ],
    "rulesZh": [
      "显式处理空值",
      "检测处理异常值",
      "规范化列名",
      "验证数据类型",
      "添加汇总统计"
    ]
  },
  "user": "## Task\nWrite a {{language}} script to clean and preprocess {{file_format}} data.\n\n## Data Issues to Address\n{{issues}}\n\n## Requirements\n- Handle NULL values explicitly (fill, drop, or flag)\n- Detect and handle outliers with statistical methods\n- Normalize column names (snake_case)\n- Validate and cast data types\n- Print summary statistics before and after cleaning\n- Log all transformations for audit trail\n\n## Output\nProvide the complete script with: 1) Imports 2) Load function 3) Clean function 4) Validate function 5) Save function 6) Example usage",
  "userZh": "## 目标\n编写 {{language}} 脚本清洗 {{file_format}} 数据。\n\n## 需处理的数据问题\n{{issues}}\n\n## 要求\n- 显式处理 NULL 值（填充、删除或标记）\n- 使用统计方法检测和处理异常值\n- 规范化列名（使用 snake_case）\n- 验证并转换数据类型\n- 输出清洗前后的汇总统计\n- 记录所有转换操作用于审计追溯\n\n## 输出\n提供完整脚本，包含：1) 导入 2) 加载函数 3) 清洗函数 4) 验证函数 5) 保存函数 6) 使用示例",
  "output_schema": {
    "type": "markdown"
  },
  "category": [
    "data"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn",
  "usage_tips": "Describe data issues in detail for more precise cleaning logic.",
  "usage_tipsZh": "详细描述数据问题可获得更精准的清洗逻辑。"
};
