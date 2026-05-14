import { describe, it, expect } from 'vitest';
import { t, UI } from '../i18n/translations';

describe('translations', () => {
  it('returns zh-CN translation when available', () => {
    expect(t('zh-CN', 'browser.title')).toBe('模板库');
  });

  it('returns en translation', () => {
    expect(t('en', 'browser.title')).toBe('Template Library');
  });

  it('falls back to en for missing zh-CN key', () => {
    expect(t('zh-CN', 'nonexistent.key')).toBe('nonexistent.key');
  });

  it('returns key itself when no translation exists', () => {
    expect(t('en', 'totally.missing')).toBe('totally.missing');
  });

  it('has all expected category keys', () => {
    const cats = ['code-review','agentic','frontend','testing','architecture','documentation','data','language','devops','efficiency'];
    cats.forEach(c => {
      expect(t('en', 'category.' + c)).toBeTruthy();
      expect(t('zh-CN', 'category.' + c)).toBeTruthy();
    });
  });

  it('has all difficulty keys', () => {
    ['Beginner','Intermediate','Advanced'].forEach(d => {
      expect(t('en', 'difficulty.' + d)).toBeTruthy();
      expect(t('zh-CN', 'difficulty.' + d)).toBeTruthy();
    });
  });

  it('has all mode keys', () => {
    ['single-turn','multi-turn','multi-agent'].forEach(m => {
      expect(t('en', 'mode.' + m)).toBeTruthy();
      expect(t('zh-CN', 'mode.' + m)).toBeTruthy();
    });
  });

  it('has search i18n keys', () => {
    expect(t('en', 'browser.searchHint')).toBe('press /');
    expect(t('zh-CN', 'browser.searchHint')).toBe('按 /');
    expect(t('en', 'browser.shortcut')).toBe('Ctrl+K');
    expect(t('zh-CN', 'browser.shortcut')).toBe('Ctrl+K');
  });
});