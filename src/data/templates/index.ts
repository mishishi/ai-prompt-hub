import type { LibraryTemplate } from '../../types';

import { securityCodeReview } from './security-code-review';
import { agentFeatureDev } from './agent-feature-dev';
import { frontendScreenshotToPage } from './frontend-screenshot-to-page';
import { frontendFullReview } from './frontend-full-review';
import { unitTestGen } from './unit-test-gen';
import { apiDesign } from './api-design';
import { prReviewAgent } from './pr-review-agent';
import { conventionalCommits } from './conventional-commits';
import { dockerfileOpt } from './dockerfile-opt';
import { reactComponentGen } from './react-component-gen';
import { fullstackFrontendAgent } from './fullstack-frontend-agent';
import { frontendRefactorAgent } from './frontend-refactor-agent';
import { onboardingAgent } from './onboarding-agent';
import { performanceReview } from './performance-review';
import { codeStyleReview } from './code-style-review';
import { apiIntegrationTest } from './api-integration-test';
import { e2eTestDesign } from './e2e-test-design';
import { dbSchemaDesign } from './db-schema-design';
import { apiDocGenerator } from './api-doc-generator';
import { readmeGenerator } from './readme-generator';
import { githubActionsGen } from './github-actions-gen';
import { sqlQueryOptimizer } from './sql-query-optimizer';
import { ormModelGenerator } from './orm-model-generator';
import { pythonBestPractices } from './python-best-practices';
import { typescriptTypeOptimizer } from './typescript-type-optimizer';
import { prDescriptionGen } from './pr-description-gen';
import { regexGenerator } from './regex-generator';
import { prdToPrototype } from './prd-to-prototype';
import { uxReview } from './ux-review';
import { responsiveReview } from './responsive-review';
import { componentMigration } from './component-migration';
import { designSystemBuilder } from './design-system-builder';

export { tName, tShort, tDesc, tTips } from './helper';

export const templates: LibraryTemplate[] = [
  securityCodeReview, agentFeatureDev, frontendScreenshotToPage, frontendFullReview,
  unitTestGen, apiDesign, prReviewAgent, conventionalCommits, dockerfileOpt, reactComponentGen,
  fullstackFrontendAgent, frontendRefactorAgent, onboardingAgent,
  performanceReview, codeStyleReview,
  apiIntegrationTest, e2eTestDesign,
  dbSchemaDesign,
  apiDocGenerator, readmeGenerator,
  githubActionsGen,
  sqlQueryOptimizer, ormModelGenerator,
  pythonBestPractices, typescriptTypeOptimizer,
  prDescriptionGen, regexGenerator,
  prdToPrototype, uxReview, responsiveReview, componentMigration, designSystemBuilder,
];

export const categories = [
  { id: 'code-review', name: 'Code Review', icon: 'Shield' },
  { id: 'agentic', name: 'Agentic Workflow', icon: 'Workflow' },
  { id: 'frontend', name: 'Frontend', icon: 'Layout' },
  { id: 'testing', name: 'Testing', icon: 'TestTube' },
  { id: 'architecture', name: 'Architecture', icon: 'Box' },
  { id: 'documentation', name: 'Documentation', icon: 'FileText' },
  { id: 'devops', name: 'DevOps', icon: 'Container' },
  { id: 'data', name: 'Data & DB', icon: 'Database' },
  { id: 'language', name: 'Language Specific', icon: 'Code2' },
  { id: 'efficiency', name: 'Dev Efficiency', icon: 'Zap' },
];

export function getTemplatesByCategory(cat: string): LibraryTemplate[] {
  return templates.filter((t) => t.category.includes(cat));
}

export function searchTemplates(q: string): LibraryTemplate[] {
  const lower = q.toLowerCase();
  return templates.filter((t) =>
    t.meta.name.toLowerCase().includes(lower) ||
    (t.meta.nameZh && t.meta.nameZh.toLowerCase().includes(lower)) ||
    t.meta.description.toLowerCase().includes(lower) ||
    (t.meta.descriptionZh && t.meta.descriptionZh.toLowerCase().includes(lower)) ||
    t.meta.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}