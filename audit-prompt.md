对项目进行 12 个维度的全面审计。先完整阅读项目代码，再逐维度输出结构化报告。

## 输出格式

每条发现包含：
- Severity: P0 CRITICAL / P1 HIGH / P2 MEDIUM / P3 LOW
- 文件: path/to/file:line
- 问题: 一句话描述
- 修复: 具体可执行的方案

按 Severity 降序排列（P0 -> P3），每节内按文件分组。

## Severity 标准

P0 CRITICAL  = 安全漏洞 / 数据泄露 / 认证失效 / 部署即故障 (上线阻断)
P1 HIGH      = 竞态 / 数据不一致 / 安全绕过 / API 无认证 (上线前修)
P2 MEDIUM    = 功能缺陷 / 可访问性 / 错误处理缺失 / SEO 问题 (短期内修)
P3 LOW       = 性能 / 代码重复 / 架构优化 / UX 改进建议 (进迭代)

## 12 个审计维度

### 1. 安全 Security (P0/P1)
- 所有用户输入是否有校验且非空、有长度限制
- SQL 是否全部参数化（无字符串拼接 SQL）
- XSS：是否使用 dangerouslySetInnerHTML / innerHTML
- 认证：受保护路由是否有服务端 session 验证
- 敏感信息：console 是否泄漏 token、密码、用户数据
- 环境变量：.env.example 是否完整；VITE_ 前缀是否过度暴露
- CORS：是否硬编码 origin / 允许任意来源
- 依赖安全：是否有已知漏洞的过期依赖

### 2. API / 后端 (P0/P1/P2)
- HTTP 方法和状态码是否符合 REST 惯例
- 错误响应格式是否统一
- 速率限制：全局 + 关键路由差异化
- 数据验证：所有输入点是否有 Schema 校验
- 分页：列表 API 是否有 limit/offset
- 幂等性：重复写是否安全
- 超时：fetch 是否有 AbortSignal.timeout

### 3. 数据库 / 数据层 (P1/P2)
- TOCTOU 竞态：先查后写是否在事务中
- 多表操作是否用数据库事务
- Schema 变更是否有幂等迁移脚本
- 连接管理：懒初始化、连接池
- 高频查询字段是否有索引

### 4. 正确性 (P1/P2)
- Async 是否有 try/catch，finally 恢复 UI
- 乐观更新失败是否有回滚
- 排序/过滤/分页边界（空结果、末页）
- JSON 序列化一致（Date、null vs undefined）
- 多 Tab 并发安全

### 5. 可访问性 Accessibility (P2)
- 表单输入有关联 label 或 aria-label
- 纯图标按钮有 aria-label
- 焦点状态可见（:focus-visible 样式）
- 动态内容有 aria-live
- 颜色对比度 >= 4.5:1（正文）
- 图像有 alt；装饰图空 alt + 父级 aria-label

### 6. 错误 / 加载 / 空状态 (P2)
- 所有异步操作处理 loading / error / empty 三态
- API 错误用户有反馈（toast / 重试）
- 网络断开 / 超时有提示
- 空状态有引导 UI（不是白屏）

### 7. SEO / 社交分享 (P2)
- title 每页动态设置
- og:title/og:description/og:image 完整且文件存在
- canonical URL
- 语义化 HTML（main/article/nav）
- SPA 爬虫友好性

### 8. 前端代码质量 (P3)
- 组件单一职责
- 代码重复：>= 3 处应抽取
- 硬编码是否应抽取为常量/环境变量
- localStorage key 等魔法字符串是否集中管理
- 注释只在必要时添加

### 9. 性能 (P3)
- 大列表（>100 项）虚拟化
- 重复计算 useMemo
- 图片 lazy loading
- fetch AbortSignal timeout
- useCallback / React.memo 合理使用
- prefers-reduced-motion 支持

### 10. 架构与可维护性 (P3)
- 目录结构是否按职责分组
- API 层与 UI 层分离
- 类型覆盖率（any 越少越好）
- 文件行数合理（<500 行）
- 是否有多套代码做同一件事

### 11. 响应式 / 移动端 (P3)
- 375px / 768px / 1440px 断点
- 触摸目标 >= 44x44px
- 横竖屏切换
- 移动端导航可用性

### 12. 产品功能完整性 (P3，建议)
- 核心用户流程完整性
- placeholder / TODO 标记
- 边界：首次使用、空数据、断网
- 与竞品对比缺失功能

## 排除规则

以下不是 Bug，不要报告：

Accessibility:
  alt='' + 父 aria-label = 合规（装饰图）
  htmlFor + sr-only label = 等效 aria-labelledby
  箭头键导航 = 可选增强

React:
  非 state 变量（ref/模块级）闭包 = 无陈旧问题
  handler 未 useCallback = 风格选择
  useEffect(fn, []) = 正确无依赖时

错误处理:
  async 内已有 try/catch = 无需外层再包
  fetch 已有 timeout = 已有超时

业务/架构:
  rate limit 默认值 = 可接受
  静态数据文件 = 内容数据
  第三方 SDK 行为 = 非本项目范围

API 设计:
  缓存 5min = 合理
  REST 路径命名 = 风格偏好

## 执行要求

1. 先完整阅读项目文件结构和技术栈
2. 每条发现必须有 文件:行号，禁止泛泛而谈
3. Severity 从严 - 宁可高报安全漏洞
4. P3 合并同类问题
5. 存疑问题必须读文件验证后才报告
6. UX/产品建议标注 [建议]
7. 结尾列出排除的误报及理由
