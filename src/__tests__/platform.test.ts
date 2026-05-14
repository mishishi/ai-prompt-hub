import { describe, it, expect } from 'vitest';
import { getPlatformLabel } from '../utils/platform';

describe('getPlatformLabel', () => {
  it('returns English label by default', () => {
    expect(getPlatformLabel('codex')).toBe('Codex');
    expect(getPlatformLabel('claude')).toBe('Claude Code');
    expect(getPlatformLabel('gpt')).toBe('ChatGPT');
  });

  it('returns Chinese label for zh-CN', () => {
    expect(getPlatformLabel('codex', 'zh-CN')).toBe('Codex 通用');
    expect(getPlatformLabel('claude', 'zh-CN')).toBe('Claude Code');
    expect(getPlatformLabel('gpt', 'zh-CN')).toBe('ChatGPT');
  });

  it('returns English for non-zh-CN lang', () => {
    expect(getPlatformLabel('codex', 'en')).toBe('Codex');
    expect(getPlatformLabel('codex', 'ja')).toBe('Codex');
  });

  it('falls back to id for unknown platform', () => {
    expect(getPlatformLabel('unknown' as any)).toBe('unknown');
  });
});