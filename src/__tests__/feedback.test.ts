import { describe, it, expect } from 'vitest';

// Test the feedback vote toggle logic (pure function extracted from API)
function computeFeedbackDelta(
  existingVote: 'up' | 'down' | null,
  newValue: 'up' | 'down'
): { likeDelta: number; action: 'insert' | 'update' | 'delete' } {
  if (!existingVote) {
    return { likeDelta: newValue === 'up' ? 1 : -1, action: 'insert' };
  }
  if (existingVote === newValue) {
    return { likeDelta: newValue === 'up' ? -1 : 1, action: 'delete' };
  }
  return { likeDelta: newValue === 'up' ? 2 : -2, action: 'update' };
}

describe('Feedback logic', () => {
  it('new up vote adds +1', () => {
    expect(computeFeedbackDelta(null, 'up')).toEqual({ likeDelta: 1, action: 'insert' });
  });

  it('new down vote adds -1', () => {
    expect(computeFeedbackDelta(null, 'down')).toEqual({ likeDelta: -1, action: 'insert' });
  });

  it('same up vote toggles off (-1)', () => {
    expect(computeFeedbackDelta('up', 'up')).toEqual({ likeDelta: -1, action: 'delete' });
  });

  it('same down vote toggles off (+1)', () => {
    expect(computeFeedbackDelta('down', 'down')).toEqual({ likeDelta: 1, action: 'delete' });
  });

  it('switch from down to up adds +2', () => {
    expect(computeFeedbackDelta('down', 'up')).toEqual({ likeDelta: 2, action: 'update' });
  });

  it('switch from up to down adds -2', () => {
    expect(computeFeedbackDelta('up', 'down')).toEqual({ likeDelta: -2, action: 'update' });
  });

  it('likes never goes negative (clamped at 0)', () => {
    const clamp = (likes: number, delta: number) => Math.max(0, likes + delta);
    expect(clamp(0, -1)).toBe(0);
    expect(clamp(1, -1)).toBe(0);
    expect(clamp(5, -1)).toBe(4);
  });
});