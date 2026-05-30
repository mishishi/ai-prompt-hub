import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Copy, Zap, X } from "lucide-react";
import { useT } from "../../../i18n/LanguageContext";
import { STORAGE_KEYS } from '../../../utils/constants';

const STEPS = [
  {
    icon: Sparkles,
    titleEn: "Master Your AI Prompts",
    titleZh: "掌握你的 AI Prompt",
    descEn: "Browse curated, battle-tested prompt templates for every stage of development. Fill in your context, preview, and copy with one click.",
    descZh: "浏览精选的 Prompt 模板，覆盖开发的各个环节。填写你的场景变量，实时预览，一键复制使用。",
  },
  {
    icon: Copy,
    titleEn: "Fill → Preview → Copy",
    titleZh: "填写 → 预览 → 复制",
    descEn: "Each template has customizable variables. Tweak them to match your project, see the result in real-time, then copy the final prompt directly into Claude, GPT, or Codex.",
    descZh: "每个模板都有可自定义的变量。根据你的项目调整参数，实时查看生成效果，然后一键复制到 Claude、GPT 或 Codex 中使用。",
  },
  {
    icon: Zap,
    titleEn: "Not Sure What to Write?",
    titleZh: "不知道写什么？",
    descEn: "Let AI generate a prompt for you. Describe your task in plain language, and our generator will craft a structured, production-ready prompt. Free for 10 generations daily.",
    descZh: "让 AI 帮你生成 Prompt。用自然语言描述你的任务，AI 生成器会为你创建结构化、可直接使用的 Prompt。每天免费 10 次。",
  },
];

export function OnboardingGuide() {
  const { lang } = useT();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.onboarding);
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => { setVisible(false); localStorage.setItem(STORAGE_KEYS.onboarding, "1"); }, 250);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  if (!visible) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const tq = (en: string, zh: string) => lang === "zh-CN" ? zh : en;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-[var(--color-bench-surface-solid)] border border-[var(--color-bench-border)] rounded-2xl shadow-2xl max-w-[90vw] sm:max-w-md w-[90%] p-8 text-center animate-in fade-in zoom-in duration-300">
        <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] hover:bg-[var(--color-bench-border)] transition-colors cursor-pointer">
          <X size={16} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[var(--color-bench-accent)]/10 flex items-center justify-center mx-auto mb-5">
          <Icon size={26} className="text-[var(--color-bench-accent)]" />
        </div>

        <h2 className="text-lg font-bold text-[var(--color-bench-text)] mb-3 font-[var(--font-display)]">
          {tq(s.titleEn, s.titleZh)}
        </h2>
        <p className="text-sm text-[var(--color-bench-text-dim)] leading-relaxed mb-8">
          {tq(s.descEn, s.descZh)}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === step ? "bg-[var(--color-bench-accent)] w-5" : "bg-[var(--color-bench-border)] hover:bg-[var(--color-bench-muted)]"}`} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={dismiss} className="text-sm text-[var(--color-bench-muted)] hover:text-[var(--color-bench-text)] transition-colors cursor-pointer">
            {tq("Skip", "跳过")}
          </button>
          <button onClick={next} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-bench-accent)] text-[var(--color-bench-bg)] text-sm font-semibold hover:brightness-110 transition-all cursor-pointer">
            {step === STEPS.length - 1 ? tq("Get Started", "开始使用") : tq("Next", "下一步")}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
