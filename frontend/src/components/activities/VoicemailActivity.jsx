import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Info,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { useSession } from "@/contexts/SessionContext";
import { getActivitySetupConfig } from "@/lib/activitySetupConfig";
import { useSmartBack } from "@/lib/navigationHistory";
import { getSessionActivityKey } from "@/lib/sessionActivityIdentity";
import {
  getAvailableVoicemailItems,
  getClampedVoicemailItemCount,
  getRequestedVoicemailQuestionCount,
  selectVoicemailItems,
  selectVoicemailQuestions,
} from "@/lib/voicemailSelection";
import {
  buildVoicemailRuntimeSearchParams,
  createDefaultVoicemailSetup,
  createVoicemailSessionActivity,
  createVoicemailSelectionSeed,
  hasConfigurableVoicemailQuestions,
  isVoicemailSetupValid,
  normalizeVoicemailInteractionMode,
  normalizeVoicemailSetupSelection,
  normalizeVoicemailSelectionSeed,
  VOICEMAIL_INTERACTION_MODES,
} from "@/lib/voicemailSetup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentTransition } from "@/components/ui/content-transition";
import { FocusTags } from "@/components/ui/focus-tags";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import difficultyLevelAmberIcon from "@/assets/difficulty-level-amber.png";
import difficultyLevelGreenIcon from "@/assets/difficulty-level-green.png";
import difficultyLevelPinkIcon from "@/assets/difficulty-level-pink.png";
import difficultyLevelRedIcon from "@/assets/difficulty-level-red.png";

const EMPTY_LEVELS = Object.freeze({});
const LEVEL_ORDER = ["green", "amber", "red", "pink"];
const LEVEL_ICON_ASSETS = {
  green: difficultyLevelGreenIcon,
  amber: difficultyLevelAmberIcon,
  red: difficultyLevelRedIcon,
  pink: difficultyLevelPinkIcon,
};
const VOICEMAIL_SUMMARY =
  "Practice functional listening comprehension with realistic voicemail messages.";
const VOICEMAIL_SESSION_ACTION_AVAILABLE = false;
const INTERACTION_LABELS = {
  single: "Single",
  multiple: "Multiple",
};
const INTERACTION_SUMMARY_LABELS = {
  single: "Single decision",
  multiple: "Multiple decisions",
};
const INTERACTION_DESCRIPTIONS = {
  single: "One menu choice to reach the correct service.",
  multiple: "Navigate through several menu levels before reaching the correct service.",
};
const VOICEMAIL_LEVEL_FOCUS = {
  green: ["Auditory comprehension", "Immediate recall", "Functional listening"],
  amber: ["Working memory", "Attention to detail", "Following spoken information"],
  red: ["Inference", "Prospective action", "Problem solving"],
  pink: ["Phone navigation", "Auditory scanning", "Decision making"],
};

function parseRuntimeItemIds(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((itemId) => itemId.trim())
    .filter(Boolean);
}

function createEmptyStats() {
  return {
    startedAt: null,
    levelKey: null,
    letters: new Set(),
    attempts: new Map(),
    hintsBeforeAttempt: new Set(),
  };
}

export function VoicemailActivity({ activity, levelThemes, sharedComponents }) {
  const {
    BreadcrumbHeader,
    CompletionScreen,
    ComplexityDots,
    ReadingExercise,
  } = sharedComponents;
  const navigate = useNavigate();
  const smartBack = useSmartBack();
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get("level");
  const themePackId = searchParams.get("pack") || "mixed-bag";
  const languageId = searchParams.get("language") || "en";
  const interactionMode = normalizeVoicemailInteractionMode(searchParams.get("interaction"));
  const requestedItemCount = Number.parseInt(searchParams.get("count") || "", 10);
  const requestedQuestionsPerVoicemail = Number.parseInt(
    searchParams.get("questions") || "",
    10,
  );
  const selectionSeed = normalizeVoicemailSelectionSeed(searchParams.get("seed"));
  const requestedItemIds = parseRuntimeItemIds(searchParams.get("items"));
  const letterId = searchParams.get("letter");
  const isDone = searchParams.get("done") === "1";
  const levels = activity.content.levels || EMPTY_LEVELS;
  const setupConfig = getActivitySetupConfig(activity.slug);
  const { active, isActive, start: startSession, logActivity, removeActivity } = useSession();
  const [setupSelection, setSetupSelection] = useState(() =>
    createDefaultVoicemailSetup(setupConfig, createVoicemailSelectionSeed()),
  );

  useEffect(() => {
    setSetupSelection((current) => {
      const normalized = normalizeVoicemailSetupSelection(setupConfig, levels, current);
      return Object.keys(normalized).every((key) => normalized[key] === current[key])
        ? current
        : normalized;
    });
  }, [levels, setupConfig]);

  const statsRef = useRef(createEmptyStats());
  const [, forceStatsRender] = useState(0);
  const bumpStats = () => forceStatsRender((tick) => tick + 1);
  const resetStats = () => {
    statsRef.current = createEmptyStats();
    bumpStats();
  };
  const ensureRunForLevel = (key) => {
    const stats = statsRef.current;
    if (stats.levelKey !== key) {
      statsRef.current = { ...createEmptyStats(), startedAt: new Date(), levelKey: key };
    } else if (!stats.startedAt) {
      stats.startedAt = new Date();
    }
  };

  const [fullscreen, setFullscreen] = useState(() => {
    try {
      return sessionStorage.getItem("soniva.reading.fullscreen") === "1";
    } catch {
      return false;
    }
  });
  const toggleFullscreen = () => {
    setFullscreen((current) => {
      const next = !current;
      try {
        sessionStorage.setItem("soniva.reading.fullscreen", next ? "1" : "0");
      } catch {
        // Fullscreen preference is non-critical when storage is unavailable.
      }
      return next;
    });
  };

  useEffect(() => {
    if (!fullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  const selectedLevel = level && levels[level] ? levels[level] : null;
  const availableRuntimeItems = selectedLevel
    ? getAvailableVoicemailItems(selectedLevel, themePackId, languageId)
    : [];
  const safeItemCount = getClampedVoicemailItemCount(
    requestedItemCount,
    availableRuntimeItems.length,
  );
  let runtimeItems = selectedLevel
    ? selectVoicemailItems(selectedLevel, {
        difficultyId: selectedLevel.key,
        themePackId,
        languageId,
        itemCount: safeItemCount,
        selectionSeed,
        itemIds: requestedItemIds,
      })
    : [];
  // Older runtime URLs did not record their selected item set. Keep a valid
  // bookmarked item in the reconstructed set, then persist the resolved set
  // on the next navigation.
  if (
    selectedLevel
    && letterId
    && !requestedItemIds.length
    && !runtimeItems.some((item) => String(item.id) === String(letterId))
    && availableRuntimeItems.some((item) => String(item.id) === String(letterId))
  ) {
    runtimeItems = selectVoicemailItems(selectedLevel, {
      difficultyId: selectedLevel.key,
      themePackId,
      languageId,
      itemCount: safeItemCount,
      selectionSeed,
      itemIds: [letterId, ...runtimeItems.map((item) => item.id)],
    });
  }
  const safeQuestionsPerVoicemail = hasConfigurableVoicemailQuestions(selectedLevel?.key)
    ? getRequestedVoicemailQuestionCount(requestedQuestionsPerVoicemail)
    : null;
  const runtimeSelection = {
    difficultyId: selectedLevel?.key || level || "",
    themePackId,
    languageId,
    itemCount: safeItemCount,
    questionsPerVoicemail: safeQuestionsPerVoicemail,
    interactionMode,
    selectionSeed,
    itemIds: runtimeItems.map((item) => item.id),
  };
  const voicemail = selectedLevel
    ? runtimeItems.find((item) => String(item.id) === String(letterId))
    : null;
  const currentIndex = voicemail
    ? runtimeItems.findIndex((item) => String(item.id) === String(letterId))
    : -1;
  const hasNext = currentIndex >= 0 && currentIndex < runtimeItems.length - 1;

  useEffect(() => {
    if (!selectedLevel || !voicemail) return;
    logActivity({
      category: activity.category,
      activity_slug: `${activity.slug}-${selectedLevel.key}-${voicemail.id}`,
      activity_title: `${activity.title} \u2014 ${selectedLevel.title} \u00b7 ${
        voicemail.title || `Voicemail ${voicemail.id}`
      }`,
    });
    ensureRunForLevel(selectedLevel.key);
  }, [activity, logActivity, selectedLevel, voicemail]);

  const handleAttempt = (info) => {
    if (!voicemail || !selectedLevel) return;
    const key = `${selectedLevel.key}:${voicemail.id}:${info.qid}`;
    const stats = statsRef.current;
    const usedHint = info.usedHint || stats.hintsBeforeAttempt.has(key);
    stats.attempts.set(key, { correct: info.correct, usedHint });
    stats.letters.add(voicemail.id);
    bumpStats();
  };
  const handleHint = (info) => {
    if (!voicemail || !selectedLevel) return;
    const key = `${selectedLevel.key}:${voicemail.id}:${info.qid}`;
    const stats = statsRef.current;
    if (!stats.attempts.has(key)) stats.hintsBeforeAttempt.add(key);
    bumpStats();
  };

  const normalizedSetupSelection = normalizeVoicemailSetupSelection(
    setupConfig,
    levels,
    setupSelection,
  );
  const setupLevel = levels[normalizedSetupSelection.difficultyId];
  const selectedThemePack = setupConfig.themePacks.find(
    (pack) => pack.id === normalizedSetupSelection.themePackId && pack.available,
  );
  const selectedLanguage = setupConfig.languages.find(
    (language) => language.id === normalizedSetupSelection.languageId && language.available,
  );
  const availableSetupItems = getAvailableVoicemailItems(
    setupLevel,
    normalizedSetupSelection.themePackId,
    normalizedSetupSelection.languageId,
  );
  const selectedSetupItems = selectVoicemailItems(setupLevel, normalizedSetupSelection);
  const validatedItemCount = selectedSetupItems.length;
  const validatedSetupSelection = {
    ...normalizedSetupSelection,
    itemCount: validatedItemCount,
    itemIds: selectedSetupItems.map((item) => item.id),
  };
  const isSetupValid = isVoicemailSetupValid({
    config: setupConfig,
    levels,
    selection: normalizedSetupSelection,
    availableItemCount: availableSetupItems.length,
  });
  const configuredSessionActivity = createVoicemailSessionActivity(
    activity,
    validatedSetupSelection,
  );
  const configuredSessionKey = getSessionActivityKey(configuredSessionActivity);
  const isConfiguredInSession = Boolean(
    active?.activities?.some((item) => getSessionActivityKey(item) === configuredSessionKey),
  );

  const updateSetupSelection = (next) => {
    setSetupSelection((current) => ({ ...current, ...next }));
  };
  const startConfiguredActivity = () => {
    if (!isSetupValid || !selectedSetupItems[0]) return;
    setSearchParams(
      buildVoicemailRuntimeSearchParams(validatedSetupSelection, {
        letterId: selectedSetupItems[0].id,
      }),
    );
  };
  const toggleConfiguredSessionActivity = () => {
    if (!isSetupValid) return;
    if (isConfiguredInSession) {
      removeActivity(configuredSessionActivity);
      return;
    }
    if (!isActive) startSession();
    logActivity(configuredSessionActivity);
  };

  const returnToSetup = () => {
    if (selectedLevel) {
      setSetupSelection((current) =>
        normalizeVoicemailSetupSelection(setupConfig, levels, {
          ...current,
          difficultyId: selectedLevel.key,
          themePackId,
          languageId,
          itemCount: safeItemCount || current.itemCount,
          questionsPerVoicemail:
            safeQuestionsPerVoicemail || current.questionsPerVoicemail,
          interactionMode,
          selectionSeed,
        }),
      );
    }
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    if (!selectedLevel || voicemail || isDone) return;
    setSetupSelection((current) =>
      normalizeVoicemailSetupSelection(setupConfig, levels, {
        ...current,
        difficultyId: selectedLevel.key,
        themePackId,
        languageId,
        itemCount: safeItemCount || current.itemCount,
        questionsPerVoicemail:
          safeQuestionsPerVoicemail || current.questionsPerVoicemail,
        interactionMode,
        selectionSeed,
      }),
    );
    setSearchParams({}, { replace: true });
  }, [
    isDone,
    interactionMode,
    languageId,
    levels,
    safeItemCount,
    safeQuestionsPerVoicemail,
    selectedLevel,
    selectionSeed,
    setSearchParams,
    setupConfig,
    themePackId,
    voicemail,
  ]);

  const goActivitiesLibrary = () => navigate("/all-activities");
  const goCategory = () => navigate(`/category/${activity.category}`);
  const goSetup = () => setSearchParams({});
  const rootCrumb = { label: "Activities Library", onClick: goActivitiesLibrary };
  const domainCrumb = { label: "Functional Tasks", onClick: goCategory };
  const activityCrumb = { label: "Listening to Voicemail", onClick: goSetup };
  const levelCrumb = selectedLevel
    ? { label: selectedLevel.title, onClick: returnToSetup }
    : null;
  const itemLabelSingular = selectedLevel?.item_label_singular || "Voicemail";
  const itemLabelPlural = selectedLevel?.item_label_plural || "voicemails";

  let crumbs;
  let onBack;
  if (!selectedLevel) {
    crumbs = [rootCrumb, domainCrumb, "Listening to Voicemail"];
    onBack = smartBack;
  } else if (isDone) {
    crumbs = [rootCrumb, domainCrumb, activityCrumb, levelCrumb, "Complete"];
    onBack = returnToSetup;
  } else {
    crumbs = [
      rootCrumb,
      domainCrumb,
      activityCrumb,
      levelCrumb,
      `${itemLabelSingular} ${currentIndex >= 0 ? currentIndex + 1 : ""}`,
    ];
    onBack = returnToSetup;
  }

  const breadcrumb = (
    <BreadcrumbHeader
      crumbs={crumbs}
      onBack={onBack}
      className={!selectedLevel ? "voicemail-difficulty-breadcrumb" : ""}
    />
  );

  if (!selectedLevel) {
    return (
      <>
        {breadcrumb}
        <div className="mt-2">
          <VoicemailSetup
            activity={activity}
            levels={levels}
            selectedLevel={normalizedSetupSelection.difficultyId}
            onSelectLevel={(difficultyId) => updateSetupSelection({ difficultyId })}
            levelThemes={levelThemes}
            ComplexityDots={ComplexityDots}
            config={setupConfig}
            selection={normalizedSetupSelection}
            selectedLevelData={setupLevel}
            selectedThemePack={selectedThemePack}
            selectedLanguage={selectedLanguage}
            availableItemCount={availableSetupItems.length}
            validatedItemCount={validatedItemCount}
            validatedQuestionsPerVoicemail={normalizedSetupSelection.questionsPerVoicemail}
            isValid={isSetupValid}
            isInSession={isConfiguredInSession}
            onChange={updateSetupSelection}
            onStart={startConfiguredActivity}
            onAddToSession={toggleConfiguredSessionActivity}
          />
        </div>
      </>
    );
  }

  const computeSummary = () => {
    const stats = statsRef.current;
    const totalQuestions = stats.attempts.size;
    const correctCount = Array.from(stats.attempts.values()).filter((item) => item.correct).length;
    const hintsUsed = Array.from(stats.attempts.values()).filter((item) => item.usedHint).length;
    const startedAt = stats.startedAt ? new Date(stats.startedAt) : new Date();
    const endedAt = new Date();
    return {
      taskName: activity.title,
      levelTitle: selectedLevel.title,
      startedAt,
      endedAt,
      durationSec: Math.max(0, Math.round((endedAt - startedAt) / 1000)),
      lettersAttempted: stats.letters.size,
      totalLetters: runtimeItems.length,
      itemLabelSingular,
      itemLabelPlural,
      totalQuestions,
      correctCount,
      accuracyPct: totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0,
      hintsUsed,
      hintPct: totalQuestions ? Math.round((hintsUsed / totalQuestions) * 100) : 0,
    };
  };

  if (isDone) {
    return (
      <>
        {breadcrumb}
        <div className="mt-5">
          <CompletionScreen
            level={selectedLevel}
            summary={computeSummary()}
            replayLabel="Restart from Voicemail 1"
            onChangeLevel={() => {
              resetStats();
              setSearchParams({});
            }}
            onReplay={() => {
              resetStats();
              const first = runtimeItems[0];
              if (first) {
                setSearchParams(
                  buildVoicemailRuntimeSearchParams(runtimeSelection, { letterId: first.id }),
                );
              }
            }}
          />
        </div>
      </>
    );
  }

  if (!voicemail) return null;

  const theme = levelThemes[selectedLevel.key];
  const runtimeActivity = {
    ...activity,
    slug: `${activity.slug}-${selectedLevel.key}-${voicemail.id}`,
    title: `${activity.title} \u2014 ${selectedLevel.title} \u00b7 ${
      voicemail.title || `Voicemail ${voicemail.id}`
    }`,
    content: {
      text: voicemail.text,
      letterhead: voicemail.letterhead,
      questions: selectVoicemailQuestions(
        voicemail,
        safeQuestionsPerVoicemail,
        selectionSeed,
      ),
    },
  };
  const finish = () => {
    setSearchParams(buildVoicemailRuntimeSearchParams(runtimeSelection, { done: true }));
  };
  const goNext = () => {
    if (!hasNext) {
      finish();
      return;
    }
    setSearchParams(
      buildVoicemailRuntimeSearchParams(runtimeSelection, {
        letterId: runtimeItems[currentIndex + 1].id,
      }),
    );
  };
  const runtimeView = (
    <ReadingExercise
      key={`${selectedLevel.key}-${voicemail.id}`}
      activity={runtimeActivity}
      onChangeLevel={() => {
        resetStats();
        returnToSetup();
      }}
      levelLabel={{
        text: `${selectedLevel.title} \u00b7 ${itemLabelSingular} ${currentIndex + 1} of ${runtimeItems.length}`,
        color: theme.pillFg,
        border: theme.pillBorder,
        shadow: theme.glow,
        dotsBg: theme.pillBg,
        dot: theme.dot,
        dotMuted: theme.pillBorder,
        complexity: theme.complexity || 1,
        showComplexity: selectedLevel.key !== "pink",
      }}
      onNext={goNext}
      nextLabel={hasNext ? `Next ${itemLabelPlural.replace(/s$/, "")}` : "Finish"}
      fullscreen={fullscreen}
      onToggleFullscreen={toggleFullscreen}
      onAttempt={handleAttempt}
      onHint={handleHint}
      onEnd={finish}
      layout="split"
    />
  );

  if (fullscreen) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-white overflow-auto px-6 sm:px-10 py-5"
        data-testid="reading-fullscreen"
      >
        <div className="max-w-[1400px] mx-auto">{runtimeView}</div>
      </div>,
      document.body,
    );
  }

  return (
    <>
      {breadcrumb}
      <div className="mt-5">{runtimeView}</div>
    </>
  );
}

function VoicemailLevelIndicator({
  levelKey,
  theme,
  ComplexityDots,
  showModeLabel = true,
  showModeComplexity = false,
}) {
  if (levelKey === "pink") {
    return (
      <>
        {showModeLabel ? (
          <span
            className="voicemail-level-mode-indicator text-[10px] uppercase tracking-[0.12em] font-display font-bold"
            style={{ color: theme.dot }}
            aria-label="Phone menu mode"
            data-testid="phone-menu-mode-indicator"
          >
            Phone menu
          </span>
        ) : null}
        {showModeComplexity ? (
          <span aria-hidden="true">
            <ComplexityDots level={theme.complexity} color={theme.dot} neon={theme.neon} />
          </span>
        ) : null}
      </>
    );
  }

  return (
    <ComplexityDots level={theme.complexity} color={theme.dot} neon={theme.neon} />
  );
}

function VoicemailSetup({
  activity,
  levels,
  selectedLevel,
  onSelectLevel,
  levelThemes,
  ComplexityDots,
  ...setupOptions
}) {
  const visibleLevels = LEVEL_ORDER.filter((key) => levels[key]);

  return (
    <div className="voicemail-setup" data-testid="difficulty-picker">
      <div className="voicemail-setup-layout">
        <header className="voicemail-setup-intro">
          <h2>{activity.title}</h2>
          <p className="voicemail-setup-description">{VOICEMAIL_SUMMARY}</p>
        </header>

        <div className="voicemail-setup-columns">
          <aside className="voicemail-level-selector" aria-label="Choose level or mode">
            <div className="voicemail-level-list" role="radiogroup" aria-label="Activity level or mode">
              {visibleLevels.map((key) => {
                const level = levels[key];
                const theme = levelThemes[key];
                const selected = selectedLevel === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`voicemail-level-option ${selected ? "is-selected" : ""}`}
                    style={{
                      "--level-accent": theme.dot,
                      "--level-border": theme.cardBorder,
                      "--level-soft": theme.pillBg,
                      "--level-glow": theme.glow,
                    }}
                    onClick={() => onSelectLevel(key)}
                    data-testid={`difficulty-${key}`}
                  >
                    <img src={LEVEL_ICON_ASSETS[key]} alt="" aria-hidden="true" />
                    <strong>{level.title}</strong>
                    <VoicemailLevelIndicator
                      levelKey={key}
                      theme={theme}
                      ComplexityDots={ComplexityDots}
                      showModeLabel={key !== "pink"}
                      showModeComplexity={key === "pink"}
                    />
                  </button>
                );
              })}
            </div>
            <p className="voicemail-level-help">
              <Sparkles aria-hidden="true" />
              Choose a level or phone-menu mode to configure your activity.
            </p>
          </aside>

          <ActivitySetupOptions
            {...setupOptions}
            levelThemes={levelThemes}
            ComplexityDots={ComplexityDots}
          />
        </div>
      </div>
    </div>
  );
}

function InteractionHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <button
          type="button"
          className="voicemail-interaction-help-trigger"
          aria-label="About interaction options"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="voicemail-interaction-help"
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          data-testid="interaction-help-trigger"
        >
          <Info aria-hidden="true" />
        </button>
      </PopoverAnchor>
      <PopoverContent
        id="voicemail-interaction-help"
        className="voicemail-interaction-help-popover"
        align="end"
        sideOffset={6}
        collisionPadding={12}
        aria-label="Interaction options"
        data-testid="interaction-help-popover"
      >
        {VOICEMAIL_INTERACTION_MODES.map((mode) => (
          <div className="voicemail-interaction-help-option" key={mode}>
            <strong>{INTERACTION_SUMMARY_LABELS[mode]}</strong>
            <p>{INTERACTION_DESCRIPTIONS[mode]}</p>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function VoicemailSetupSummary({ items }) {
  return (
    <div className="activity-setup-summary" aria-label="Activity configuration summary">
      <strong className="voicemail-setup-summary-line">
        {items.map((item, index) => (
          <span className="voicemail-setup-summary-item" key={`${item}-${index}`}>
            {index > 0 ? <b> · </b> : null}
            {item}
          </span>
        ))}
      </strong>
    </div>
  );
}

function ActivitySetupOptions({
  config,
  selection,
  selectedLevelData,
  selectedThemePack,
  selectedLanguage,
  availableItemCount,
  validatedItemCount,
  validatedQuestionsPerVoicemail,
  isValid,
  isInSession,
  onChange,
  onStart,
  onAddToSession,
  levelThemes,
  ComplexityDots,
}) {
  const availableThemePacks = config.themePacks.filter((pack) => pack.available);
  const availableLanguages = config.languages.filter((language) => language.available);
  const selectedLevelKey = selection.difficultyId;
  const hasQuestionCount = hasConfigurableVoicemailQuestions(selectedLevelKey);
  const theme = levelThemes[selectedLevelKey] || levelThemes.green;
  const levelTitle = selectedLevelData?.title || "Choose difficulty";
  const packLabel = selectedThemePack?.label || "Choose theme pack";
  const languageLabel = selectedLanguage?.label || "Choose language";
  const itemCount = validatedItemCount || selection.itemCount;
  const itemLabel = hasQuestionCount
    ? (itemCount === 1 ? "voicemail" : "voicemails")
    : (itemCount === 1 ? "phone menu" : "phone menus");
  const countLabel = `${itemCount} ${itemLabel}`;
  const questionCount = validatedQuestionsPerVoicemail || selection.questionsPerVoicemail;
  const questionLabel = `${questionCount} ${questionCount === 1 ? "question" : "questions"} each`;
  const summaryItems = [
    countLabel,
    hasQuestionCount
      ? questionLabel
      : INTERACTION_SUMMARY_LABELS[selection.interactionMode],
    languageLabel,
    packLabel,
  ];

  return (
    <section
      className="voicemail-expanded-card"
      style={{
        "--level-accent": theme.dot,
        "--level-border": theme.cardBorder,
        "--level-soft": theme.pillBg,
        "--level-glow": theme.glow,
        "--level-cta": theme.cardCta,
      }}
      data-testid="voicemail-setup-options"
    >
      <ContentTransition
        contentKey={selectedLevelKey}
        className="voicemail-expanded-content"
      >
        <div className="voicemail-expanded-header">
          <span className="voicemail-expanded-title">
            <img src={LEVEL_ICON_ASSETS[selectedLevelKey]} alt="" aria-hidden="true" />
            <strong>{levelTitle}</strong>
          </span>
          <span
            className="voicemail-expanded-complexity-anchor"
            data-testid="voicemail-expanded-complexity-anchor"
          >
            <VoicemailLevelIndicator
              levelKey={selectedLevelKey}
              theme={theme}
              ComplexityDots={ComplexityDots}
              showModeLabel={selectedLevelKey !== "pink"}
              showModeComplexity={selectedLevelKey === "pink"}
            />
          </span>
        </div>

        <div className="voicemail-expanded-copy">
          <div>
            <h3>Content:</h3>
            <p>{selectedLevelData?.blurb}</p>
          </div>
          <div>
            <h3>Focus:</h3>
            <FocusTags items={VOICEMAIL_LEVEL_FOCUS[selectedLevelKey]} />
          </div>
        </div>
      </ContentTransition>

      <div className="voicemail-settings-stack">
        <div className="voicemail-expanded-controls">
          <div className="voicemail-pack-control">
            <span id="voicemail-theme-pack-label">Theme pack</span>
            <Select
              value={selection.themePackId}
              onValueChange={(themePackId) => onChange({ themePackId })}
            >
              <SelectTrigger
                className="voicemail-select-shell"
                aria-labelledby="voicemail-theme-pack-label"
                data-testid="theme-pack-select"
              >
                <span className="voicemail-select-value">
                  <ShoppingBag aria-hidden="true" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent className="voicemail-select-menu">
                {availableThemePacks.map((pack) => (
                  <SelectItem key={pack.id} value={pack.id}>{pack.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="voicemail-pack-control">
            <span id="voicemail-language-label">Language</span>
            <Select
              value={selection.languageId}
              onValueChange={(languageId) => onChange({ languageId })}
            >
              <SelectTrigger
                className="voicemail-select-shell"
                aria-labelledby="voicemail-language-label"
                data-testid="language-select"
              >
                <span className="voicemail-select-value">
                  <Globe aria-hidden="true" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent className="voicemail-select-menu">
                {availableLanguages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>{language.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ContentTransition
            contentKey={selectedLevelKey}
            className="voicemail-level-controls-transition"
          >
            <fieldset className="voicemail-count-fieldset">
              <legend>{hasQuestionCount ? "Number of voicemails" : "Phone menus"}</legend>
              <SetupSegmentedControl
                values={config.itemCounts}
                value={selection.itemCount}
                label={hasQuestionCount ? "Number of voicemails" : "Phone menus"}
                testIdPrefix="item-count"
                onChange={(itemCountValue) => onChange({ itemCount: itemCountValue })}
              />
            </fieldset>

            {hasQuestionCount ? (
              <fieldset className="voicemail-count-fieldset">
                <legend>Questions per voicemail</legend>
                <SetupSegmentedControl
                  values={config.questionCounts}
                  value={selection.questionsPerVoicemail}
                  label="Questions per voicemail"
                  testIdPrefix="question-count"
                  onChange={(questionsPerVoicemail) => onChange({ questionsPerVoicemail })}
                />
              </fieldset>
            ) : (
              <fieldset className="voicemail-count-fieldset voicemail-interaction-fieldset">
                <legend>
                  <span>Interaction</span>
                  <InteractionHelp />
                </legend>
                <SetupSegmentedControl
                  values={VOICEMAIL_INTERACTION_MODES}
                  value={selection.interactionMode}
                  label="Interaction"
                  optionLabels={INTERACTION_LABELS}
                  testIdPrefix="interaction"
                  onChange={(interactionModeValue) =>
                    onChange({ interactionMode: interactionModeValue })}
                />
              </fieldset>
            )}
          </ContentTransition>
        </div>

        {selection.itemCount > availableItemCount && availableItemCount > 0 ? (
          <p className="activity-setup-availability">
            {availableItemCount} available for this selection. The activity will use all available items.
          </p>
        ) : null}

        <ContentTransition
          contentKey={selectedLevelKey}
          className="voicemail-setup-footer-transition"
        >
          <div className="voicemail-setup-footer-row">
            <VoicemailSetupSummary items={summaryItems} />
          </div>
        </ContentTransition>
      </div>

      <div
        className={`activity-setup-actions${
          VOICEMAIL_SESSION_ACTION_AVAILABLE ? "" : " is-primary-only"
        }`}
      >
        {VOICEMAIL_SESSION_ACTION_AVAILABLE ? (
          <button
            type="button"
            className={`activity-setup-secondary ${isInSession ? "is-in-session" : ""}`}
            onClick={onAddToSession}
            disabled={!isValid}
            aria-pressed={isInSession}
            aria-label={
              isInSession
                ? "Remove configured activity from session"
                : "Add configured activity to session"
            }
            data-testid="add-voicemail-to-session"
          >
            {isInSession ? <CheckCircle2 /> : <Plus />}
            {isInSession ? "Remove from session" : "Add to session"}
          </button>
        ) : null}
        <button
          type="button"
          className="activity-setup-primary"
          onClick={onStart}
          disabled={!isValid}
          data-testid="start-configured-voicemail"
        >
          Start activity <ArrowRight />
        </button>
      </div>
    </section>
  );
}

function SetupSegmentedControl({
  values,
  value,
  label,
  optionLabels = {},
  testIdPrefix,
  onChange,
}) {
  const selectedIndex = Math.max(0, values.indexOf(value));
  const handleKeyDown = (event, index) => {
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
    if (!direction) return;

    event.preventDefault();
    const nextIndex = (index + direction + values.length) % values.length;
    onChange(values[nextIndex]);
    event.currentTarget.parentElement?.querySelectorAll("button")[nextIndex]?.focus();
  };

  return (
    <div
      className="item-count-control"
      role="radiogroup"
      aria-label={label}
      style={{
        "--segment-count": values.length,
        "--selected-index": selectedIndex,
      }}
    >
      <span className="segmented-selection-indicator" aria-hidden="true" />
      {values.map((option, index) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          className={value === option ? "is-selected" : ""}
          onClick={() => onChange(option)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          data-testid={`${testIdPrefix}-${option}`}
        >
          {optionLabels[option] || option}
        </button>
      ))}
    </div>
  );
}
