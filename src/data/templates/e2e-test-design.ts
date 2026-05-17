import type { LibraryTemplate } from '../../types';

export const e2eTestDesign: LibraryTemplate = {
  "id": "e2e-test-design",
  "meta": {
    "name": "E2E Test Design",
    "nameZh": "E2E 测试设计",
    "description": "Design end-to-end test scenarios covering critical user journeys",
    "descriptionZh": "设计端到端测试场景，覆盖关键用户旅程",
    "tags": [
      "testing",
      "e2e",
      "playwright",
      "cypress"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "tool",
      "label": "E2E Tool",
      "labelZh": "E2E 工具",
      "type": "enum",
      "options": [
        "Playwright",
        "Cypress",
        "Selenium",
        "Puppeteer"
      ],
      "optionsZh": [
        "Playwright",
        "Cypress",
        "Selenium",
        "Puppeteer"
      ],
      "default": "Playwright"
    }
  ],
  "system": {
    "role": "QA architect who designs realistic, maintainable E2E test suites",
    "roleZh": "测试架构师，设计真实且可维护的 E2E 测试套件",
    "personality": "Thorough and methodical, covering every branch without being pedantic",
    "personalityZh": "全面且有条理，覆盖每个分支但不钻牛角尖",
    "stop_rules": ["Do not test third-party library internals","If the source code is incomplete or missing dependencies, ask for the full context","If generating more than 20 test cases, confirm the scope with the user"],
    "stop_rulesZh": ["不要测试第三方库内部实现","如果源码不完整或缺少依赖，先要求完整上下文","如果测试用例超过 20 个，先确认范围"],
    "rules": [
      "Identify critical user journeys first",
      "Use data-testid attributes for selectors — never CSS classes",
      "Each test should be independent and runnable in parallel",
      "Add visual regression tests for key pages",
      "Keep tests fast — mock slow external services"
    ],
    "rulesZh": [
      "优先识别关键用户旅程",
      "使用 data-testid 属性做选择器——绝不用 CSS 类名",
      "每个测试应独立且可并行运行",
      "关键页面添加视觉回归测试",
      "保持测试快速——Mock 慢的外部服务"
    ]
  },
  "user": "## Task\nDesign an E2E test plan using {{tool}} for this application.\n\n## Requirements\nDesign an E2E test plan using {{tool}} for this application.\n\nInclude:\n1. Critical user journeys (top 5 flows)\n2. Test scenarios for each journey with given/when/then\n3. Selector strategy (data-testid naming convention)\n4. Test data management approach\n5. CI integration with parallel execution\n\n## Acceptance Criteria\n- [ ] Covers happy path, edge cases, and error paths\n- [ ] Each test is independent with clear name\n- [ ] Uses AAA pattern (Arrange, Act, Assert)\n- [ ] No test order dependencies\n\n## Constraints\n- Do not test third-party library internals\n- Do not use setTimeout for async — use async/await\n- Do not test private methods",
  "userZh": "## 目标\n使用 {{tool}} 为此应用设计 E2E 测试方案。\n\n## 要求\n使用 {{tool}} 为此应用设计 E2E 测试方案。\n\n包含：\n1. 关键用户旅程（前 5 个流程）\n2. 每个旅程的测试场景（given/when/then）\n3. 选择器策略（data-testid 命名规范）\n4. 测试数据管理方案\n5. 并行执行的 CI 集成方案\n\n## 验收标准\n- [ ] 覆盖正常路径、边界情况、错误路径\n- [ ] 每个测试独立且包含清晰的测试名称\n- [ ] 使用 AAA 模式（准备、执行、断言）\n- [ ] 不依赖测试执行顺序\n\n## 约束\n- 不要测试第三方库的内部实现\n- 不要用 setTimeout 等待异步操作——用 async/await\n- 不要测试私有方法",
  "output_schema": {
    "type": "code"
  },
  
  "expectedOutput": "An E2E test plan with user flows, test scenarios, selectors, and Playwright/Cypress scripts.",
  "expectedOutputZh": "一个E2E测试方案，包含用户流程、测试场景、选择器和Playwright/Cypress脚本。",
  "expectedDeliverables": ["Test plan document","E2E test scripts","Test data / fixtures","CI integration config"],
  "expectedDeliverablesZh": ["测试方案文档","E2E测试脚本","测试数据/Fixtures","CI集成配置"],
  "verified": true,
  "category": [
    "testing"
  ],
  "difficulty": "Advanced",
  "mode": "single-turn",
  "examples": "Input: Write tests for this user service module.\nOutput: 15 test cases covering unit, integration, error paths, and edge cases with setup/teardown.",
  "examplesZh": "输入：为这个用户服务模块编写测试。\n输出：15 个测试用例，覆盖单元测试、集成测试、错误路径和边界情况，含 setup/teardown。",
  "contextChecklist": ["Code module to test", "Testing framework", "Coverage targets"],
  "contextChecklistZh": ["待测试代码模块", "测试框架", "覆盖率目标"]
,
  "antiPatterns": ["Don't expect tests to pass without reviewing mocks", "Don't generate tests without understanding the code first"],
  "antiPatternsZh": ["不要不审查 Mock 就期望测试通过", "不要不理解代码就生成测试"]

};
