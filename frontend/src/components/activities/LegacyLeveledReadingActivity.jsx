import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";
import { useSmartBack } from "@/lib/navigationHistory";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Layers3,
  Leaf,
  Printer,
  RefreshCw,
  SlidersHorizontal,
  Star,
  Tag,
} from "lucide-react";

const EMPTY_LEVELS = Object.freeze({});

export const LEGACY_LEVEL_THEME = {
  green: {
    title: "Foundational",
    pillBg: "#ECFDF5",
    pillFg: "#065F46",
    pillBorder: "#A7F3D0",
    cardBg: "#F3FAF6",
    cardBorder: "#A7F3D0",
    cardGradient: "linear-gradient(135deg,#10B981 0%,#22C55E 100%)",
    cardCta: "#059669",
    glow: "rgba(16, 185, 129, 0.22)",
    dot: "#10B981",
    complexity: 1,
    questionsPerLetter: 3,
  },
  amber: {
    title: "Intermediate",
    pillBg: "#FFFBEB",
    pillFg: "#92400E",
    pillBorder: "#FDE68A",
    cardBg: "#FBF7EF",
    cardBorder: "#FED7AA",
    cardGradient: "linear-gradient(135deg,#F59E0B 0%,#F97316 100%)",
    cardCta: "#D97706",
    glow: "rgba(245, 158, 11, 0.22)",
    dot: "#F59E0B",
    complexity: 2,
    questionsPerLetter: 4,
  },
  red: {
    title: "Complex",
    pillBg: "#FFF1F2",
    pillFg: "#9F1239",
    pillBorder: "#FECDD3",
    cardBg: "#FCF5F6",
    cardBorder: "#FECDD3",
    cardGradient: "linear-gradient(135deg,#F43F5E 0%,#E11D48 100%)",
    cardCta: "#E11D48",
    glow: "rgba(244, 63, 94, 0.22)",
    dot: "#F43F5E",
    complexity: 3,
    questionsPerLetter: 5,
  },
  pink: {
    title: "Bonus",
    pillBg: "#FDF2F8",
    pillFg: "#BE185D",
    pillBorder: "#FBCFE8",
    cardBg: "#FDF4FA",
    cardBorder: "#F9A8D4",
    cardGradient: "linear-gradient(135deg,#F472B6 0%,#EC4899 100%)",
    cardCta: "#DB2777",
    glow: "rgba(236, 72, 153, 0.32)",
    dot: "#FF36B0",
    complexity: 3,
    questionsPerLetter: 4,
    neon: true,
  },
};

const LEVEL_ICON = {
  green: Leaf,
  amber: CalendarDays,
  red: Layers3,
  pink: Star,
};

export function LegacyLeveledReadingActivity({
  activity,
  BreadcrumbHeader,
  ComplexityDots,
  ReadingExercise,
  formatCategoryTitle,
}) {
  const navigate = useNavigate();
  const smartBack = useSmartBack();
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get("level");
  const letterId = searchParams.get("letter");
  const isDone = searchParams.get("done") === "1";
  const levels = activity.content.levels || EMPTY_LEVELS;
  const { logActivity } = useSession();

  // Per-run stats accumulator: keyed by `${level}:${letterId}:${qid}` for dedupe.
  const statsRef = useRef({
    startedAt: null,
    levelKey: null,
    letters: new Set(), // letter ids attempted this run
    attempts: new Map(), // key -> { correct, usedHint }
    hintsBeforeAttempt: new Set(), // keys where hint was shown before answer
  });
  const [, forceTick] = useState(0);
  const bumpStats = () => forceTick((t) => t + 1);

  const ensureRunForLevel = (key) => {
    const s = statsRef.current;
    if (s.levelKey !== key) {
      s.startedAt = new Date();
      s.levelKey = key;
      s.letters = new Set();
      s.attempts = new Map();
      s.hintsBeforeAttempt = new Set();
    } else if (!s.startedAt) {
      s.startedAt = new Date();
    }
  };

  const handleAttempt = (info) => {
    const s = statsRef.current;
    if (!letter || !lv) return;
    const k = `${lv.key}:${letter.id}:${info.qid}`;
    const usedHint = info.usedHint || s.hintsBeforeAttempt.has(k);
    s.attempts.set(k, { correct: info.correct, usedHint });
    s.letters.add(letter.id);
    bumpStats();
  };
  const handleHint = (info) => {
    const s = statsRef.current;
    if (!letter || !lv) return;
    const k = `${lv.key}:${letter.id}:${info.qid}`;
    if (!s.attempts.has(k)) s.hintsBeforeAttempt.add(k);
    bumpStats();
  };
  const resetStats = () => {
    statsRef.current = {
      startedAt: null,
      levelKey: null,
      letters: new Set(),
      attempts: new Map(),
      hintsBeforeAttempt: new Set(),
    };
    bumpStats();
  };

  const [fullscreen, setFullscreen] = useState(() => {
    try { return sessionStorage.getItem("soniva.reading.fullscreen") === "1"; } catch { return false; }
  });
  const toggleFullscreen = () => {
    setFullscreen((v) => {
      const nv = !v;
      try { sessionStorage.setItem("soniva.reading.fullscreen", nv ? "1" : "0"); } catch { /* ignore */ }
      return nv;
    });
  };
  // Lock body scroll while fullscreen so the overlay owns scrolling
  useEffect(() => {
    if (fullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [fullscreen]);

  const lv = level && levels[level] ? levels[level] : null;
  const letters = lv?.letters || [];
  const letter = lv ? letters.find((l) => String(l.id) === String(letterId)) : null;
  const currentIdx = letter ? letters.findIndex((l) => String(l.id) === String(letterId)) : -1;
  const hasNext = currentIdx >= 0 && currentIdx < letters.length - 1;

  // Log this as a distinct activity entry once both level and letter are chosen
  useEffect(() => {
    if (lv && letter) {
      logActivity({
        category: activity.category,
        activity_slug: `${activity.slug}-${lv.key}-${letter.id}`,
        activity_title: `${activity.title} — ${lv.title} · ${letter.title || `Letter ${letter.id}`}`,
      });
      ensureRunForLevel(lv.key);
    }
  }, [lv, letter, activity, logActivity]);

  const categoryName = formatCategoryTitle(activity.category);

  const itemLabelSingular = (lv && lv.item_label_singular) || "Letter";
  const itemLabelPlural = (lv && lv.item_label_plural) || "letters";

  const computeSummary = () => {
    const s = statsRef.current;
    const totalLetters = letters.length;
    const lettersAttempted = s.letters.size;
    const totalQuestions = s.attempts.size;
    const correctCount = Array.from(s.attempts.values()).filter((a) => a.correct).length;
    const hintsUsed = Array.from(s.attempts.values()).filter((a) => a.usedHint).length;
    const startedAt = s.startedAt ? new Date(s.startedAt) : new Date();
    const endedAt = new Date();
    const durationSec = Math.max(0, Math.round((endedAt - startedAt) / 1000));
    const accuracyPct = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const hintPct = totalQuestions ? Math.round((hintsUsed / totalQuestions) * 100) : 0;
    return {
      taskName: activity.title,
      levelTitle: (lv && lv.title) || "",
      startedAt,
      endedAt,
      durationSec,
      lettersAttempted,
      totalLetters,
      itemLabelSingular,
      itemLabelPlural,
      totalQuestions,
      correctCount,
      accuracyPct,
      hintsUsed,
      hintPct,
    };
  };

  const goHub = () => navigate("/dashboard");
  const goCategory = () => navigate(`/category/${activity.category}`);
  const goDifficulty = () => setSearchParams({});
  const goLevelOverview = (key) => setSearchParams({ level: key });
  const hubCrumb = { label: "Hub", onClick: goHub };
  const categoryCrumb = { label: categoryName, onClick: goCategory };
  const activityCrumb = { label: activity.title, onClick: goDifficulty };
  const levelCrumb = lv ? { label: lv.title, onClick: () => goLevelOverview(lv.key) } : null;

  // Compute breadcrumb crumbs + back behaviour for the current step
  let crumbs;
  let onBack;
  if (!lv) {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, "Choose difficulty level"];
    onBack = smartBack;
  } else if (isDone) {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, levelCrumb, "Complete"];
    onBack = () => setSearchParams({ level: lv.key });
  } else if (!letter) {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, lv.title];
    onBack = () => setSearchParams({});
  } else {
    crumbs = [hubCrumb, categoryCrumb, activityCrumb, levelCrumb, `${itemLabelSingular} ${letter.id}`];
    onBack = () => setSearchParams({ level: lv.key });
  }

  const top = <BreadcrumbHeader crumbs={crumbs} onBack={onBack} />;

  if (!lv) {
    return (
      <>
        {top}
        <div className="mt-5">
          <DifficultyPicker
            activity={activity}
            ComplexityDots={ComplexityDots}
            onSelect={(key) => setSearchParams({ level: key })}
          />
        </div>
      </>
    );
  }

  if (isDone) {
    return (
      <>
        {top}
        <div className="mt-5">
          <LegacyLeveledReadingCompletionScreen
            level={lv}
            summary={computeSummary()}
            onChangeLevel={() => { resetStats(); setSearchParams({}); }}
            onReplay={() => {
              resetStats();
              const first = letters[0];
              if (first) setSearchParams({ level: lv.key, letter: String(first.id) });
            }}
          />
        </div>
      </>
    );
  }

  if (!letter) {
    return (
      <>
        {top}
        <div className="mt-5">
          <LetterPicker
            activity={activity}
            level={lv}
            onPickLetter={(id) => setSearchParams({ level: lv.key, letter: String(id) })}
            onChangeLevel={() => setSearchParams({})}
          />
        </div>
      </>
    );
  }

  const theme = LEGACY_LEVEL_THEME[lv.key];
  const innerActivity = {
    ...activity,
    slug: `${activity.slug}-${lv.key}-${letter.id}`,
    title: `${activity.title} — ${lv.title} · ${letter.title || `Letter ${letter.id}`}`,
    content: {
      text: letter.text,
      letterhead: letter.letterhead,
      questions: letter.questions,
    },
  };

  const onNext = () => {
    if (hasNext) {
      setSearchParams({ level: lv.key, letter: String(letters[currentIdx + 1].id) });
    } else {
      setSearchParams({ level: lv.key, done: "1" });
    }
  };

  const letterView = (
    <ReadingExercise
      key={`${lv.key}-${letter.id}`}
      activity={innerActivity}
      onChangeLevel={() => { resetStats(); setSearchParams({}); }}
      levelLabel={
        theme
          ? {
              text: `${lv.title} · ${itemLabelSingular} ${letter.id} of ${letters.length}`,
              color: theme.pillFg,
              border: theme.pillBorder,
              shadow: theme.glow,
              dotsBg: theme.pillBg,
              dot: theme.dot,
              dotMuted: theme.pillBorder,
              complexity: theme.complexity || 1,
            }
          : null
      }
      onNext={onNext}
      nextLabel={hasNext ? `Next ${itemLabelPlural.replace(/s$/, "")}` : "Finish"}
      fullscreen={fullscreen}
      onToggleFullscreen={toggleFullscreen}
      onAttempt={handleAttempt}
      onHint={handleHint}
      onEnd={() => setSearchParams({ level: lv.key, done: "1" })}
      layout={
        activity.slug === "prescription-medication-labels"
          ? "stacked"
          : "split"
      }
    />
  );

  if (fullscreen) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-white overflow-auto px-6 sm:px-10 py-5"
        data-testid="reading-fullscreen"
      >
        <div className="max-w-[1400px] mx-auto">{letterView}</div>
      </div>,
      document.body
    );
  }

  return (
    <>
      {top}
      <div className="mt-5">{letterView}</div>
    </>
  );
}

function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function fmtDateTime(d) {
  if (!d) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function downloadSummaryPdf(summary) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  const dateStr = fmtDateTime(summary.startedAt);
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>artiqal — Session Summary</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181B; margin: 0; padding: 24px; }
  .wrap { max-width: 720px; margin: 0 auto; }
  .head { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 2px solid #4F46E5; }
  .logo-img { width: 40px; height: 40px; display: inline-block; object-fit: contain; border-radius: 12px; vertical-align: middle; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
  .doctype { margin-left: auto; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #71717A; font-weight: 700; }
  h1 { font-size: 22px; margin: 22px 0 4px; font-weight: 800; letter-spacing: -0.01em; }
  .sub { color: #52525B; font-size: 13px; margin-bottom: 18px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; padding: 14px 18px; background: #F4F4F5; border-radius: 10px; border: 1px solid #E4E4E7; }
  .row { display: flex; justify-content: space-between; gap: 16px; padding: 4px 0; }
  .k { color: #52525B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  .v { font-weight: 700; font-size: 14px; }
  .stats { margin-top: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .stat { padding: 14px; border-radius: 10px; border: 1px solid #E4E4E7; }
  .stat .num { font-size: 26px; font-weight: 800; letter-spacing: -0.01em; }
  .stat .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #52525B; font-weight: 700; margin-top: 2px; }
  .notes { margin-top: 22px; padding-top: 14px; border-top: 1px dashed #D4D4D8; font-size: 12px; color: #52525B; }
  .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #E4E4E7; font-size: 11px; color: #71717A; display: flex; justify-content: space-between; }
  @media print { body { padding: 0; } .noprint { display: none; } }
  .actions { margin-top: 22px; display: flex; gap: 10px; justify-content: flex-end; }
  .btn { background: #4F46E5; color: white; border: none; border-radius: 999px; padding: 10px 18px; font-weight: 700; cursor: pointer; font-size: 13px; }
  .btn.secondary { background: white; color: #18181B; border: 1px solid #D4D4D8; }
</style>
</head><body><div class="wrap">
  <div class="head">
    <img class="logo-img" src="/brand/artiqal-logo-v2.png" alt="artiqal logo" />
    <span class="brand">artiqal</span>
    <span class="doctype">Session Summary</span>
  </div>
  <h1>${summary.taskName}</h1>
  <div class="sub">Difficulty: <strong>${summary.levelTitle}</strong></div>
  <div class="grid">
    <div class="row"><span class="k">Date &amp; Time</span><span class="v">${dateStr}</span></div>
    <div class="row"><span class="k">Duration</span><span class="v">${fmtDuration(summary.durationSec)}</span></div>
    <div class="row"><span class="k">Task</span><span class="v">${summary.taskName}</span></div>
    <div class="row"><span class="k">Difficulty</span><span class="v">${summary.levelTitle}</span></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="num">${summary.lettersAttempted} of ${summary.totalLetters}</div><div class="lbl">${(summary.itemLabelPlural || "Letters")} completed</div></div>
    <div class="stat"><div class="num">${summary.correctCount} / ${summary.totalQuestions}</div><div class="lbl">Correct answers (${summary.accuracyPct}%)</div></div>
    <div class="stat"><div class="num">${summary.hintPct}%</div><div class="lbl">Hint used on questions</div></div>
  </div>
  <div class="foot"><span>artiqal — functional communication practice</span><span>Generated ${fmtDateTime(summary.endedAt)}</span></div>
  <div class="actions noprint">
    <button class="btn secondary" onclick="window.close()">Close</button>
    <button class="btn" onclick="window.print()">Save as PDF</button>
  </div>
</div>
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body></html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printAllLabels({ activity, level }) {
  const letters = level.letters || [];
  if (!letters.length) return;
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  const itemSing = level.item_label_singular || "Letter";
  const accentByKey = { green: "#059669", amber: "#D97706", red: "#DC2626", pink: "#DB2777" };
  const accent = accentByKey[level.key] || "#4F46E5";

  const renderLetter = (l, idx) => {
    const lh = l.letterhead || {};
    const med = lh.medication || {};
    const recipients = lh.recipient_lines || [];
    const addr = lh.address_lines || [];
    const brand = lh.brand_color || accent;
    const isLabel = lh.format === "label";
    return `
      <section class="page" data-testid="print-label-${idx + 1}">
        <header class="ph">
          <div class="ph-l">
            <div class="brand" style="color:${escapeHtml(brand)}">${escapeHtml(lh.clinic_name || "")}</div>
            <div class="addr">
              ${addr.map((a) => `<div>${escapeHtml(a)}</div>`).join("")}
              ${lh.phone ? `<div>Tel: ${escapeHtml(lh.phone)}</div>` : ""}
            </div>
          </div>
          <div class="ph-r">
            <div class="rx">R<sub>x</sub></div>
          </div>
        </header>
        ${isLabel ? `
          <div class="label-card" style="border-color:${escapeHtml(brand)}">
            ${med.rx_number ? `<div class="row"><span class="k">Rx No:</span> ${escapeHtml(med.rx_number)}</div>` : ""}
            ${recipients.length ? `<div class="row"><span class="k">Patient:</span> ${recipients.map(escapeHtml).join("<br/>")}</div>` : ""}
            ${med.name ? `<div class="med-name">${escapeHtml(med.name).toUpperCase()}</div>` : ""}
            ${med.instruction ? `<div class="med-instr ${med.instruction_uppercase ? "upper" : ""}">${escapeHtml(med.instruction)}</div>` : ""}
            <div class="meta">
              ${med.quantity ? `<div><span class="k">Quantity:</span> ${escapeHtml(med.quantity)}</div>` : ""}
              ${med.prescriber ? `<div><span class="k">Prescriber:</span> ${escapeHtml(med.prescriber)}</div>` : ""}
              ${med.date_dispensed ? `<div><span class="k">Date dispensed:</span> ${escapeHtml(med.date_dispensed)}</div>` : ""}
            </div>
            ${med.warning ? `<div class="warn"><span class="warn-i">&#9888;</span> <span><strong>Warning:</strong> ${escapeHtml(med.warning)}</span></div>` : ""}
          </div>
        ` : `
          <div class="letter-body">
            ${recipients.length ? `<div class="recipients">${recipients.map(escapeHtml).join("<br/>")}</div>` : ""}
            <div class="letter-text">${escapeHtml(l.text || "").replace(/\n/g, "<br/>")}</div>
          </div>
        `}
        <h3 class="qh">Questions</h3>
        <ol class="qs">
          ${(l.questions || [])
            .map(
              (q) => `<li>
                <div class="q">${escapeHtml(q.q || "")}</div>
                <div class="answer-line"></div>
              </li>`
            )
            .join("")}
        </ol>
        <div class="footnote">${escapeHtml(activity.title)} — ${escapeHtml(level.title)} · ${escapeHtml(itemSing)} ${idx + 1} of ${letters.length}</div>
      </section>
    `;
  };

  const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>${escapeHtml(activity.title)} — ${escapeHtml(level.title)}</title>
<style>
  @page { size: A4; margin: 14mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181B; margin: 0; padding: 0; }
  .cover { padding: 32px 28px 24px; border-bottom: 2px solid ${escapeHtml(accent)}; page-break-after: always; }
  .cover .logo { display: flex; align-items: center; gap: 10px; }
  .cover .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
  .cover h1 { font-size: 26px; margin: 18px 0 6px; font-weight: 800; letter-spacing: -0.01em; }
  .cover .sub { color: #52525B; font-size: 13px; }
  .cover .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; border: 1.5px solid ${escapeHtml(accent)}; color: ${escapeHtml(accent)}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; margin-top: 14px; }
  .cover .meta { margin-top: 18px; font-size: 12px; color: #52525B; }
  .page { padding: 24px 4px; page-break-after: always; }
  .page:last-of-type { page-break-after: auto; }
  .ph { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 10px; border-bottom: 1px dashed #D4D4D8; }
  .ph .brand { font-size: 16px; font-weight: 800; letter-spacing: -0.01em; }
  .ph .addr { font-size: 11px; color: #52525B; margin-top: 2px; line-height: 1.45; }
  .ph .rx { font-family: Georgia, serif; font-size: 28px; font-weight: 800; color: #A1A1AA; line-height: 1; }
  .ph .rx sub { font-size: 16px; }
  .label-card { margin-top: 14px; border: 1.5px solid #4F46E5; border-radius: 12px; padding: 16px 18px; background: #FAFAF9; }
  .label-card .row { font-size: 12px; line-height: 1.6; color: #18181B; }
  .label-card .k { color: #52525B; font-weight: 600; }
  .label-card .med-name { margin-top: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.02em; }
  .label-card .med-instr { font-size: 13px; margin-top: 4px; line-height: 1.55; }
  .label-card .med-instr.upper { text-transform: uppercase; font-weight: 700; }
  .label-card .meta { margin-top: 10px; display: flex; gap: 18px; flex-wrap: wrap; font-size: 12px; }
  .label-card .warn { margin-top: 10px; padding: 8px 10px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; font-size: 12px; display: flex; gap: 8px; align-items: flex-start; }
  .label-card .warn-i { color: #B45309; font-size: 14px; line-height: 1; }
  .letter-body { margin-top: 14px; }
  .letter-body .recipients { font-size: 12px; color: #52525B; margin-bottom: 10px; line-height: 1.5; }
  .letter-body .letter-text { font-size: 13px; line-height: 1.65; white-space: pre-wrap; }
  .qh { margin: 18px 0 8px; font-size: 14px; font-weight: 800; letter-spacing: -0.01em; }
  .qs { margin: 0; padding: 0 0 0 20px; }
  .qs li { margin-bottom: 14px; font-size: 12.5px; line-height: 1.5; }
  .qs .q { font-weight: 600; color: #18181B; }
  .answer-line { margin-top: 10px; border-bottom: 1px solid #A1A1AA; height: 22px; }
  .footnote { margin-top: 16px; font-size: 10px; color: #A1A1AA; text-align: right; letter-spacing: 0.05em; }
  @media print { .noprint { display: none; } }
  .actions { position: fixed; top: 14px; right: 14px; display: flex; gap: 8px; }
  .btn { background: ${escapeHtml(accent)}; color: white; border: none; border-radius: 999px; padding: 10px 16px; font-weight: 700; cursor: pointer; font-size: 12px; }
  .btn.secondary { background: white; color: #18181B; border: 1px solid #D4D4D8; }
</style>
</head><body>
  <div class="actions noprint">
    <button class="btn secondary" onclick="window.close()">Close</button>
    <button class="btn" onclick="window.print()">Save as PDF</button>
  </div>
  <section class="cover">
    <div class="logo">
      <img src="/brand/artiqal-logo-v2.png" width="36" height="36" alt="artiqal" style="border-radius: 11px; object-fit: contain;" />
      <span class="brand">artiqal</span>
    </div>
    <div class="pill">${escapeHtml(level.title)} · ${escapeHtml(level.key.toUpperCase())}</div>
    <h1>${escapeHtml(activity.title)}</h1>
    <div class="sub">${escapeHtml(level.blurb || "")}</div>
    <div class="meta">${letters.length} ${escapeHtml(letters.length === 1 ? itemSing.toLowerCase() : (level.item_label_plural || "items").toLowerCase())} · printed ${escapeHtml(fmtDateTime(new Date()))}</div>
  </section>
  ${letters.map(renderLetter).join("")}
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 350); });</script>
</body></html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export function LegacyLeveledReadingCompletionScreen({
  level,
  summary,
  onChangeLevel,
  onReplay,
  replayLabel = "Restart from Letter 1",
}) {
  const theme = LEGACY_LEVEL_THEME[level.key];
  const stats = summary || {
    lettersAttempted: 0,
    totalLetters: (level.letters || []).length,
    correctCount: 0,
    totalQuestions: 0,
    accuracyPct: 0,
    hintPct: 0,
    durationSec: 0,
    startedAt: new Date(),
    endedAt: new Date(),
    levelTitle: level.title,
    taskName: "Reading an Appointment Letter",
  };
  return (
    <div
      className="rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto"
      style={{ background: theme.cardBg, border: `1.5px solid ${theme.cardBorder}` }}
      data-testid="completion-screen"
    >
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full text-white mb-4"
          style={{ background: theme.dot }}
        >
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Well done!
        </div>
        <p className="mt-2 text-zinc-700 max-w-md mx-auto text-sm">
          You've finished this {level.title} session.
        </p>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3" data-testid="completion-stats">
        <div className="rounded-2xl bg-white p-4 border border-zinc-200">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 font-bold">{(stats.itemLabelPlural || "Letters")} completed</div>
          <div className="mt-1 font-display text-2xl font-extrabold">
            {stats.lettersAttempted} <span className="text-zinc-400 text-base font-bold">of {stats.totalLetters}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-zinc-200">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 font-bold">Correct answers</div>
          <div className="mt-1 font-display text-2xl font-extrabold">
            {stats.correctCount} / {stats.totalQuestions} <span className="text-zinc-400 text-base font-bold">({stats.accuracyPct}%)</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-zinc-200">
          <div className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 font-bold">Hint used</div>
          <div className="mt-1 font-display text-2xl font-extrabold">
            {stats.hintPct}% <span className="text-zinc-400 text-base font-bold">of questions</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/70 px-4 py-2.5 border border-zinc-200/70">
          <span className="text-zinc-500">Duration: </span>
          <span className="font-semibold">{fmtDuration(stats.durationSec)}</span>
        </div>
        <div className="rounded-xl bg-white/70 px-4 py-2.5 border border-zinc-200/70">
          <span className="text-zinc-500">Started: </span>
          <span className="font-semibold">{fmtDateTime(stats.startedAt)}</span>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => downloadSummaryPdf(stats)}
          className="rounded-full font-display bg-indigo-600 hover:bg-indigo-700 h-11 px-5"
          data-testid="completion-download-pdf"
        >
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
        <Button
          variant="outline"
          onClick={onChangeLevel}
          className="rounded-full font-display h-11 px-5"
          data-testid="completion-change-difficulty"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Change difficulty
        </Button>
        <Button
          variant="outline"
          onClick={onReplay}
          className="rounded-full font-display h-11 px-5"
          data-testid="completion-replay"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> {replayLabel}
        </Button>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-zinc-300 bg-white font-display font-semibold hover:bg-zinc-50"
          data-testid="completion-back-hub"
        >
          Back to hub
        </Link>
      </div>
    </div>
  );
}

function DifficultyPicker({ activity, onSelect, ComplexityDots }) {
  const levels = activity.content.levels || {};
  const order = ["green", "amber", "red", "pink"];
  // Item label is shared across levels for an activity; default to "letter".
  const firstLevel = order.map((k) => levels[k]).find(Boolean) || {};
  const itemSing = (firstLevel.item_label_singular || "Letter").toLowerCase();
  const itemPlur = (firstLevel.item_label_plural || "letters").toLowerCase();
  const visibleLevels = order.filter((k) => levels[k]);
  const gridCols =
    visibleLevels.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-3";

  return (
    <div data-testid="difficulty-picker">
      <div className="mb-5" data-testid="difficulty-section-header">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          {activity.title}
        </h2>
        <p className="voicemail-difficulty-level-label mt-1.5 text-sm font-display font-semibold text-zinc-600">
          Choose difficulty level:
        </p>
      </div>

      <div className={`grid ${gridCols} gap-4 items-stretch`}>
        {visibleLevels
          .map((k) => {
            const lv = levels[k];
            const theme = LEGACY_LEVEL_THEME[k];
            const LevelIcon = LEVEL_ICON[k] || Tag;
            return (
              <div
                key={k}
                className="diff-card rounded-2xl flex flex-col h-full p-5"
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.cardBorder}`,
                  "--glow": theme.glow,
                  "--level-accent": theme.dot,
                  "--level-border": theme.cardBorder,
                  "--level-pill-bg": theme.pillBg,
                  "--level-pill-border": theme.pillBorder,
                }}
                data-testid={`difficulty-card-${k}`}
              >
                <div className="flex-1 flex flex-col">
                  <div className="difficulty-card-top-row flex items-center justify-between gap-2">
                    <div className="difficulty-card-badge-row flex items-center gap-2.5">
                      <span
                        className="difficulty-icon-ring"
                        style={{
                          color: theme.dot,
                          borderColor: theme.pillBorder,
                          "--level-accent": theme.dot,
                          "--level-pill-bg": theme.pillBg,
                        }}
                        aria-hidden="true"
                      >
                        <LevelIcon className="difficulty-icon" />
                      </span>
                      <div
                        className="difficulty-card-title font-display font-bold tracking-tight text-zinc-900"
                        style={{ fontSize: "26px", lineHeight: 1.05 }}
                      >
                        {lv.title}
                      </div>
                    </div>
                    <div className="difficulty-card-top-actions flex items-center">
                      <ComplexityDots level={theme.complexity} color={theme.dot} neon={theme.neon} />
                    </div>
                  </div>

                  <div className="difficulty-card-copy mt-3 space-y-2.5 text-sm">
                    <div className="difficulty-card-section difficulty-card-section-content">
                      <div className="difficulty-card-eyebrow text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-bold">
                        Content:
                      </div>
                      <p className="mt-0.5 text-zinc-700 leading-relaxed">{lv.blurb}</p>
                    </div>
                    <div className="difficulty-card-section difficulty-card-section-suited">
                      <div className="difficulty-card-eyebrow text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-bold">
                        Suited to:
                      </div>
                      <p className="mt-0.5 text-zinc-700 leading-relaxed">{lv.best_for}</p>
                    </div>
                    {lv.est_minutes ? (
                      <div className="difficulty-time-pill inline-flex items-center gap-1.5 text-[11px] font-display font-semibold text-zinc-700 mt-1 rounded-full bg-white/70 px-2.5 py-1" style={{ border: `1px solid ${theme.cardBorder}` }} data-testid={`est-minutes-${k}`}>
                        <Clock className="w-3 h-3" />
                        {lv.est_minutes}
                      </div>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(k)}
                  data-testid={`difficulty-${k}`}
                  className="difficulty-start-btn mt-5 inline-flex items-center justify-center gap-2 h-11 rounded-full font-display font-semibold text-white transition hover:brightness-110"
                  style={{ background: theme.cardCta }}
                >
                  Start {lv.title} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => printAllLabels({ activity, level: lv })}
                  disabled={!(lv.letters || []).length}
                  data-testid={`print-pdf-${k}`}
                  className="difficulty-print-btn mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-full font-display font-semibold text-zinc-800 bg-white/70 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ border: `1.5px solid ${theme.cardBorder}` }}
                  title={(lv.letters || []).length
                    ? `Print all ${(lv.letters || []).length} ${itemPlur} as a PDF handout`
                    : `No ${itemPlur} available yet`}
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}


function LetterPicker({ level, onPickLetter, onChangeLevel }) {
  const theme = LEGACY_LEVEL_THEME[level.key];
  const target = level.target_letter_count || (level.letters || []).length || 0;
  const ready = (level.letters || []).length;
  const itemSing = level.item_label_singular || "Letter";
  const itemPlur = level.item_label_plural || "letters";
  const subtitleText = `${level.questions_per_letter} questions per ${itemSing.toLowerCase()}.`;

  return (
    <div data-testid="letter-picker">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-[0.18em]"
            style={{
              background: theme.pillBg,
              color: theme.pillFg,
              border: `1.5px solid ${theme.pillBorder}`,
            }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: theme.dot }}
            />
            {level.key.toUpperCase()}
          </span>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {level.title} · {ready} of {target} {itemPlur}
          </h2>
          <p className="text-zinc-600 mt-1 max-w-2xl">{subtitleText}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onChangeLevel}
          className="rounded-full font-display h-10 px-4"
          data-testid="change-difficulty-btn"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Change difficulty
        </Button>
      </div>

      {ready === 0 ? (
        <div
          className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center"
          data-testid="letter-picker-empty"
        >
          <div className="font-display font-bold text-lg">{itemPlur.charAt(0).toUpperCase() + itemPlur.slice(1)} coming soon</div>
          <p className="mt-1 text-zinc-600 max-w-md mx-auto">
            We’re writing the {target} {level.title.toLowerCase()} {itemPlur} together.
            They’ll appear here as soon as each one is added.
          </p>
        </div>
      ) : (
        <ul className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(level.letters || []).map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onPickLetter(l.id)}
                data-testid={`letter-${l.id}`}
                className="w-full text-left rounded-2xl border border-zinc-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: theme.pillFg }}>
                  {itemSing} {l.id}
                </div>
                <div className="font-display font-bold text-lg mt-1">{l.title}</div>
                {l.summary ? (
                  <div className="text-sm text-zinc-600 mt-1 leading-relaxed">{l.summary}</div>
                ) : null}
                <div className="mt-3 text-xs text-zinc-500 font-semibold">
                  {(l.questions || []).length} questions
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
