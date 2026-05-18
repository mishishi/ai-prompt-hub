import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/LanguageContext';
import type { LibraryTemplate } from '../../types';
import { TemplateCard } from './TemplateCard';
import { ArrowLeft } from 'lucide-react';

export function AuthorPage() {
  const { t, lang } = useT();
  const tq = (en: string, zh: string) => lang === 'zh-CN' ? zh : en;
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<LibraryTemplate[]>([]);
  const [loading, setLoading] = useState(true); // derived: data is null means loading
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    if (!authorId) return;
        fetch('/api/community?author=' + encodeURIComponent(authorId) + '&limit=50')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          if (data.templates.length > 0) {
            setAuthorName(data.templates[0].authorName || authorId);
            setTemplates(data.templates.map((t: any) => ({
              id: t.id,
              meta: { name: t.name, description: t.description, tags: t.tags, platform: 'claude' as const },
              variables: [],
              system: { role: '' },
              user: t.prompt,
              category: [t.category],
              difficulty: t.difficulty,
              _community: true,
              _authorName: t.authorName,
              _likes: t.likes,
              _copies: t.copies,
              _verified: t.verified ?? 0,
            } as LibraryTemplate)));
          } else {
            setTemplates([]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authorId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors mb-6 cursor-pointer">
        <ArrowLeft size={16} />
        {t('nav.library')}
      </button>

      {loading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[var(--color-bench-elevated)] rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-[var(--color-bench-elevated)] rounded-xl animate-pulse" />)}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--color-bench-accent)]/20 flex items-center justify-center text-xl font-bold text-[var(--color-bench-accent)]">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-bench-text)]">{authorName}</h1>
                <p className="text-sm text-[var(--color-bench-muted)]">{templates.length} {tq('templates', '个模板')}</p>
              </div>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-bench-muted)]">
              <p className="text-lg">{tq('No templates published yet.', '暂无发布的模板。')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tmpl, i: number) => (
                <div key={tmpl.id} className={`card-enter stagger-${(i % 4) + 1}`}>
                  <TemplateCard template={tmpl} score={(tmpl as any)._likes ?? 0} copyCount={(tmpl as any)._copies ?? 0} onClick={() => navigate('/template/' + tmpl.id)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}