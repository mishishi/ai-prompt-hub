import { describe, it, expect } from 'vitest';
import { tName, tShort, tTips, tLabel, tOptions } from '../data/templates/helper';
import type { LibraryTemplate } from '../types';

const mockTemplate: LibraryTemplate = {
  id: 'test',
  meta: {
    name: 'Test Template',
    nameZh: '测试模板',
    description: 'A test description',
    descriptionZh: '测试描述',
    tags: ['test'],
    platform: 'codex',
  },
  variables: [],
  system: { role: 'Tester', roleZh: '测试者' },
  user: 'Hello {{name}}',
  userZh: '你好 {{name}}',
  category: ['testing'],
  difficulty: 'Beginner',
  usage_tips: 'Use this wisely',
  usage_tipsZh: '请合理使用',
};

describe('template helpers', () => {
  it('tName returns zh name for zh-CN', () => {
    expect(tName(mockTemplate, 'zh-CN')).toBe('测试模板');
  });

  it('tName returns en name for en', () => {
    expect(tName(mockTemplate, 'en')).toBe('Test Template');
  });

  it('tShort returns zh description for zh-CN', () => {
    expect(tShort(mockTemplate, 'zh-CN')).toBe('测试描述');
  });

  it('tShort returns en description for en', () => {
    expect(tShort(mockTemplate, 'en')).toBe('A test description');
  });

  it('tTips returns zh tips for zh-CN', () => {
    expect(tTips(mockTemplate, 'zh-CN')).toBe('请合理使用');
  });

  it('tTips returns en tips for en', () => {
    expect(tTips(mockTemplate, 'en')).toBe('Use this wisely');
  });

  it('tTips falls back to en when zh missing', () => {
    const noZh = { ...mockTemplate, usage_tipsZh: undefined };
    expect(tTips(noZh, 'zh-CN')).toBe('Use this wisely');
  });

  it('tLabel returns zh label when available', () => {
    const v = { label: 'Name', labelZh: '名称' };
    expect(tLabel(v, 'zh-CN')).toBe('名称');
    expect(tLabel(v, 'en')).toBe('Name');
  });

  it('tOptions returns zh options for zh-CN', () => {
    const v = { options: ['A','B'], optionsZh: ['甲','乙'] };
    expect(tOptions(v, 'zh-CN')).toEqual(['甲','乙']);
    expect(tOptions(v, 'en')).toEqual(['A','B']);
  });

  it('tOptions falls back to en options', () => {
    const v = { options: ['A','B'] };
    expect(tOptions(v, 'zh-CN')).toEqual(['A','B']);
  });
});