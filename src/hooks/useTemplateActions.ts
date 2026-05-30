import { useState, useMemo, useCallback } from 'react';
import { track } from '../utils/analytics';
import { getFavorites, toggleFavorite } from '../utils/storage';
import type { LibraryTemplate } from '../types';

interface UseTemplateActionsOptions {
  template: LibraryTemplate;
  userId?: string;
  lang: string;
}

export function useTemplateActions({ template, userId, lang }: UseTemplateActionsOptions) {
  const [saveTicker, setSaveTicker] = useState(0);
  const [flash, setFlash] = useState(false);

  const favs = useMemo(() => {
    try { return getFavorites(); } catch { return []; }
  }, [saveTicker]);

  const isFav = favs.some((f: any) => f?.id === template.id);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); } catch {}
    track({ type: 'template_copy', templateId: template.id, lang, userId });
  }, [template.id, lang, userId]);

  const handleToggleFav = useCallback(() => {
    toggleFavorite(template.id);
    setSaveTicker(t => t + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  }, [template.id, isFav]);

  return { isFav, saveTicker, flash, handleShare, handleToggleFav };
}