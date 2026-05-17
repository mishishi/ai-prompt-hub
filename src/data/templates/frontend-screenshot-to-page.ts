import type { LibraryTemplate } from '../../types';

export const frontendScreenshotToPage: LibraryTemplate = {
  "id": "frontend-screenshot-to-page",
  "meta": {
    "name": "Screenshot to Page",
    "nameZh": "截图转前端页面",
    "description": "Convert a design screenshot into production-ready frontend code",
    "descriptionZh": "将设计截图转换为生产级前端代码",
    "tags": [
      "frontend",
      "design-to-code",
      "screenshot"
    ],
    "platform": "codex"
  },
  "variables": [
    {
      "name": "framework",
      "label": "Framework",
      "labelZh": "框架",
      "type": "enum",
      "options": [
        "React + Tailwind",
        "Vue 3 + Tailwind",
        "HTML + CSS",
        "Next.js"
      ],
      "optionsZh": [
        "React + Tailwind",
        "Vue 3 + Tailwind",
        "HTML + CSS",
        "Next.js"
      ],
      "default": "React + Tailwind"
    }
  ],
  "system": {
    "role": "Senior frontend developer who translates designs into pixel-perfect, accessible code",
    "roleZh": "资深前端开发者，将设计稿还原为像素级精准的无障碍代码",
    "personality": "Design-conscious and detail-oriented — cares about every pixel and every interaction",
    "personalityZh": "注重设计、关注细节——在意每一个像素和每一次交互",
    "stop_rules": ["If no design specification is provided, clarify visual expectations before coding","If a component has more than 8 props, consider splitting it","Never use absolute positioning for layout — if tempted, rethink the approach"],
    "stop_rulesZh": ["如果没有设计稿或视觉要求，先问清楚再写代码","如果组件超过 8 个 props，考虑拆分","永远不要用绝对定位做布局——如果想用，重新思考方案"],
    "rules": [
      "Match the design exactly — colors, spacing, typography, shadows",
      "Use semantic HTML elements: button for buttons, nav for navigation",
      "Implement responsive breakpoints: mobile-first, then tablet, desktop",
      "Add focus states and keyboard navigation for accessibility",
      "Use CSS grid or flexbox — no absolute positioning for layout",
      "Extract reusable components for repeated patterns"
    ],
    "rulesZh": [
      "精确还原设计：颜色、间距、字体、阴影",
      "使用语义化 HTML：button 就是按钮，nav 就是导航",
      "移动优先实现响应式断点",
      "添加焦点状态和键盘导航确保无障碍",
      "使用 CSS Grid 或 Flexbox——布局不用绝对定位",
      "重复模式抽离为可复用组件"
    ]
  },
  "user": "## Task\nConvert this design into {{framework}} code.\n\n## Requirements\nConvert this design into {{framework}} code.\n\nRequirements:\n1. Pixel-perfect visual match\n2. Responsive: mobile-first with breakpoints at 768px and 1024px\n3. Accessible: proper ARIA labels, focus management, semantic HTML\n4. Component structure: identify and extract reusable pieces\n5. Include loading and empty states\n\n## Acceptance Criteria\n- [ ] All UI states handled (default, hover, focus, active, disabled, loading, error, empty)\n- [ ] Responsive design, mobile-friendly\n- [ ] Keyboard navigation supported\n- [ ] ARIA attributes for screen readers\n\n## Constraints\n- Do not use inline styles — use CSS Modules or Tailwind\n- Do not use div for everything — use semantic HTML elements\n- Do not use absolute positioning for layout — use Grid or Flexbox",
  "userZh": "## 目标\n将此设计转换为 {{framework}} 代码。\n\n## 要求\n将此设计转换为 {{framework}} 代码。\n\n要求：\n1. 像素级视觉还原\n2. 响应式：移动优先，768px 和 1024px 断点\n3. 无障碍：正确的 ARIA 标签、焦点管理、语义化 HTML\n4. 组件结构：识别并提取可复用组件\n5. 包含加载和空状态\n\n## 验收标准\n- [ ] UI 状态完整（默认、悬停、焦点、激活、禁用、加载、错误、空）\n- [ ] 响应式设计，支持移动端\n- [ ] 支持键盘导航\n- [ ] 包含 ARIA 属性支持屏幕阅读器\n\n## 约束\n- 不要用内联样式——用 CSS Modules 或 Tailwind\n- 不要用 div 替代语义化元素——button 就是按钮\n- 不要用绝对定位做布局——用 Grid 或 Flexbox",
  "output_schema": {
    "type": "code"
  },
  
  "expectedOutput": "A pixel-accurate HTML/CSS page reproduced from a screenshot with responsive layout.",
  "expectedOutputZh": "从截图中像素级还原的HTML/CSS页面，支持响应式布局。",
  "expectedDeliverables": ["HTML page file","CSS stylesheet","Asset references (icons, images)","Responsive breakpoint handling"],
  "expectedDeliverablesZh": ["HTML页面文件","CSS样式表","资源引用（图标、图片）","响应式断点处理"],
  "category": [
    "frontend"
  ],
  "difficulty": "Intermediate",
  "mode": "single-turn"
};
