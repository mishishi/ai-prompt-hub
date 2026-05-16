# DESIGN.md - PromptBench Apple-Style Product Intro

## Style Prompt
Cupertino: True black canvas. White text only. Thin ultralight weight. Wide letter-spacing that breathes. Single words command the screen. Nothing competes for attention. Like an Apple keynote title card - premium, deliberate, quiet confidence.

## Colors
- Canvas: #000000 (true black)
- Text: #FFFFFF (pure white)
- Subtle: #86868B (Apple gray)
- Accent glow: #FFFFFF at 5 percent opacity

## Typography
- Primary: Inter Thin (100) or Light (300)
- Letter-spacing: 0.15em normal, animating to 0.05em tight
- Line-height: 1.0 for single words, 1.2 for phrases

## Motion Rules
- Entrances: power4.out - slow acceleration, precise landing
- Exits: power3.in - gradual fade
- Stagger: 0.4s minimum between independent elements
- Duration: 1.2s single word to 2.5s hero phrase
- Pause: 1.0s minimum between scenes
- No bounce, no elastic, no back

## Transitions
- Crossfade through black, 1.5s with 0.8s overlap

## Anti-patterns
- NO color accents - white on black only
- NO bold text - thin and light weights exclusively
- NO multiple elements entering simultaneously
- NO fast cuts - minimum 3s per scene
- NO text smaller than 24px on 1920x1080
- NO gradients, particles, or glow effects
## Prompt 效果评分系统

### 设计目的
为用户提供直观的 Prompt 质量信号，帮助发现高质量模板。通过加权计算模板的查看、复制、点赞数据，生成 0-100 的综合评分。

### 评分公式

```
raw_score = views * 1 + copies * 5 + likes * 3
recency_boost = 1.2 (最近 14 天有互动) 否则 1.0
score = min(round(raw_score * recency_boost), 100)
```

### 计算示例

| 场景 | views | copies | likes | recency | 原始分 | boost | 最终分 |
|------|-------|--------|-------|---------|--------|-------|--------|
| 新模板无互动 | 0 | 0 | 0 | - | 0 | 1.0 | 0 |
| 少量使用 | 10 | 2 | 1 | 活跃 | 23 | 1.2 | 28 |
| 热门模板 | 50 | 8 | 5 | 活跃 | 105 | 1.2 | 100 (封顶) |
| 旧模板活跃 | 20 | 3 | 2 | 不活跃 | 41 | 1.0 | 41 |

### 权重说明

| 信号 | 权重 | 理由 |
|------|------|------|
| copies (复制) | 5 | 最强质量信号 —— 用户实际使用该 Prompt |
| likes (点赞) | 3 | 主动正面反馈，表达认可意图 |
| views (查看) | 1 | 基础曝光信号，辅助区分零使用模板 |

### 显示规则

- 分数范围: 0-100，分数为 0 时不显示徽章
- 中文环境: {score}分，英文环境: {score}pts
- 颜色阈值: >=60 绿色 (成功), >=30 黄色 (警告), <30 灰色 (静音)
- 模板卡片: 右上角分数徽章，位于难度标签左侧
- 模板库排序: 支持「最高评分」降序排列
- Dashboard 排行榜: 待集成 (当前用 copies+views 混合排序)

### 数据来源

| 数据 | 来源 | 说明 |
|------|------|------|
| views | localStorage analytics events | 每次模板详情页打开记录 |
| copies | localStorage analytics events | 每次点击复制按钮记录 |
| likes | localStorage feedback | 用户 👍/👎 反馈 |
| 社区模板 copies | Neon DB community_templates | 社区模板复制计数 |
| 社区模板 likes | Neon DB community_templates | 社区模板点赞计数 |

### 实现文件

| 文件 | 职责 |
|------|------|
| src/utils/scoring.ts | calcScore(), aggregateEvents(), scoreDisplay(), scoreColor() |
| src/components/templates/TemplateCard.tsx | 接收 score prop, 显示分数徽章 |
| src/components/templates/TemplateBrowser.tsx | 计算 templateScores, 传入卡片, 提供评分排序 |
| src/components/dashboard/Dashboard.tsx | 待集成评分排序到排行榜 |

### 设计决策

1. **不使用 max_possible 归一化**: 因为无法预定义合理上限，直接用加权原始分，100 封顶天然合理
2. **0 分不显示**: 减少视觉噪音，新模板无数据时不展示空徽章
3. **recency_boost 1.2x**: 14 天内活跃的模板获得 20% 加权，让新热内容更容易被发现
4. **copies 权重最高 (5x)**: 复制是最强使用信号，比浏览或点赞更能反映模板实际价值