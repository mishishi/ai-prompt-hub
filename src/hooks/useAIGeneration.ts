import { useState, useMemo, useCallback, useRef } from 'react';
import { aiGenerate, checkQuota, getRemainingQuota, evaluatePrompt } from '../utils/ai';
import { findBestMatch } from '../data/templates';
import { copyToClipboard } from '../utils/clipboard';
import { track } from '../utils/analytics';
import { parseSections } from '../utils/parseSections';
import { savePrompt, generateId } from '../utils/storage';
import type { Prompt } from '../types';

function parseEval(raw: string): { score?: number; strengths?: string[]; improvements?: string[]; suggestions?: string[] } {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return {};
    const obj = JSON.parse(m[0]);
    return {
      score: typeof obj.score === 'number' ? obj.score : undefined,
      strengths: Array.isArray(obj.strengths) ? obj.strengths : undefined,
      improvements: Array.isArray(obj.improvements) ? obj.improvements : undefined,
      suggestions: Array.isArray(obj.suggestions) ? obj.suggestions : undefined,
    };
  } catch {
    const lines = raw.split('\n').filter(Boolean);
    const strengths: string[] = [];
    const improvements: string[] = [];
    const suggestions: string[] = [];
    let score: number | undefined;
    let section: 'strengths' | 'improvements' | 'suggestions' | null = null;
    for (const line of lines) {
      if (line.match(/score/i)) { const n = line.match(/\d+/); if (n) score = parseInt(n[0], 10); }
      else if (line.match(/strength|advantage/i)) section = 'strengths';
      else if (line.match(/improv|weakness/i)) section = 'improvements';
      else if (line.match(/suggest|recommend/i)) section = 'suggestions';
      else if (section && line.trim()) {
        const c = line.replace(/^[-\d.*\s]+/, '').trim();
        if (c) {
          if (section === 'strengths') strengths.push(c);
          else if (section === 'improvements') improvements.push(c);
          else suggestions.push(c);
        }
      }
    }
    return { score, strengths, improvements, suggestions };
  }
}

export function useAIGeneration({ lang, userId }: { lang: string; userId?: string }) {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saved, setSaved] = useState(false);
  const [quotaLeft, setQuotaLeft] = useState(() => getRemainingQuota());
  const [refineInput, setRefineInput] = useState('');
  const [showEvalPopover, setShowEvalPopover] = useState(false);
  const evaluationPillRef = useRef<HTMLButtonElement>(null);
  const [refining, setRefining] = useState(false);
  const [evalResult, setEvalResult] = useState<{ score?: number; strengths?: string[]; improvements?: string[]; suggestions?: string[] } | null>(null);
  const [evalDone, setEvalDone] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);

  const templateMatches = useMemo(() => {
    if (!intent || intent.length < 3) return [];
    return findBestMatch(intent).slice(0, 2);
  }, [intent]);

  const handleGenerate = useCallback(async () => {
    if (!intent.trim()) return;
    if (!checkQuota()) { setError(lang === 'zh-CN' ? '今日免费次数已用完' : 'Daily quota exhausted'); return; }
    setLoading(true); setError(''); setResult(null); setSaved(false);
    setShowEvalPopover(false); setEvalResult(null); setEvalDone(false);
    try {
      let full = '';
      await aiGenerate(intent.trim(), lang as 'en' | 'zh-CN', (chunk: string) => { full += chunk; setResult(full); });
      setQuotaLeft(getRemainingQuota());
      track({ type: 'ai_generate', lang, userId });
      setEvalLoading(true);
      try {
        const raw = await evaluatePrompt(full, lang as 'en' | 'zh-CN', () => {});
        setEvalResult(parseEval(raw));
      } catch {}
      setEvalLoading(false);
      setEvalDone(true);
    } catch (e: any) {
      setError(e.message || 'Generation failed');
    } finally { setLoading(false); }
  }, [intent, lang, userId]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await copyToClipboard(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    track({ type: 'ai_copy', lang, userId });
  }, [result, lang, userId]);

  const handleFeedback = useCallback((v: 'up' | 'down') => {
    track({ type: 'ai_feedback', lang });
    const k = 'promptbench-feedback';
    try { const ex = JSON.parse(localStorage.getItem(k) || '[]'); ex.push({ intent: intent.slice(0, 100), value: v, ts: Date.now() }); localStorage.setItem(k, JSON.stringify(ex.slice(-50))); } catch {}
  }, [intent, lang]);

  const handleRefine = useCallback(async () => {
    if (!refineInput.trim() || !result) return;
    setRefining(true); setError('');
    try {
      let full = '';
      await aiGenerate(refineInput.trim(), lang as 'en' | 'zh-CN', (chunk: string) => { full += chunk; setResult(full); });
      setRefineInput('');
      track({ type: 'ai_generate', lang, userId });
    } catch (e: any) { setError(e.message || 'Refine failed'); }
    finally { setRefining(false); }
  }, [refineInput, result, lang, userId]);

  const handleSave = useCallback(() => {
    if (!result) return;
    const sections = parseSections(result);
    const roleSection = sections.find((s: any) => /role/i.test(s.title));
    const rulesSection = sections.find((s: any) => /rules?|stop.?rules?|constraint/i.test(s.title));
    const prompt: Prompt = {
      id: generateId(),
      yaml: result,
      meta: { name: intent.slice(0, 60) || "Untitled", description: intent.slice(0, 200), tags: [], platform: "gpt" },
      system: { role: roleSection ? roleSection.content : "", rules: rulesSection ? [rulesSection.content] : [] },
      user: result,
      variables: [],
      source: "generated",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      versions: [],
    };
    savePrompt(prompt);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }, [result, intent]);

  return {
    intent, setIntent, loading, result, error, setError,
    copied, editing, setEditing, editText, setEditText,
    saved, quotaLeft, refineInput, setRefineInput,
    showEvalPopover, setShowEvalPopover, evaluationPillRef,
    refining, evalResult, evalDone, evalLoading,
    templateMatches,
    handleGenerate, handleCopy, handleFeedback, handleRefine, handleSave,
  };
}