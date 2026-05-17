export interface PromptVariable {
  name: string;
  label: string;
  type: 'enum' | 'boolean' | 'string';
  labelZh?: string;
  optionsZh?: string[];
  options?: string[];
  default?: string | boolean;
  required?: boolean;
}

export interface PromptMeta {
  name: string;
  nameZh?: string;
  description: string;
  descriptionZh?: string;
  tags: string[];
  platform: Platform;
}

export interface PromptSystem {
  role: string;
  roleZh?: string;
  personality?: string;
  personalityZh?: string;
  rules?: string[];
  rulesZh?: string[];
  stop_rules?: string[];
  stop_rulesZh?: string[];
}

export interface PromptOutputSchema {
  type: string;
  schema?: string;
}

export interface PromptVersion {
  version: number;
  yaml: string;
  rendered: string;
  timestamp: number;
}

export interface Prompt {
  id: string;
  yaml: string;
  meta: PromptMeta;
  variables: PromptVariable[];
  system: PromptSystem;
  user: string;
  userZh?: string;
  output_schema?: PromptOutputSchema;
  source: 'library' | 'forked' | 'generated';
  forkedFrom?: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  versions: PromptVersion[];
}

export interface LibraryTemplate {
  id: string;
  meta: PromptMeta;
  variables: PromptVariable[];
  system: PromptSystem;
  user: string;
  userZh?: string;
  output_schema?: PromptOutputSchema;
  category: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  verified?: boolean;
  expectedOutput?: string;
  expectedOutputZh?: string;
  expectedDeliverables?: string[];
  expectedDeliverablesZh?: string[];
  examples?: string;
  examplesZh?: string;
  contextChecklist?: string[];
  contextChecklistZh?: string[];
  mode?: 'single-turn' | 'multi-turn' | 'multi-agent';
  usage_tips?: string;
  usage_tipsZh?: string;
  stages?: { name: string; nameZh?: string }[];
}

export type Platform = 'claude' | 'codex' | 'gpt';