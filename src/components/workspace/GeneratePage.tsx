import { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Loader, ThumbsUp, ThumbsDown, Zap, Lightbulb, RefreshCw, Edit3, X, Save } from 'lucide-react';
import { aiGenerate, useQuota } from '../../utils/ai';
import { copyToClipboard } from '../../utils/clipboard';
import { track } from '../../utils/analytics';
import { savePrompt, generateId } from '../../utils/storage';
import type { Prompt } from '../../types';
import { useT } from '../../i18n/LanguageContext';
import { useUser } from '@clerk/clerk-react';

export function GeneratePage() {
  const { user } = useUser();
  const { lang } = useT();
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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
    try {
      await aiGenerate(intent.trim(), lang, (chunk) => setResult(chunk));
      track({ type: 'ai_generate', lang, userId: user?.id, userName: user?.fullName || user?.primaryEmailAddress?.emailAddress });
    } catch (e: any) { setError(e.message || tq('API error. Please try again.', 'API 错误，请重试。')); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => { if (!result) return; track({ type: 'ai_copy', lang, userId: user?.id, userName: user?.fullName || user?.primaryEmailAddress?.emailAddress }); await copyToClipboard(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  

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
        <div className="px-6 pt-6 lg:pt-8 pb-4">
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

        <div className="flex-1 flex flex-col px-6 space-y-4 overflow-y-auto pb-4">
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
        <div className="px-6 py-3 border-t border-[var(--color-bench-border)] bg-[var(--color-bench-elevated)]"><p className="text-xs text-[var(--color-bench-muted)] text-center uppercase tracking-wider">{tq('Press Enter to generate · 10 free / day', '回车生成 · 每日免费 10 次')}</p></div>
      </div>

      {/* Output Panel */}
      <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-bench-bg)] min-h-[250px] sm:min-h-[400px]">
        {loading && !result ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="inline-block w-5 h-5 bg-[var(--color-bench-accent)] rounded-full animate-bounce" />
              <p className="text-sm text-[var(--color-bench-muted)]">{tq('Generating your prompt...', '正在生成你的 Prompt...')}</p>
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
            {!editing ? (
            <div className="flex-1 overflow-y-auto bg-[var(--color-bench-bg)]"><pre className="p-6 text-sm text-[var(--color-bench-text)] leading-relaxed whitespace-pre-wrap font-mono">{result}{loading && <span className="ai-cursor" />}</pre></div>
            ) : (
            <div className="flex-1 flex flex-col">
              <div className="px-5 py-2 border-b border-[var(--color-bench-border)] flex items-center justify-between bg-[var(--color-bench-elevated)]">
                <span className="text-sm font-medium text-[var(--color-bench-accent)]">{tq('Editing result...', '编辑中...')}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setResult(editText); setEditing(false); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] hover:bg-[var(--color-bench-accent)]/20 transition-colors">{tq('Apply', '应用')}</button>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors"><X size={12} /></button>
                </div>
              </div>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 p-6 text-sm text-[var(--color-bench-text)] leading-relaxed font-mono bg-[var(--color-bench-bg)] border-0 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-bench-accent)]/30 rounded-b-lg" />
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
