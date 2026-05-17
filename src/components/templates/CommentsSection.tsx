import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useT } from '../../i18n/LanguageContext';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export function CommentsSection({ templateId }: { templateId: string }) {
  const { t, lang } = useT();
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchComments = () => {
    fetch('/api/community/' + templateId + '/comments')
      .then(r => r.json())
      .then(data => { if (data.ok) setComments(data.comments); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, [templateId]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      const res = await fetch('/api/community/' + templateId + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName || user.primaryEmailAddress?.emailAddress || 'Anonymous',
          content: text.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setComments(prev => [data.comment, ...prev]);
        setText('');
      }
    } catch {}
    setSending(false);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('comments.justNow');
    if (mins < 60) return mins + t('comments.minAgo');
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + t('comments.hourAgo');
    const days = Math.floor(hours / 24);
    return days + t('comments.dayAgo');
  };

  return (
    <div className="space-y-4">
      {user && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bench-accent)]/20 flex items-center justify-center text-xs font-medium text-[var(--color-bench-accent)] flex-shrink-0">
            {(user.fullName || user.primaryEmailAddress?.emailAddress || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t('comments.placeholder')}
              className="flex-1 px-3 py-2 bg-[var(--color-bench-bg)] border border-[var(--color-bench-border)] rounded-lg text-sm text-[var(--color-bench-text)] placeholder:text-[var(--color-bench-muted)] focus:outline-none focus:border-[var(--color-bench-accent)]"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="px-3 py-2 bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)] rounded-lg hover:bg-[var(--color-bench-accent)]/20 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-12 bg-[var(--color-bench-elevated)] rounded-lg animate-pulse" />)}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--color-bench-muted)] text-center py-4">{t('comments.empty')}</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[var(--color-bench-accent-secondary)]/20 flex items-center justify-center text-xs font-medium text-[var(--color-bench-accent-secondary)] flex-shrink-0">
                {c.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-bench-text)]">{c.userName}</span>
                  <span className="text-xs text-[var(--color-bench-muted)]">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-[var(--color-bench-text-dim)] mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}