import { useState, useMemo, useEffect } from 'react';
import { lazy, Suspense } from 'react';
const Editor = lazy(() => import('@monaco-editor/react'));
import { ArrowLeft, Save, Copy, Check, Sparkles, FileText, Plus, Trash2, Eye, EyeOff, Code, FormInput, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { templates } from '../../data/templates';
import { templateToCleanYaml, yamlToTemplate } from '../../utils/yaml';
import { renderPrompt } from '../../utils/renderer';
import { copyToClipboard } from '../../utils/clipboard';
import { forkTemplate, saveMyTemplate, getMyTemplates, deleteMyTemplate, getMyTemplate } from '../../store/myTemplates';
import { tName, tShort, tLabel, tOptions, tStage } from '../../data/templates/helper';
import { getPlatformLabel } from '../../utils/platform';
import { useT } from '../../i18n/LanguageContext';
import { VersionHistory } from './VersionHistory';
import type { Platform, Template } from '../../types';

type EditMode = 'form' | 'code';

const platforms: { id: Platform; label: string }[] = [
  { id: 'codex-cli', label: 'Codex CLI' },
  { id: 'claude', label: 'Claude Code' },
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'cursor', label: 'Cursor' },
];

// Quick-and-dirty: find the prompt block in a clean YAML and replace it
function replacePromptInYaml(yamlStr: string, newPrompt: string): string {
  const lines = yamlStr.split('\n');
  const promptIdx = lines.findIndex(l => l.startsWith('prompt:'));
  if (promptIdx === -1) return yamlStr;

  // Keep everything before prompt, then add the new prompt
  const preamble = lines.slice(0, promptIdx).join('\n');

  // Indent the new prompt as a YAML literal block
  const indented = newPrompt.split('\n').map((l, i) => i === 0 ? 'prompt: |' : '  ' + l).join('\n');
  return preamble + '\n' + indented;
}

export function PromptEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useT();

  const [yaml, setYaml] = useState('');
  const [savedYaml, setSavedYaml] = useState('');
  const [storedId, setStoredId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('codex-cli');
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [myList, setMyList] = useState(getMyTemplates());
  const [showPreview, setShowPreview] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('form');

  // Load template on mount
  useEffect(() => {
    if (!id) return;
    const mine = getMyTemplate(id);
    if (mine) {
      setStoredId(mine.id);
      setYaml(mine.yaml);
      setSavedYaml(mine.yaml);
      return;
    }
    const lib = templates.find((t) => t.id === id);
    if (lib) {
      const y = templateToCleanYaml(lib, lang);
      setYaml(y);
      setSavedYaml(y);
      setStoredId(null);
      return;
    }
  }, [id, lang]);

  const liveTemplate = useMemo((): Template | null => {
    if (!yaml.trim()) return null;
    return yamlToTemplate(yaml, id || 'new');
  }, [yaml, id]);

  const dirty = yaml !== savedYaml;

  const rendered = useMemo(() => {
    if (!liveTemplate) return lang === 'zh-CN' ? '# YAML 语法错误，请检查。' : '# Invalid YAML. Check syntax.';
    return renderPrompt(liveTemplate, platform, lang, values);
  }, [liveTemplate, platform, lang, values]);

  const handleSave = () => {
    const sid = storedId || forkTemplate(liveTemplate || { id: id!, name: '', short: '', category: [], difficulty: 'Intermediate', variables: [], prompt: '' }).id;
    saveMyTemplate(sid, yaml);
    setSavedYaml(yaml);
    setStoredId(sid);
    setSaved(true);
    setMyList(getMyTemplates());
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFork = () => {
    if (!liveTemplate) return;
    const stored = forkTemplate(liveTemplate, lang);
    setStoredId(stored.id);
    setSavedYaml(stored.yaml);
    setMyList(getMyTemplates());
  };

  const handleDelete = (tid: string) => {
    deleteMyTemplate(tid);
    setMyList(getMyTemplates());
    if (tid === storedId) {
      navigate('/');
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(rendered);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromptChange = (newPrompt: string) => {
    setYaml(replacePromptInYaml(yaml, newPrompt));
  };

  const isOwned = !!storedId;
  const promptText = useMemo(() => {
    if (!liveTemplate) return '';
    return lang === 'zh-CN' && liveTemplate.promptZh ? liveTemplate.promptZh : liveTemplate.prompt;
  }, [liveTemplate, lang]);

  return (
    <div className="flex h-full">
      {/* Left sidebar - My Templates */}
      <div className="w-52 border-r border-[var(--color-bench-border)] bg-[var(--color-bench-surface)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--color-bench-border)]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors mb-2"><ArrowLeft size={12} />{lang === 'zh-CN' ? '返回' : 'Back'}</button>
          <p className="text-xs font-semibold text-[var(--color-bench-muted)] uppercase tracking-wider">{lang === 'zh-CN' ? '我的模板' : 'My Templates'}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {myList.map((mt) => (
            <div key={mt.id} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${mt.id === storedId ? 'bg-[var(--color-bench-accent)]/10 text-[var(--color-bench-accent)]' : 'text-[var(--color-bench-muted)] hover:bg-white/5 hover:text-[var(--color-bench-text)]'}`} onClick={() => { navigate(`/edit/${mt.id}`); }}>
              <FileText size={12} />
              <span className="flex-1 truncate">{((): string => { const tpl = yamlToTemplate(mt.yaml, mt.id); return tpl ? (lang === 'zh-CN' && tpl.nameZh ? tpl.nameZh : tpl.name) : mt.id; })()}</span>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(mt.id); }} className="text-[var(--color-bench-muted)] hover:text-[var(--color-bench-error)] transition-colors"><Trash2 size={10} /></button>
            </div>
          ))}
          {myList.length === 0 && (
            <p className="text-[10px] text-[var(--color-bench-muted)] px-2">{lang === 'zh-CN' ? '暂无模板，Fork 一个开始吧' : 'No templates yet. Fork one to start.'}</p>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-9 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-surface)] flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-bench-text)]">
              {liveTemplate ? (lang === 'zh-CN' && liveTemplate.nameZh ? liveTemplate.nameZh : liveTemplate.name) : '...'}
            </span>
            {dirty && <span className="text-[10px] text-[var(--color-bench-accent)]">*</span>}
          </div>
          <div className="flex items-center gap-1">
            {/* Edit mode toggle */}
            <div className="flex items-center bg-[var(--color-bench-bg)] rounded border border-[var(--color-bench-border)] mr-2">
              <button onClick={() => setEditMode('form')} className={`px-2 py-1 text-[10px] rounded-l flex items-center gap-1 transition-colors ${editMode === 'form' ? 'bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)]' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]'}`}>
                <FormInput size={10} />{lang === 'zh-CN' ? '表单' : 'Form'}
              </button>
              <button onClick={() => setEditMode('code')} className={`px-2 py-1 text-[10px] rounded-r flex items-center gap-1 transition-colors ${editMode === 'code' ? 'bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)]' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]'}`}>
                <Code size={10} />{lang === 'zh-CN' ? '代码' : 'Code'}
              </button>
            </div>

            {!isOwned && (
              <button onClick={handleFork} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] hover:bg-[var(--color-bench-accent)]/90 transition-colors">
                <Plus size={10} />{lang === 'zh-CN' ? 'Fork' : 'Fork'}
              </button>
            )}
            {isOwned && (
              <button onClick={handleSave} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${saved ? 'bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]' : 'bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] hover:bg-[var(--color-bench-accent)]/90'}`}>
                {saved ? <Check size={10} /> : <Save size={10} />}{saved ? (lang === 'zh-CN' ? '已保存' : 'Saved') : (lang === 'zh-CN' ? '保存' : 'Save')}
              </button>
            )}

            <div className="w-px h-4 bg-[var(--color-bench-border)] mx-1" />

            {/* Platform tabs */}
            {platforms.map((p) => (
              <button key={p.id} onClick={() => setPlatform(p.id)} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${platform === p.id ? 'bg-white/10 text-[var(--color-bench-text)]' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]'}`}>
                {p.label}
              </button>
            ))}

            <div className="w-px h-4 bg-[var(--color-bench-border)] mx-1" />

            <button onClick={() => setShowPreview(!showPreview)} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${showPreview ? 'bg-white/10 text-[var(--color-bench-text)]' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]'}`}>
              {showPreview ? <Eye size={10} /> : <EyeOff size={10} />}{lang === 'zh-CN' ? '预览' : 'Preview'}
            </button>
            <button onClick={handleCopy} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${copied ? 'bg-[var(--color-bench-success)]/15 text-[var(--color-bench-success)]' : 'text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)]'}`}>
              {copied ? <Check size={10} /> : <Copy size={10} />}{copied ? (lang === 'zh-CN' ? '已复制' : 'Copied') : (lang === 'zh-CN' ? '复制' : 'Copy')}
            </button>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className="flex-1 flex min-h-0">
          {/* Editor area */}
          <div className="flex-1 min-w-0">
            {editMode === 'form' ? (
              <div className="h-full flex flex-col">
                {/* Variables */}
                {liveTemplate && liveTemplate.variables.length > 0 && (
                  <div className="px-4 py-3 border-b border-[var(--color-bench-border)] bg-[var(--color-bench-bg)]">
                    <p className="text-[10px] text-[var(--color-bench-muted)] uppercase tracking-wider mb-2">{lang === 'zh-CN' ? '变量' : 'Variables'}</p>
                    <div className="flex flex-wrap gap-3">
                      {liveTemplate.variables.map((v) => (
                        <div key={v.name} className="flex items-center gap-2">
                          <label className="text-[11px] text-[var(--color-bench-muted)] whitespace-nowrap">{tLabel(v, lang)}</label>
                          {v.type === 'enum' && v.options ? (
                            <select value={String(values[v.name] ?? v.default ?? '')} onChange={(e) => setValues({ ...values, [v.name]: e.target.value })} className="px-2 py-1 bg-[var(--color-bench-surface)] border border-[var(--color-bench-border)] rounded text-xs text-[var(--color-bench-text)] min-w-[120px]">
                              {(tOptions(v, lang) || v.options).map((o: string) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : v.type === 'boolean' ? (
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={Boolean(values[v.name] ?? v.default)} onChange={(e) => setValues({ ...values, [v.name]: e.target.checked })} className="accent-[var(--color-bench-accent)]" />
                              <span className="text-[10px] text-[var(--color-bench-muted)]">{Boolean(values[v.name] ?? v.default) ? 'On' : 'Off'}</span>
                            </label>
                          ) : (
                            <input type="text" value={String(values[v.name] ?? '')} onChange={(e) => setValues({ ...values, [v.name]: e.target.value })} placeholder="..." className="px-2 py-1 bg-[var(--color-bench-surface)] border border-[var(--color-bench-border)] rounded text-xs text-[var(--color-bench-text)] min-w-[200px]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt textarea */}
                <div className="flex-1 flex flex-col min-h-0 p-4 bg-[var(--color-bench-bg)]">
                  <label className="text-[10px] text-[var(--color-bench-muted)] uppercase tracking-wider mb-2">{lang === 'zh-CN' ? 'Prompt 内容' : 'Prompt Content'}</label>
                  <textarea
                    value={promptText}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    className="flex-1 w-full resize-none bg-[var(--color-bench-surface)] border border-[var(--color-bench-border)] rounded p-3 text-xs text-[var(--color-bench-text)] font-mono leading-relaxed focus:outline-none focus:border-[var(--color-bench-accent)] transition-colors"
                    placeholder={lang === 'zh-CN' ? '在此编辑 Prompt...' : 'Edit your prompt here...'}
                    spellCheck={false}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full">
                <Suspense fallback={<div className="h-full flex items-center justify-center bg-[var(--color-bench-bg)] text-xs text-[var(--color-bench-muted)]">{lang === 'zh-CN' ? '编辑器加载中...' : 'Loading editor...'}</div>}>
            <Editor
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme('bench-dark', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [
                        { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
                        { token: 'string', foreground: 'a5d6ff' },
                        { token: 'string.key', foreground: '79c0ff' },
                        { token: 'string.value', foreground: 'a5d6ff' },
                        { token: 'number', foreground: 'ffa657' },
                        { token: 'keyword', foreground: 'ff7b72' },
                        { token: 'type', foreground: 'd2a8ff' },
                        { token: 'variable', foreground: 'ffa657' },
                        { token: 'variable.name', foreground: 'e6edf3' },
                        { token: 'meta', foreground: '8b949e' },
                        { token: 'tag', foreground: '7ee787' },
                        { token: 'attribute.name', foreground: '79c0ff' },
                        { token: 'attribute.value', foreground: 'a5d6ff' },
                        { token: 'delimiter', foreground: '8b949e' },
                        { token: 'operator', foreground: 'ff7b72' },
                        { token: 'identifier', foreground: 'e6edf3' },
                      ],
                      colors: {
                        'editor.background': '#0a0a14',
                        'editor.foreground': '#e6edf3',
                        'editorLineNumber.foreground': '#353e4a',
                        'editorLineNumber.activeForeground': '#6e7681',
                        'editor.selectionBackground': '#1f6feb33',
                        'editorCursor.foreground': '#d4a843',
                        'editor.inactiveSelectionBackground': '#1f6feb22',
                        'editorIndentGuide.background': '#1b2330',
                        'editorIndentGuide.activeBackground': '#30363d',
                        'editor.lineHighlightBackground': '#0f0f1a',
                        'editorBracketMatch.background': '#1f6feb22',
                        'editorBracketMatch.border': '#1f6feb44',
                      }
                    });
                  }}
                  height="100%"
                  language="yaml"
                  theme="bench-dark"
                  value={yaml}
                  onChange={(v) => setYaml(v || '')}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    bracketPairColorization: { enabled: true },
                    matchBrackets: 'always',
                    renderLineHighlight: 'line',
                    guides: { indentation: true, bracketPairs: true },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    readOnly: !isOwned,
                    unicodeHighlight: { ambiguousCharacters: true, invisibleCharacters: true, nonBasicAscii: true },
                  }}
                />
            </Suspense>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-96 border-l border-[var(--color-bench-border)] bg-[var(--color-bench-bg)] flex flex-col shrink-0">
              <div className="px-3 py-2 border-b border-[var(--color-bench-border)]">
                <span className="text-[10px] text-[var(--color-bench-muted)] uppercase tracking-wider">{lang === 'zh-CN' ? '渲染预览' : 'Rendered Preview'}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <pre className="text-xs text-[var(--color-bench-text)] leading-relaxed whitespace-pre-wrap font-mono">{rendered}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {showVersions && storedId && (
        <VersionHistory
          promptId={storedId}
          onRollback={(yaml) => { setYaml(yaml); setSavedYaml(yaml); }}
          onClose={() => setShowVersions(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
