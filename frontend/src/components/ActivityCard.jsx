import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Gamepad2,
  Heart,
  Headphones,
  Info,
  MapPin,
  MessageCircle,
  Mic2,
  Pencil,
  PenLine,
  Play,
  Speech,
  Type,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { getActivityDisplayCategory, getActivityHref, isFunctionalActivity } from "@/lib/activityIndex";
import { ACTIVITY_CARD_LABELS, getActivityCardInfo, getActivityCardVisualKind } from "@/lib/activityCardConfig";
import {
  FAVOURITES_UPDATED_EVENT,
  getActivityFavouriteKey,
  readStoredFavourites,
  writeStoredFavourites,
} from "@/lib/activityFavourites";
import { DOMAIN_NAV_ITEMS, getDomainTheme } from "@/lib/domainThemes";
import { getLocationSnapshot } from "@/lib/navigationHistory";
import { voicemailIllustration as voicemailCardIllustration } from "@/lib/activityIllustrations";
import appointmentLetterCardIllustration from "@/assets/activity-card-appointment-letter.png";
import completeSentenceCardIllustration from "@/assets/activity-card-complete-sentence.jpeg";
import crosswordCardIllustration from "@/assets/activity-card-crossword.png";
import doctorCardIllustration from "@/assets/activity-card-doctor.jpeg";
import namePictureCardIllustration from "@/assets/activity-card-name-the-picture.png";
import prescriptionMedicationCardIllustration from "@/assets/activity-card-prescription-medication.png";
import receiptCardIllustration from "@/assets/activity-card-receipt.png";
import semanticFeatureAnalysisCardIllustration from "@/assets/activity-card-semantic-feature-analysis.png";

const DEFAULT_CARD_ICON = Type;

const getCategoryMeta = (slug) => DOMAIN_NAV_ITEMS.find((category) => category.slug === slug) || null;

function FunctionalTaskSparkleIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        d="M8.2 1.8c.2-.55.98-.55 1.2 0l.78 2.05c.2.52.6.93 1.12 1.12l2.05.78c.55.21.55.99 0 1.2l-2.05.78c-.52.2-.93.6-1.12 1.12L9.4 10.9c-.22.55-1 .55-1.2 0l-.78-2.05c-.2-.52-.6-.93-1.12-1.12l-2.05-.78c-.55-.21-.55-.99 0-1.2l2.05-.78c.52-.2.93-.6 1.12-1.12l.78-2.05Z"
        fill="currentColor"
      />
      <path
        d="M13.4 10.1c.14-.38.68-.38.82 0l.42 1.12c.12.32.37.57.69.69l1.12.42c.38.14.38.68 0 .82l-1.12.42c-.32.12-.57.37-.69.69l-.42 1.12c-.14.38-.68.38-.82 0l-.42-1.12a1.1 1.1 0 0 0-.69-.69l-1.12-.42c-.38-.14-.38-.68 0-.82l1.12-.42c.32-.12.57-.37.69-.69l.42-1.12Z"
        fill="currentColor"
        opacity=".88"
      />
    </svg>
  );
}

const CARD_VISUALS = {
  "word-finding": { kind: "word", Icon: Type },
  reading: { kind: "reading", Icon: BookOpen },
  writing: { kind: "writing", Icon: Pencil },
  "auditory-comprehension": { kind: "audio", Icon: Headphones },
  "functional-communication": { kind: "tasks", Icon: MessageCircle },
  games: { kind: "games", Icon: Gamepad2 },
  dysphagia: { kind: "clinical", Icon: UtensilsCrossed },
  "motor-speech": { kind: "speech", Icon: Speech },
  voice: { kind: "voice", Icon: Mic2 },
  "cognitive-communication": { kind: "cognitive", Icon: Brain },
  "ai-practice": { kind: "cognitive", Icon: Brain },
};

function AudioCardVisual() {
  const waveformBars = [24, 46, 70, 40, 56, 34, 76, 46, 64, 36, 72, 48, 58, 34, 46, 28];

  return (
    <div className="cat-card-visual cat-card-audio-visual" aria-hidden="true">
      <div className="cat-card-blob">
        <div className="cat-card-waveform">
          {waveformBars.map((height, index) => (
            <span key={index} style={{ "--bar-height": `${height}%` }} />
          ))}
        </div>
        <div className="cat-card-player">
          <span className="cat-card-play">
            <Play size={18} fill="currentColor" strokeWidth={0} />
          </span>
          <span className="cat-card-progress">
            <span />
          </span>
          <span className="cat-card-player-time">0:30</span>
        </div>
      </div>
    </div>
  );
}

function CardVisualMotif({ kind }) {
  if (kind === "reading") {
    return (
      <span className="cat-card-page-stack">
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (kind === "writing") {
    return (
      <span className="cat-card-writing-panel">
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (kind === "word") {
    return (
      <span className="cat-card-word-tiles">
        <span>W</span>
        <span>?</span>
        <span>A</span>
      </span>
    );
  }

  if (kind === "tasks") {
    return (
      <span className="cat-card-task-list">
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (kind === "games") {
    return (
      <span className="cat-card-game-grid">
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} />
        ))}
      </span>
    );
  }

  if (kind === "clinical") {
    return (
      <span className="cat-card-clinical-motif">
        <span />
        <span />
      </span>
    );
  }

  if (kind === "speech" || kind === "voice") {
    return (
      <span className="cat-card-speech-wave">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (kind === "cognitive") {
    return (
      <span className="cat-card-node-map">
        <span />
        <span />
        <span />
      </span>
    );
  }

  return <span className="cat-card-abstract-orbit" />;
}

function AbstractCardVisual({ Icon, kind }) {
  return (
    <div className={`cat-card-visual cat-card-visual-${kind || "default"}`} aria-hidden="true">
      <div className="cat-card-blob">
        <CardVisualMotif kind={kind} />
        <span className="cat-card-icon-badge">
          <Icon />
        </span>
      </div>
    </div>
  );
}

function ReferenceCardVisual({ kind }) {
  return (
    <div className={`cat-card-visual cat-card-reference-visual cat-card-reference-${kind}`} aria-hidden="true">
      <div className="cat-card-blob">
        {kind === "receipt" ? (
          <span className="cat-card-reference-receipt">
            <img src={receiptCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}

        {kind === "directions" ? (
          <span className="cat-card-reference-map">
            <span className="cat-card-reference-map-card" />
            <span className="cat-card-reference-route" />
            <MapPin />
          </span>
        ) : null}

        {kind === "doctor" ? (
          <span className="cat-card-reference-doctor">
            <img src={doctorCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}

        {kind === "complete-sentence" ? (
          <span className="cat-card-reference-complete-sentence">
            <img src={completeSentenceCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}

        {kind === "category" ? (
          <span className="cat-card-reference-category">
            <span className="cat-card-reference-bubble">
              <Type />
            </span>
            <span className="cat-card-reference-dots">
              <span />
              <span />
              <span />
            </span>
          </span>
        ) : null}

        {kind === "word" ? (
          <span className="cat-card-reference-word">
            <span className="cat-card-reference-word-chip chip-left">W</span>
            <span className="cat-card-reference-word-main">T</span>
            <span className="cat-card-reference-word-chip chip-right">A</span>
            <span className="cat-card-reference-dots">
              <span />
              <span />
              <span />
            </span>
          </span>
        ) : null}

        {kind === "name-picture" ? (
          <span className="cat-card-reference-name-picture">
            <img src={namePictureCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}

        {kind === "sentence" ? (
          <span className="cat-card-reference-sentence">
            <span className="cat-card-reference-writing-lines">
              <span />
              <span />
              <span />
            </span>
            <PenLine />
          </span>
        ) : null}

        {kind === "crossword" ? (
          <span className="cat-card-reference-crossword cat-card-reference-crossword-image-wrap">
            <img src={crosswordCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}

        {kind === "signup" ? (
          <span className="cat-card-reference-signup">
            <FileText />
            <span className="cat-card-reference-avatar" />
            <span className="cat-card-reference-line line-one" />
            <span className="cat-card-reference-line line-two" />
            <span className="cat-card-reference-line line-three" />
            <PenLine />
          </span>
        ) : null}

        {kind === "task-note" ? (
          <span className="cat-card-reference-task-note">
            <span className="cat-card-reference-note-card">
              <span />
              <span />
              <span />
            </span>
            <span className="cat-card-reference-task-bubble">
              <span />
              <span />
              <span />
            </span>
          </span>
        ) : null}

        {kind === "appointment-letter" ? (
          <span className="cat-card-reference-appointment-letter">
            <img src={appointmentLetterCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}

        {kind === "instructions" ? (
          <span className="cat-card-reference-instructions">
            <Headphones />
            <span className="cat-card-reference-checks">
              <CheckCircle2 />
              <span />
              <span />
            </span>
            <span className="cat-card-reference-dots">
              <span />
              <span />
              <span />
            </span>
          </span>
        ) : null}

        {kind === "voicemail" ? (
          <span className="cat-card-reference-voicemail">
            <img
              src={voicemailCardIllustration}
              alt=""
              className="cat-card-reference-image"
              loading="lazy"
              draggable="false"
            />
          </span>
        ) : null}

        {kind === "prescription-medication" ? (
          <span className="cat-card-reference-medication cat-card-reference-prescription-medication">
            <img src={prescriptionMedicationCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}

        {kind === "sfa" ? (
          <span className="cat-card-reference-sfa cat-card-reference-sfa-image-wrap">
            <img src={semanticFeatureAnalysisCardIllustration} alt="" className="cat-card-reference-image" loading="lazy" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActivityInfoValue({ value }) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value;
}

export function ActivityCard({ activity, className = "", delayIndex = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const categorySlug = activity?.category || "all-activities";
  const isVoicemailCard = activity?.slug === "voicemails";
  const isSfaToolCard = activity?.slug === "sfa-tool";
  const displayCategorySlug = getActivityDisplayCategory(activity, categorySlug);
  const showsFunctionalPill = isFunctionalActivity(activity);
  const theme = getDomainTheme(displayCategorySlug);
  const categoryMeta = getCategoryMeta(displayCategorySlug);
  const visualConfig = CARD_VISUALS[displayCategorySlug] || {};
  const Icon = visualConfig.Icon || categoryMeta?.hubCardIcon || categoryMeta?.sidebarIcon || DEFAULT_CARD_ICON;
  const visualKind = activity?.slug === "crossword" ? "games" : visualConfig.kind || "default";
  const referenceVisualKind =
    activity?.slug === "appointment-letter"
      ? "appointment-letter"
      : getActivityCardVisualKind(activity, displayCategorySlug);
  const useReferenceCard = Boolean(referenceVisualKind);
  const categoryName = isVoicemailCard
    ? theme.name
    : ACTIVITY_CARD_LABELS[activity?.slug]
      ? ACTIVITY_CARD_LABELS[activity.slug]
    : activity?.categoryName || theme.name || categoryMeta?.name || categorySlug;
  const summary = isVoicemailCard
    ? "Listen to realistic voicemails and answer targeted questions."
    : isSfaToolCard
      ? "Explore features of a target word to support naming, associations, and word retrieval."
    : activity?.summary || activity?.description || "Guided communication practice.";
  const displayTitle = isSfaToolCard ? "Semantic Feature Analysis" : activity.title;
  const href = activity?.href || getActivityHref(activity);
  const activityInfo = useMemo(
    () => getActivityCardInfo(activity, displayCategorySlug),
    [activity, displayCategorySlug]
  );
  const infoSections = useMemo(
    () =>
      [
        { key: "clinicalTargets", label: "CLINICAL TARGETS", value: activityInfo.clinicalTargets },
        { key: "difficulty", label: "DIFFICULTY", value: activityInfo.difficulty },
        { key: "usefulFor", label: "USEFUL FOR", value: activityInfo.usefulFor },
      ].filter(({ value }) => (Array.isArray(value) ? value.length > 0 : Boolean(value))),
    [activityInfo]
  );
  const hasActivityInfo = infoSections.length > 0;
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const infoButtonRef = useRef(null);
  const infoPanelRef = useRef(null);
  const shouldReturnFocusRef = useRef(false);
  const favouriteAnimationTimeoutRef = useRef(null);
  const [isFavouriteAnimating, setIsFavouriteAnimating] = useState(false);
  const infoUid = useId();
  const infoPanelId = `${infoUid}-activity-info`;
  const infoTitleId = `${infoPanelId}-title`;
  const favouriteKey = getActivityFavouriteKey(activity);
  const activityFavouriteFallback = Boolean(
    activity?.isFavourite ??
      activity?.isFavorite ??
      activity?.favourited ??
      activity?.favorited ??
      activity?.favourite ??
      activity?.favorite
  );
  const [isFavourite, setIsFavourite] = useState(() => {
    if (!favouriteKey) {
      return activityFavouriteFallback;
    }

    return readStoredFavourites().has(favouriteKey) || activityFavouriteFallback;
  });

  useEffect(() => {
    if (!favouriteKey) {
      setIsFavourite(activityFavouriteFallback);
      return undefined;
    }

    const syncFavouriteState = () => {
      setIsFavourite(readStoredFavourites().has(favouriteKey) || activityFavouriteFallback);
    };

    syncFavouriteState();
    window.addEventListener("storage", syncFavouriteState);
    window.addEventListener(FAVOURITES_UPDATED_EVENT, syncFavouriteState);

    return () => {
      window.removeEventListener("storage", syncFavouriteState);
      window.removeEventListener(FAVOURITES_UPDATED_EVENT, syncFavouriteState);
    };
  }, [activityFavouriteFallback, favouriteKey]);

  useEffect(() => {
    if (!isInfoOpen) {
      if (shouldReturnFocusRef.current) {
        infoButtonRef.current?.focus();
        shouldReturnFocusRef.current = false;
      }
      return undefined;
    }

    shouldReturnFocusRef.current = true;
    infoPanelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsInfoOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (
        infoPanelRef.current?.contains(event.target) ||
        infoButtonRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsInfoOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isInfoOpen]);

  useEffect(
    () => () => {
      window.clearTimeout(favouriteAnimationTimeoutRef.current);
    },
    []
  );

  const startActivity = () => {
    navigate(href, { state: { from: getLocationSnapshot(location) } });
  };

  const handleStart = (event) => {
    event.stopPropagation();
    startActivity();
  };

  const handleStartKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    startActivity();
  };

  return (
    <article
      className={`cat-card activity-card-soft${useReferenceCard ? " cat-card--reference" : ""} fade-up delay-${(delayIndex % 4) + 1} group ${className}`.trim()}
      data-testid={`activity-card-${activity.slug}`}
      style={{
        "--cat-accent": theme.accent,
        "--cat-glow": theme.hoverGlow || theme.accent,
        "--cat-soft": theme.softBg || "rgba(99,102,241,0.10)",
        "--cat-icon-tint": theme.iconTint || theme.softBg || "rgba(99,102,241,0.12)",
      }}
    >
      <div className="cat-card-content">
        <div className="cat-card-topline">
          <div className="cat-card-domain">{categoryName}</div>
        </div>

        <div className="cat-card-text">
          <div className="cat-card-title">{displayTitle}</div>
          <div className="cat-card-tag">{summary}</div>
        </div>

        {useReferenceCard ? (
          <ReferenceCardVisual kind={referenceVisualKind} />
        ) : isVoicemailCard || visualKind === "audio" ? (
          <AudioCardVisual />
        ) : (
          <AbstractCardVisual Icon={Icon} kind={visualKind} />
        )}

        <div className="cat-card-action-row">
          <span className="cat-card-footer-slot">
            {showsFunctionalPill ? (
              <span className="cat-card-functional-pill cat-card-functional-pill--footer">
                <FunctionalTaskSparkleIcon />
                Functional
              </span>
            ) : null}
          </span>
          {/* Activity navigation stays Start-button-only so card bodies remain passive across all activity lists. */}
          <button
            type="button"
            className="cat-card-start-button"
            aria-label={`Start ${displayTitle}`}
            onClick={handleStart}
            onKeyDown={handleStartKeyDown}
          >
            Start
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
      {hasActivityInfo ? (
        <button
          type="button"
          ref={infoButtonRef}
          className="cat-card-info-button"
          aria-label={`About this activity: ${displayTitle}`}
          aria-expanded={isInfoOpen}
          aria-controls={isInfoOpen ? infoPanelId : undefined}
          title="About this activity"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsInfoOpen((currentValue) => !currentValue);
          }}
        >
          <Info size={22} />
        </button>
      ) : null}
      <button
        type="button"
        className={`cat-card-favourite${isFavourite ? " is-active" : ""}${isFavouriteAnimating ? " is-animating" : ""}`}
        aria-label={`${isFavourite ? "Remove from favourites" : "Add to favourites"}: ${displayTitle}`}
        aria-pressed={isFavourite}
        title={isFavourite ? "Remove from favourites" : "Add to favourites"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const nextIsFavourite = !isFavourite;
          setIsFavourite(nextIsFavourite);

          if (favouriteKey) {
            const storedFavourites = readStoredFavourites();
            if (nextIsFavourite) {
              storedFavourites.add(favouriteKey);
            } else {
              storedFavourites.delete(favouriteKey);
            }
            writeStoredFavourites(storedFavourites);
          }

          if (nextIsFavourite) {
            window.clearTimeout(favouriteAnimationTimeoutRef.current);
            setIsFavouriteAnimating(false);
            window.requestAnimationFrame(() => {
              setIsFavouriteAnimating(true);
              favouriteAnimationTimeoutRef.current = window.setTimeout(() => {
                setIsFavouriteAnimating(false);
              }, 340);
            });
          }
        }}
      >
        <Heart size={22} fill={isFavourite ? "currentColor" : "none"} />
        {isFavouriteAnimating ? (
          <span className="cat-card-favourite-sparkles" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        ) : null}
      </button>
      {isInfoOpen && hasActivityInfo ? (
        <section
          id={infoPanelId}
          ref={infoPanelRef}
          className="cat-card-info-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={infoTitleId}
          tabIndex={-1}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <button
            type="button"
            className="cat-card-info-close"
            aria-label="Close activity information"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsInfoOpen(false);
            }}
          >
            <X size={15} />
          </button>
          <h3 id={infoTitleId} className="cat-card-info-title">
            {displayTitle}
          </h3>
          <div className="cat-card-info-list">
            {infoSections.map((section) => (
              <div className="cat-card-info-section" key={section.key}>
                <div className="cat-card-info-label">{section.label}</div>
                <div className="cat-card-info-value">
                  <ActivityInfoValue value={section.value} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default ActivityCard;
