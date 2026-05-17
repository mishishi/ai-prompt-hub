import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Check, Loader, ThumbsUp, ThumbsDown, Zap, Lightbulb, RefreshCw, Edit3, X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseEval } from '../../utils/parseEval';
import { parseSections } from '../../utils/parseSections';
import { aiGenerate, useQuota, getRemainingQuota, evaluatePrompt } from '../../utils/ai';
import { findBestMatch, type TemplateMatch } from '../../data/templates';
import { tName } from '../../data/templates/helper';
import { copyToClipboard } from '../../utils/clipboard';
import { track, getDisplayName } from '../../utils/analytics';
import { savePrompt, generateId } from '../../utils/storage';
import type { Prompt } from '../../types';
import { useT } from '../../i18n/LanguageContext';
import { useUser } from '@clerk/clerk-react';


const CountUpDisplay = ({ target, color }: { target: number; color: string }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target <= 0) { setDisplay(0); return; }
    const duration = 1500;
    const startTime = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span className="text-2xl font-bold" style={{ color }}>{display}</span>;
};

const SparkleBurst = ({ color }: { color: string }) => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360 + Math.random() * 20 - 10,
    distance: 35 + Math.random() * 40,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 0.15,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ animation: "eval-sparkle-burst 0.8s ease-out forwards" }}>
      {particles.map((p, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: p.size, height: p.size, background: color, left: "50%", top: "35%",
          boxShadow: "0 0 " + (p.size * 2) + "px " + color,
          animation: "eval-particle " + (0.6 + Math.random() * 0.4) + "s ease-out " + p.delay + "s forwards",
          "--angle": p.angle + "deg", "--dist": p.distance + "px",
        } as React.CSSProperties} />
      ))}
    </div>
  );
};

const ResultView = ({ result, loading }: { result: string; loading: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result]);

  const sections = parseSections(result);
  if (sections.length === 0) {
    return <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[var(--color-bench-bg)]"><pre className="p-4 md:p-6 text-sm text-[var(--color-bench-text)] leading-relaxed whitespace-pre-wrap font-mono">{result}{loading && <span className="ai-cursor" />}</pre></div>;
  }
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[var(--color-bench-bg)]">
      {sections.map((sec: any, i: number) => (
        <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: sec.color + '33' }}>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: sec.color + '14' }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sec.color }} />
            <span className="text-sm font-semibold" style={{ color: sec.color }}>{sec.title}</span>
          </div>
          <div className="px-4 py-3">
            <pre className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed whitespace-pre-wrap font-mono">{sec.content}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export function GeneratePage() {
  const { user } = useUser();
  const { lang } = useT();
  const navigate = useNavigate();
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saved, setSaved] = useState(false);
  const [quotaLeft, setQuotaLeft] = useState(() => getRemainingQuota());
  const [refineInput, setRefineInput] = useState('');
  const [templateMatches, setTemplateMatches] = useState<TemplateMatch[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [showEvalPopover, setShowEvalPopover] = useState(false);
  const evaluationPillRef = useRef<HTMLButtonElement>(null);
  const [refining, setRefining] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);


  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const q = intent.trim();
    if (q.length < 4) { setTemplateMatches([]); return; }
    const timer = setTimeout(() => {
      const matches = findBestMatch(q, 3);
      setTemplateMatches(matches.filter(m => m.score >= 50));
    }, 400);
    return () => clearTimeout(timer);
  }, [intent]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setResult(null); setError(''); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;


  const handleGenerate = async () => {
    if (!intent.trim()) return;
    if (!useQuota()) { setError(tq('Daily quota exhausted. Browse the template library instead.', '今日免费次数已用完，明天重置。试试浏览模板库？')); return; }
    setLoading(true); setError(''); setFeedback(null);
    setResult('');
    setQuotaLeft(getRemainingQuota());
    try {
      const fullPrompt = await aiGenerate(intent.trim(), lang, (chunk) => setResult(chunk));
      setResult(fullPrompt);
      setEvaluating(true);
      setEvaluation(null);
      evaluatePrompt(fullPrompt, lang, (chunk) => setEvaluation(chunk)).then((evalText) => {
        setEvaluation(evalText);
        setEvaluating(false);
      }).catch((err: any) => { console.error('[eval] failed:', err?.message); setEvaluating(false); });
      track({ type: 'ai_generate', lang, userId: user?.id, userName: getDisplayName(user), provider: user?.externalAccounts?.[0]?.provider });
    } catch (e: any) { setError(e.message || tq('API error. Please try again.', 'API 错误，请重试。')); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => { if (!result) return; track({ type: 'ai_copy', lang, userId: user?.id, userName: getDisplayName(user), provider: user?.externalAccounts?.[0]?.provider }); await copyToClipboard(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  

const handleSave = () => {
    if (!result || !intent.trim()) return;
    const id = generateId();
    const name = intent.trim().slice(0, 40).replace(/[\n\r]+/g, ' ');
    const p: Prompt = {
      id,
      yaml: '',
      meta: { name, description: '', tags: ['ai-generated'], platform: 'codex' },
      variables: [],
      system: { role: '', rules: [] },
      user: result,
      source: 'generated',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      versions: [],
    };
    savePrompt(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFeedback = (v: 'up' | 'down') => { setFeedback(v); track({ type: 'ai_feedback', lang }); const k = 'promptbench-feedback'; const ex = JSON.parse(localStorage.getItem(k) || '[]'); ex.push({ intent: intent.slice(0, 100), value: v, ts: Date.now() }); localStorage.setItem(k, JSON.stringify(ex.slice(-50))); };

  const handleRefine = async () => {
    if (!refineInput.trim() || !result) return;
    if (!useQuota()) { setError(tq('Daily quota exhausted.', '今日免费次数已用完。')); return; }
    setRefining(true); setError('');
    setQuotaLeft(getRemainingQuota());
    try {
      await aiGenerate(intent.trim(), lang, (chunk) => setResult(chunk), { previousResult: result, feedback: refineInput.trim() });
      setRefineInput('');
      track({ type: 'ai_generate', lang, userId: user?.id, userName: getDisplayName(user), provider: user?.externalAccounts?.[0]?.provider });
    } catch (e: any) { setError(e.message || tq('API error.', 'API 错误，请重试。')); }
    finally { setRefining(false); }
  };

  const suggestions = [
    { en: 'Code security review', zh: '代码安全审查' },
    { en: 'Write unit tests', zh: '写单元测试' },
    { en: 'Design REST API', zh: '设计 REST API' },
    { en: 'Build a frontend page', zh: '写一个前端页面' },
    { en: 'Database schema design', zh: '数据库表结构设计' },
    { en: 'PR code review', zh: 'PR 代码审查' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full page-enter">
      {/* Input Panel */}
      <div className="w-full lg:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex flex-col">
        <div className="px-4 md:px-6 pt-6 lg:pt-8 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-bench-accent)] flex items-center justify-center">
              <Sparkles size={18} className="text-[var(--color-bench-bg)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight">{tq("AI Prompt Generator", "AI Prompt 生成器")}</h2>
              <p className="text-sm text-[var(--color-bench-text-dim)] mt-1">{tq("Describe your task and we will generate a professional prompt", "描述你的任务，我们帮你生成专业 Prompt")}</p>
                          </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-4 md:px-6 space-y-4 overflow-y-auto pb-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-bench-muted)] mb-2.5">{tq('Task Description', '任务描述')}</label>
                          <div className="flex flex-wrap gap-2 justify-start mb-3">
                <button onClick={() => { setIntent(tq('I need a code review prompt that checks for security vulnerabilities', '我需要一个检查安全漏洞的代码审查 prompt')); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:border-[var(--color-bench-accent)]/30 transition-all">{tq('Code Review', '代码审查')}</button>
                <button onClick={() => { setIntent(tq('I need a prompt to generate a React component with TypeScript', '我需要一个用 TypeScript 生成 React 组件的 prompt')); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:border-[var(--color-bench-accent)]/30 transition-all">{tq('React Component', 'React 组件')}</button>
                <button onClick={() => { setIntent(tq('I need a prompt that writes unit tests for my code', '我需要一个为代码编写单元测试的 prompt')); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:border-[var(--color-bench-accent)]/30 transition-all">{tq('Unit Tests', '单元测试')}</button>
              </div>
            <textarea ref={inputRef} value={intent} onChange={(e) => setIntent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }} placeholder={tq('E.g., Review my React code for security, design a REST API, write tests...', '例如：审查 React 代码安全、设计 REST API、写单元测试...')} rows={5} className="w-full px-4 py-3.5 bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-lg text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)]/40 resize-none focus:outline-none focus:border-[var(--color-bench-accent)]/40 focus:ring-1 focus:ring-[var(--color-bench-accent)]/20 transition-all font-[var(--font-body)]" />
          </div>
          {error && <div className="p-3 rounded-xl bg-[var(--color-bench-error)]/10 border border-[var(--color-bench-error)]/20"><p className="text-xs text-[var(--color-bench-error)]">{error}</p></div>}
                      {templateMatches.length > 0 && (

            <div className="p-3 rounded-xl bg-[var(--color-bench-accent)]/5 border border-[var(--color-bench-accent)]/20">

              <p className="text-xs font-semibold text-[var(--color-bench-accent)] mb-2">{tq('Matching templates found. Click to use instead:', '发现匹配的模板，点击直接使用：')}</p>

              <div className="space-y-1">

                {templateMatches.map((m) => (

                  <button key={m.template.id} onClick={() => navigate(`/template/${m.template.id}`)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left bg-[var(--color-bench-bg)] hover:bg-[var(--color-bench-accent)]/10 border border-[var(--color-bench-border)] hover:border-[var(--color-bench-accent)]/30 transition-all">

                    <Sparkles size={12} className="text-[var(--color-bench-accent)] flex-shrink-0" />

                    <span className="text-[var(--color-bench-text)] text-sm flex-1">{tName(m.template, lang)}</span>

                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] font-medium">{m.score}%</span>

                  </button>

                ))}

              </div>

            </div>

            )}

          <button onClick={handleGenerate} disabled={loading || !intent.trim()} className="btn-glow w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold">
            {loading ? <><Loader size={16} className="animate-spin" />{tq('Generating...', '生成中...')}</> : <><Zap size={16} />{tq('Generate Prompt', '生成 Prompt')}</>}
          </button>
          <div>
            <p className="text-xs font-semibold text-[var(--color-bench-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-1"><Lightbulb size={10} />{tq('Quick Start', '快捷开始')}</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(s => <button key={s.en} onClick={() => setIntent(tq(s.en, s.zh))} className="px-2.5 py-1.5 rounded-md text-xs text-[var(--color-bench-muted)] bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] hover:border-[var(--color-bench-accent)]/30 hover:text-[var(--color-bench-accent)] transition-colors">{tq(s.en, s.zh)}</button>)}
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6 py-3 border-t border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)]"><p className="text-xs text-[var(--color-bench-muted)] text-center uppercase tracking-wider">{tq('Press Enter · ' + quotaLeft + ' free today', '回车生成 · 今日剩余 ' + quotaLeft + ' 次')}</p></div>
      </div>

      {/* Output Panel */}
      <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-bench-bg)] min-h-[250px] sm:min-h-[400px]">
        {loading && !result ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-6 max-w-md w-full">
              {/* Skeleton card with shimmer */}
              <div className="w-full space-y-4">
                {/* Shimmer header */}
                <div className="h-6 w-2/3 rounded-lg overflow-hidden relative skeleton-shimmer" style={{background: 'var(--color-bench-elevated)', border: '1px solid var(--color-bench-border)'}}>
                  <div className="absolute inset-0 skeleton-sweep" style={{background: 'linear-gradient(90deg, transparent, var(--color-bench-accent)10, transparent)'}} />
                </div>
                {/* Shimmer lines */}
                <div className="space-y-2.5">
                  {[100, 85, 92, 60, 78].map((w, i) => (
                    <div key={i} className="h-4 rounded-lg overflow-hidden relative skeleton-shimmer" style={{width: w+'%', background: 'var(--color-bench-elevated)', border: '1px solid var(--color-bench-border)', animationDelay: (i*100)+'ms'}}>
                      <div className="absolute inset-0 skeleton-sweep" style={{background: 'linear-gradient(90deg, transparent, var(--color-bench-accent)10, transparent)', animationDelay: (i*120)+'ms'}} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Status text */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bench-accent)] animate-pulse" style={{animationDelay: '0ms'}} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bench-accent)] animate-pulse" style={{animationDelay: '150ms'}} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bench-accent)] animate-pulse" style={{animationDelay: '300ms'}} />
                </div>
                <p className="text-sm text-[var(--color-bench-muted)] font-medium">{tq('Generating your prompt...', '正在生成你的 Prompt...')}</p>
              </div>
            </div>
          </div>
        ) : !result ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-xl border border-[var(--color-bench-border)] flex items-center justify-center mx-auto bg-[var(--color-bench-elevated)]"><Sparkles size={24} className="text-[var(--color-bench-muted)]/30" /></div>
              <p className="text-sm text-[var(--color-bench-muted)]">{tq('Describe your task on the left, then click Generate', '在左侧描述你的任务，然后点击生成按钮')}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-bench-accent)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-bench-accent)]/40" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-bench-accent)]/20" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[var(--color-bench-muted)]">{tq('Output', '生成结果')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleGenerate} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)] transition-all" title={tq('Regenerate', '重新生成')}><RefreshCw size={12} />{tq('Retry', '重试')}</button>
                <button onClick={() => { setEditing(true); setEditText(result || ''); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)] transition-all" title={tq('Edit result', '编辑结果')}><Edit3 size={12} />{tq('Edit', '编辑')}</button>
                <button onClick={() => { setResult(null); setError(''); handleGenerate(); }} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-bench-text-dim)] hover:text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/10 disabled:opacity-30 transition-all"><RefreshCw size={12} />{tq('Regenerate', '重新生成')}</button>
                
                <button onClick={handleSave} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)]' : 'text-[var(--color-bench-text-dim)] hover:bg-white/5 hover:text-[var(--color-bench-text)]'}`} title={tq('Save to my prompts', '保存到我的 Prompt')}><Save size={12} />{saved ? tq('Saved!', '已保存') : tq('Save', '保存')}</button>
                
                <button onClick={handleCopy} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)]' : 'bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20'}`}>{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? tq('Copied!', '已复制') : tq('Copy', '复制')}</button>
              </div>
            </div>
            {/* AI Self-Evaluation */}
{evaluation && (() => { const ev = parseEval(evaluation); const score = ev.score; const scoreColor = score !== null ? score >= 80 ? 'var(--color-bench-success)' : score >= 50 ? 'var(--color-bench-accent)' : 'var(--color-bench-error)' : 'var(--color-bench-muted)'; const isHigh = score !== null && score >= 50; return (<>
  <div className="px-5 py-3 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center">
    <button
      ref={evaluationPillRef}
      onClick={() => setShowEvalPopover(true)}
      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 border"
      style={{
        backgroundColor: scoreColor + '14',
        borderColor: scoreColor + '33',
        color: scoreColor,
        boxShadow: '0 0 14px ' + scoreColor + '30',
        animation: 'glow-pulse 2.5s ease-in-out infinite'
      }}
    >
      <Sparkles size={12} className="relative z-10" />
      <span className="relative z-10">{tq('AI Score', 'AI 评分')} {score != null ? score : '?'}/100</span>
    </button>
  </div>
  {showEvalPopover && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEvalPopover(false)}>
      <div className="absolute inset-0 bg-black/60" style={{ animation: 'eval-fade-in 250ms ease-out both' }} />
      <div
        className="relative w-full max-w-lg bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'eval-scale-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-bench-border)]">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-[var(--color-bench-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{tq('AI Self-Evaluation', 'AI 自评')}</h3>
          </div>
          <button onClick={() => setShowEvalPopover(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X size={16} className="text-[var(--color-bench-muted)]" /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {score !== null && (
            <div className="flex flex-col items-center py-2 relative">
              {isHigh && <SparkleBurst color={scoreColor} />}
              <div className="relative w-24 h-24 mb-3">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="var(--color-bench-border)" strokeWidth="6" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke={scoreColor} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CountUpDisplay target={score} color={scoreColor} />
                </div>
              </div>
              <span className="text-sm text-[var(--color-bench-text-dim)]">{tq('out of 100', '/ 100')}</span>
            </div>
          )}
          {ev.strengths.length > 0 && (
            <div className="eval-stagger-item" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={14} className="text-[var(--color-bench-success)]" />
                <span className="text-sm font-semibold text-[var(--color-bench-success)]">{tq('Strengths', '优点')}</span>
              </div>
              <ul className="space-y-1.5">
                {ev.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-[var(--color-bench-text-dim)] pl-6">{s}</li>)}
              </ul>
            </div>
          )}
          {ev.improvements.length > 0 && (
            <div className="eval-stagger-item" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-[var(--color-bench-accent)]" />
                <span className="text-sm font-semibold text-[var(--color-bench-accent)]">{tq('Improvements', '可改进')}</span>
              </div>
              <ul className="space-y-1.5">
                {ev.improvements.map((s: string, i: number) => <li key={i} className="text-sm text-[var(--color-bench-text-dim)] pl-6">{s}</li>)}
              </ul>
            </div>
          )}
          {ev.suggestions.length > 0 && (
            <div className="eval-stagger-item" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-[var(--color-bench-accent)] opacity-80" />
                <span className="text-sm font-semibold text-[var(--color-bench-accent)] opacity-80">{tq('Suggestions', '建议')}</span>
              </div>
              <ul className="space-y-1.5">
                {ev.suggestions.map((s: string, i: number) => <li key={i} className="text-sm text-[var(--color-bench-text-dim)] pl-6">{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</>); })()}{!editing ? (
            <ResultView result={result || ""} loading={loading} />
            ) : (
            <div className="flex-1 flex flex-col">
              <div className="px-5 py-2 border-b border-[var(--color-bench-border)] flex items-center justify-between bg-[var(--color-bench-elevated)]">
                <span className="text-sm font-medium text-[var(--color-bench-accent)]">{tq('Editing result...', '编辑中...')}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setResult(editText); setEditing(false); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20 transition-colors">{tq('Apply', '应用')}</button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors"><X size={12} /></button>
                </div>
              </div>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 p-4 md:p-6 text-sm text-[var(--color-bench-text)] leading-relaxed font-mono bg-[var(--color-bench-bg)] border-0 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-bench-accent)]/30 rounded-b-lg" />
            </div>
            )}
            {!editing && (
            <div className="px-5 py-3 border-t border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !refining) handleRefine(); }}
                  placeholder={tq('Not satisfied? Tell AI what to change...', '不满意？告诉 AI 哪里要改...')}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)]/50 focus:outline-none focus:border-[var(--color-bench-accent)] transition-colors"
                  disabled={refining}
                />
                <button
                  onClick={handleRefine}
                  disabled={!refineInput.trim() || refining}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
                >
                  {refining ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {tq('Refine', '调整')}
                </button>
              </div>
            </div>
          )}
          <div className="px-5 py-3 border-t border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)] flex items-center justify-center gap-3">
              <span className="text-sm text-[var(--color-bench-text-dim)]">{tq('Was this helpful?', '对你有帮助吗？')}</span>
              {feedback ? <span className="text-sm text-[var(--color-bench-success)] font-medium">{tq('Thanks!', '感谢反馈！')}</span> : <>
                <button onClick={() => handleFeedback('up')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bench-success)]/10 text-[var(--color-bench-success)] hover:bg-[var(--color-bench-success)]/20 transition-colors"><ThumbsUp size={12} />{tq('Helpful', '有帮助')}</button>
                <button onClick={() => handleFeedback('down')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bench-error)]/10 text-[var(--color-bench-error)] hover:bg-[var(--color-bench-error)]/20 transition-colors"><ThumbsDown size={12} />{tq('Not helpful', '没帮助')}</button>
              </>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
