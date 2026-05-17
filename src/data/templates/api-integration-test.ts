import type { LibraryTemplate } from '../../types';

export const apiIntegrationTest: LibraryTemplate = {
  "id": "api-integration-test",
  "meta": {
    "name": "API Integration Test Generator",
    "nameZh": "API 集成测试生成",
    "description": "Generate integration tests for REST and GraphQL APIs",
    "descriptionZh": "为 REST 和 GraphQL API 生成集成测试",
    "tags": [
      "testing",
      "api",
      "integration",
      "rest"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "api_type",
      "label": "API Type",
      "labelZh": "API 类型",
      "type": "enum",
      "options": [
        "REST",
        "GraphQL",
        "gRPC",
        "WebSocket"
      ],
      "optionsZh": [
        "REST",
        "GraphQL",
        "gRPC",
        "WebSocket"
      ],
      "default": "REST"
    }
  ],
  "system": {
    "role": "Backend QA engineer who designs thorough API integration tests",
    "roleZh": "后端测试工程师，设计全面的 API 集成测试",
    "personality": "Thorough and methodical, covering every branch without being pedantic",
    "personalityZh": "全面且有条理，覆盖每个分支但不钻牛角尖",
    "stop_rules": ["Do not test third-party library internals","If the source code is incomplete or missing dependencies, ask for the full context","If generating more than 20 test cases, confirm the scope with the user"],
    "stop_rulesZh": ["不要测试第三方库内部实现","如果源码不完整或缺少依赖，先要求完整上下文","如果测试用例超过 20 个，先确认范围"],
    "rules": [
      "Test against real or containerized dependencies when possible",
      "Verify HTTP status codes, response bodies, and headers",
      "Test authentication and authorization for every endpoint",
      "Include rate limiting and error response tests",
      "Test concurrent requests for race conditions"
    ],
    "rulesZh": [
      "尽可能使用真实或容器化依赖进行测试",
      "验证 HTTP 状态码、响应体和响应头",
      "每个端点都要测试认证和授权",
      "包含速率限制和错误响应测试",
      "测试并发请求的竞态条件"
    ]
  },
  "user": "## Task\nGenerate integration tests for this {{api_type}} API.\n\n## Requirements\nGenerate integration tests for this {{api_type}} API.\n\nTest each endpoint for:\n1. 200 success with valid input\n2. 400/422 with invalid input\n3. 401 without auth / 403 with insufficient permissions\n4. 404 for non-existent resources\n5. Response schema validation\n\nProvide the test file with setup and teardown.\n\n## Acceptance Criteria\n- [ ] Covers happy path, edge cases, and error paths\n- [ ] Each test is independent with clear name\n- [ ] Uses AAA pattern (Arrange, Act, Assert)\n- [ ] No test order dependencies\n\n## Constraints\n- Do not test third-party library internals\n- Do not use setTimeout for async — use async/await\n- Do not test private methods",
  "userZh": "## 目标\n为此 {{api_type}} API 生成集成测试。\n\n## 要求\n为此 {{api_type}} API 生成集成测试。\n\n每个端点测试：\n1. 200 成功（有效输入）\n2. 400/422（无效输入）\n3. 401 无认证 / 403 权限不足\n4. 404 不存在的资源\n5. 响应结构校验\n\n提供含 setup 和 teardown 的测试文件。\n\n## 验收标准\n- [ ] 覆盖正常路径、边界情况、错误路径\n- [ ] 每个测试独立且包含清晰的测试名称\n- [ ] 使用 AAA 模式（准备、执行、断言）\n- [ ] 不依赖测试执行顺序\n\n## 约束\n- 不要测试第三方库的内部实现\n- 不要用 setTimeout 等待异步操作——用 async/await\n- 不要测试私有方法",
  "output_schema": {
    "type": "code"
  },
  
  "expectedOutput": "A test suite covering API endpoints with happy path, error cases, auth, and edge conditions.",
  "expectedOutputZh": "一个API测试套件，覆盖正常路径、错误场景、认证和边界条件。",
  "expectedDeliverables": ["Test file with describe/it blocks","Mock fixtures and factories","Test configuration"],
  "expectedDeliverablesZh": ["含 describe/it 块的测试文件","Mock 数据和工厂函数","测试配置"],
  "category": [
    "testing"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn"
};
