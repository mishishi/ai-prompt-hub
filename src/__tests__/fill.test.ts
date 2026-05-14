import { describe, it, expect } from 'vitest';
import { fillVars } from '../utils/fill';

describe('fillVars', () => {
  const vars = [
    { name: 'language', label: 'Language', type: 'string' as const, default: 'Python' },
    { name: 'severity', label: 'Severity', type: 'enum' as const, options: ['Low', 'High'], default: 'High' },
    { name: 'verbose', label: 'Verbose', type: 'boolean' as const, default: false },
  ];

  it('replaces simple variables', () => {
    const result = fillVars('Review {{language}} code', vars, {});
    expect(result).toBe('Review Python code');
  });

  it('uses provided values over defaults', () => {
    const result = fillVars('Review {{language}} code', vars, { language: 'Go' });
    expect(result).toBe('Review Go code');
  });

  it('handles multiple variables', () => {
    const result = fillVars('Language: {{language}}, Severity: {{severity}}', vars, {});
    expect(result).toBe('Language: Python, Severity: High');
  });

  it('handles boolean variables', () => {
    const result = fillVars('Verbose: {{verbose}}', vars, { verbose: true });
    expect(result).toBe('Verbose: true');
  });

  it('handles {% if %} blocks - condition true', () => {
    const result = fillVars('Start.{% if verbose %} VERBOSE MODE{% endif %} End.', vars, { verbose: true });
    expect(result).toBe('Start. VERBOSE MODE End.');
  });

  it('handles {% if %} blocks - condition false', () => {
    const result = fillVars('Start.{% if verbose %} VERBOSE MODE{% endif %} End.', vars, { verbose: false });
    expect(result).toBe('Start. End.');
  });

  it('leaves unknown variables unchanged', () => {
    const result = fillVars('{{unknown}}', vars, {});
    expect(result).toBe('{{unknown}}');
  });

  it('trims whitespace', () => {
    const result = fillVars('  hello  ', [], {});
    expect(result).toBe('hello');
  });
});