// Auto-generated markdown section parser for source view
export function parseSections(text: string): { title: string; content: string; color: string }[] {
  if (!text) return [];
  const lines = text.split('\n');
  const sections: { title: string; content: string; color: string }[] = [];
  let currentTitle = '';
  let currentContent: string[] = [];
  const colorMap: Record<string, string> = {
    'role': '#3b82f6', 'personality': '#a855f7', 'goal': '#22c55e',
    'success': '#f59e0b', 'constraint': '#ef4444', 'output': '#6b7280',
    'stop': '#64748b', 'example': '#ec4899', 'context': '#14b8a6',
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch || (line.startsWith('Role:') && sections.length === 0)) {
      if (currentContent.length > 0 || currentTitle) {
        const key = currentTitle.toLowerCase();
        let color = '#6b7280';
        for (const [k, v] of Object.entries(colorMap)) {
          if (key.includes(k)) { color = v; break; }
        }
        sections.push({ title: currentTitle || 'Prompt', content: currentContent.join('\n').trim(), color });
      }
      if (headingMatch) {
        currentTitle = headingMatch[2];
      } else {
        currentTitle = 'Role';
      }
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentContent.length > 0 || currentTitle) {
    const key = currentTitle.toLowerCase();
    let color = '#6b7280';
    for (const [k, v] of Object.entries(colorMap)) {
      if (key.includes(k)) { color = v; break; }
    }
    sections.push({ title: currentTitle || 'Prompt', content: currentContent.join('\n').trim(), color });
  }
  
  if (sections.length === 0) {
    const bl = text.split(/\n\n+/);
    for (const b of bl) {
      const t = b.trim();
      if (!t) continue;
      const fl = t.split(/\r?\n/)[0];
      const hd = fl.length < 60 && fl.indexOf(".") < 0;
      sections.push({ title: hd ? fl : "Prompt", content: hd ? t.substring(fl.length).trim() || fl : t, color: "#6b7280" });
    }
  }

  return sections;
}