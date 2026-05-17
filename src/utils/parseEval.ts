export interface EvalResult {
  score: number | null;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export function parseEval(text: string): EvalResult {
  if (!text) return { score: null, strengths: [], improvements: [], suggestions: [] };

  // Extract score
  let score: number | null = null;
  const scoreIdx = text.indexOf("Score:");
  if (scoreIdx >= 0) {
    const rest = text.substring(scoreIdx + 6);
    const digits = rest.match(/(\d+)/);
    if (digits) score = parseInt(digits[1]);
  }

  // Parse by splitting on emoji markers
  const strengths: string[] = [];
  const improvements: string[] = [];
  const suggestions: string[] = [];
  let current: string[] | null = null;

  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  for (const line of rawLines) {
    const t = line.trim();
    if (t.startsWith("[+]")) { current = strengths; strengths.push(t.replace("[+]", "").trim()); }
    else if (t.startsWith("[-]")) { current = improvements; improvements.push(t.replace("[-]", "").trim()); }
    else if (t.startsWith("[~]")) { current = suggestions; suggestions.push(t.replace("[~]", "").trim()); }
    else if (current && t && !t.toLowerCase().startsWith('score') && !t.startsWith('[')) {
      current[current.length - 1] += ' ' + t;
    }
  }

    // Fallback: if no emoji markers found, try keyword-based parsing
  if (strengths.length === 0 && improvements.length === 0 && suggestions.length === 0) {
    const blocks = text.split(/\n(?=\[[+\-~]\]|Score:|优点|改进|建议|Strengths|Improvements|Suggestions|Weakness)/);
    for (const block of blocks) {
      const t = block.trim();
      if (!t || t.toLowerCase().startsWith('score')) continue;
      if (t.startsWith('[+]') || t.includes('优点') || t.includes('Strength')) {
        strengths.push(t.replace(/^\[\+\]\s*/, '').replace(/^优点[：:]\s*/, '').replace(/^Strength[s]?[：:]\s*/i, '').trim());
      } else if (t.startsWith('[-]') || t.includes('改进') || t.includes('Improve') || t.includes('Weakness')) {
        improvements.push(t.replace(/^\[-\]\s*/, '').replace(/^[可]?改进[：:]\s*/, '').replace(/^Improvement[s]?[：:]\s*/i, '').replace(/^Weakness[es]?[：:]\s*/i, '').trim());
      } else if (t.startsWith('[~]') || t.includes('建议') || t.includes('Suggest')) {
        suggestions.push(t.replace(/^\[~\]\s*/, '').replace(/^建议[：:]\s*/, '').replace(/^Suggestion[s]?[：:]\s*/i, '').trim());
      }
    }
  }

  // Filter empty strings
  return {
    score,
    strengths: strengths.filter(s => s.length > 0),
    improvements: improvements.filter(s => s.length > 0),
    suggestions: suggestions.filter(s => s.length > 0)
  };
}