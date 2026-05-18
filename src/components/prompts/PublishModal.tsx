import { useState } from 'react';
import { X, Globe, Tag } from 'lucide-react';
import type { Prompt } from '../../types';
import { useT } from '../../i18n/LanguageContext';

const CATEGORIES = ['backend', 'frontend', 'testing', 'devops', 'data', 'architecture', 'documentation', 'writing', 'product', 'general'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

interface Props {
  prompt: Prompt;
  authorId: string;
  authorName: string;
  onClose: () => void;
  onPublished: () => void;
}

export function PublishModal({ prompt, authorId, authorName, onClose, onPublished }: Props) {
  const { lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  const [name, setName] = useState(prompt.meta.name || '');
  const [description, setDescription] = useState(prompt.meta.description || '');
  const [category, setCategory] = useState('backend');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [tags, setTags] = useState(prompt.meta.tags?.join(', ') || '');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async () => {
    if (!name.trim()) { setError(tq('Name is required', '名称不能为空')); return; }
    setPublishing(true);
    setError('');
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId,
          authorName,
          name: name.trim(),
          description: description.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          category,
          difficulty,
          prompt: prompt.user,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      onPublished();
    } catch (e: unknown) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-[var(--color-bench-accent)]" />
            <h2 className="text-lg font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{tq('Publish to Community', '发布到社区')}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] hover:bg-white/5 transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-bench-text)] mb-1.5">{tq('Name', '模板名称')} <span className="text-[var(--color-bench-error)]">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)]" placeholder={tq('e.g. Secure Login Flow', '如：安全登录流程')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-bench-text)] mb-1.5">{tq('Description', '简要描述')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)] resize-none" placeholder={tq('What does this prompt do?', '这个 Prompt 是做什么的？')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-bench-text)] mb-1.5">{tq('Category', '分类')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-sm text-[var(--color-bench-text)] focus:outline-none focus:border-[var(--color-bench-accent)]">
                {CATEGORIES.map(c => <option key={c} value={c}>{tq(c.charAt(0).toUpperCase() + c.slice(1), c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-bench-text)] mb-1.5">{tq('Difficulty', '难度')}</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-sm text-[var(--color-bench-text)] focus:outline-none focus:border-[var(--color-bench-accent)]">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-bench-text)] mb-1.5 flex items-center gap-1"><Tag size={12} />{tq('Tags', '标签')}</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)]" placeholder={tq('security, auth, python', '安全, 认证, python')} />
            <p className="text-xs text-[var(--color-bench-muted)] mt-1">{tq('Comma separated', '逗号分隔')}</p>
          </div>

          {error && <p className="text-xs text-[var(--color-bench-error)] bg-[var(--color-bench-error)]/10 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={handlePublish} disabled={publishing || !name.trim()} className="btn-glow w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {publishing ? tq('Publishing...', '发布中...') : tq('Publish', '发布')}
          </button>
        </div>
      </div>
    </div>
  );
}