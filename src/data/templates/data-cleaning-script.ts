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
  "user": "## Task\nWrite a {{language}} script to clean {{file_format}} data.\n\nIssues to address: {{issues}}\n\nInclude: null handling, outlier detection, type casting, validation checks",
  "userZh": "## 目标\n编写{{language}}脚本清洗{{file_format}}数据。\n\n需处理的问题：{{issues}}\n\n包含：空值处理、异常值检测、类型转换、验证检查",
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
