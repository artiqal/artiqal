import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { matchesAnswer } from "@/lib/answerMatch";
import { getActivityIllustration } from "@/lib/activityIllustrations";
import { useSmartBack } from "@/lib/navigationHistory";
import { useSession } from "@/contexts/SessionContext";
import { AudioControls } from "@/components/AudioControls";
import { LetterheadView } from "@/components/Letterheads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import difficultyLevelAmberIcon from "@/assets/difficulty-level-amber.png";
import difficultyLevelGreenIcon from "@/assets/difficulty-level-green.png";
import difficultyLevelPinkIcon from "@/assets/difficulty-level-pink.png";
import difficultyLevelRedIcon from "@/assets/difficulty-level-red.png";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Flag,
  Gamepad2,
  Globe,
  Keyboard,
  Layers3,
  Leaf,
  Lightbulb,
  Loader2,
  MapPin,
  Maximize2,
  MessageCircle,
  Minimize2,
  Plus,
  Printer,
  Puzzle,
  Search,
  Settings2,
  Sparkles,
  Star,
  RefreshCw,
  SlidersHorizontal,
  Tag,
  XCircle,
} from "lucide-react";

const VOICEMAIL_LEVEL_COPY = {
  green: {
    blurb:
      "Short everyday voicemails with direct-recall questions. Targets caller, message purpose, time, place, items, and next steps.",
    best_for:
      "Clients practising key detail recall from brief spoken messages.",
  },
  amber: {
    blurb:
      "Medium-length functional voicemails with questions about appointment changes, collection options, deadlines, and simple instructions.",
    best_for:
      "Clients linking multiple spoken details and identifying next steps.",
  },
  red: {
    blurb:
      "Longer functional voicemails with questions about changed plans, options, deadlines, safety details, and conditional steps.",
    best_for:
      "Clients holding details in mind, comparing options, and choosing the correct action.",
  },
  pink: {
    blurb:
      "Automated phone menu tasks with scenario-based decisions. Clients choose the correct number or action.",
    best_for:
      "Clients practising phone navigation, auditory scanning, and option selection.",
  },
};

function normalizeActivityDetail(data, category) {
  const activity = { ...data, category: data.category || category };
  if (activity.slug !== "voicemails") return activity;

  const levels = activity.content?.levels;
  if (!levels) return activity;

  return {
    ...activity,
    content: {
      ...activity.content,
      levels: Object.fromEntries(
        Object.entries(levels).map(([key, level]) => [
          key,
          VOICEMAIL_LEVEL_COPY[key] ? { ...level, ...VOICEMAIL_LEVEL_COPY[key] } : level,
        ]),
      ),
    },
  };
}

export default function ActivityPage() {
  const { category, slug } = useParams();
  const [pageSearchParams] = useSearchParams();
  const smartBack = useSmartBack();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const { logActivity } = useSession();

  useEffect(() => {
    api
      .get(`/activities/${category}/${slug}`)
      .then(({ data }) => {
        setActivity(normalizeActivityDetail(data, category));
        // For leveled-reading activities, the level child component logs the
        // level-specific activity once the user picks a difficulty.
        if (data.type !== "reading-leveled") {
          logActivity({ category, activity_slug: slug, activity_title: data.title });
        }
      })
      .catch(() => setError("Activity not found."));
  }, [category, slug, logActivity]);

  if (error)
    return (
      <div className="min-h-screen">
        <main className="clinician-page">
        <div className="max-w-3xl mx-auto py-16 text-center text-rose-600" data-testid="activity-error">
          {error}
        </div>
        </main>
      </div>
    );

  if (!activity)
    return (
      <div className="min-h-screen">
        <main className="clinician-page">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-zinc-500">Loading…</div>
        </main>
      </div>
    );

  const isLeveled = activity.type === "reading-leveled";
  const isCrosswordSettings = category === "games" && activity.slug === "crossword";
  const isVoicemailDifficultyPicker =
    isLeveled &&
    activity.slug === "voicemails" &&
    !pageSearchParams.has("level");

  return (
    <div
      className={isVoicemailDifficultyPicker ? "activity-page-fit-content" : "min-h-screen"}
      data-testid="activity-page"
    >
      <main
        className={`clinician-page ${isLeveled || isCrosswordSettings ? "is-wide is-compact" : "is-narrow"}`}
      >
        {isLeveled ? (
          <div className="fade-up">{renderActivity(activity)}</div>
        ) : isCrosswordSettings ? (
          <CrosswordSettings activity={activity} category={category} />
        ) : (
          <>
            <button
              type="button"
              onClick={smartBack}
              className="inline-flex items-center text-sm text-zinc-500 hover:text-indigo-600"
              data-testid="back-to-category"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="mt-6 fade-up">
              <h1 className="font-display text-4xl font-bold tracking-tight" data-testid="activity-title">
                {activity.title}
              </h1>
              <p className="mt-2 text-zinc-600">{activity.summary}</p>
            </div>

            <div className="mt-8 fade-up delay-1">{renderActivity(activity)}</div>
          </>
        )}
      </main>
    </div>
  );
}

const CROSSWORD_TYPE_OPTIONS = [
  "Semantic Feature Analysis (Picture Based)",
  "Descriptions",
  "Synonyms",
  "Antonyms",
  "Categories",
  "Functional Vocabulary",
  "Personalised Words",
];

const CROSSWORD_WORD_SET_OPTIONS = [
  "Sports & Leisure",
];

const CROSSWORD_COUNTS = [1, 2, 3, 4];
const CROSSWORD_RESPONSE_MODES = ["Type answers", "Word bank", "Clinician-led"];
const FEATURED_CROSSWORD_ID = "soccer-football-match";

const SFA_HELPER_CARDS = [
  {
    title: "Category",
    prompt: "What is it a type of?",
    Icon: Tag,
    tone: "mint",
  },
  {
    title: "Function / role",
    prompt: "Do we use it for anything?",
    Icon: Settings2,
    tone: "blue",
  },
  {
    title: "Action",
    prompt: "Can you do anything with it? How would you use it?",
    Icon: Sparkles,
    tone: "yellow",
  },
  {
    title: "Properties",
    prompt: "What does it look like? Size, shape, colour, etc...",
    Icon: Search,
    tone: "peach",
  },
  {
    title: "Association",
    prompt: "What does it remind you of?",
    Icon: MessageCircle,
    tone: "lavender",
  },
  {
    title: "Location",
    prompt: "Where would you find it?",
    Icon: MapPin,
    tone: "pink",
  },
];

const CROSSWORD_PICTURE_CLUES = {
  BALL: "ball",
  BASKET: "ball",
  BAT: "bat",
  CLEATS: "cleats",
  CLUB: "club",
  CONES: "cones",
  FIELD: "goal",
  FLAG: "flag",
  GLOVE: "glove",
  GOAL: "goal",
  GOGGLES: "goggles",
  JERSEY: "shirt",
  NET: "goal",
  PINS: "pins",
  POOL: "water",
  RACKET: "racket",
  SCARF: "scarf",
  SHIRT: "shirt",
  SHOES: "cleats",
  SNEAKERS: "cleats",
  SOCCER: "ball",
  TEE: "tee",
  WHISTLE: "whistle",
};

const SFA_SPORTS_LEISURE_TEMPLATES = [
  {
    id: "soccer-football-match",
    title: "Soccer / Football Match",
    progressTotal: 31,
    words: [
      { answer: "WHISTLE", feature: "Function / role", clue: "A referee may use this to start or stop play." },
      { answer: "CONES", feature: "Location", clue: "Markers used for drills, boundaries, or practice areas." },
      { answer: "CLEATS", feature: "Properties", clue: "Shoes with studs that help players grip the field." },
      { answer: "JERSEY", feature: "Association", clue: "A team shirt with a number on it." },
      { answer: "SCARF", feature: "Association", clue: "A supporter may wear this in team colours." },
      { answer: "BALL", feature: "Category", clue: "The round object players kick during the match." },
      { answer: "GOAL", feature: "Function / role", clue: "Players try to send the ball into this to score." },
      { answer: "FLAG", feature: "Action", clue: "An assistant referee raises this to signal during play." },
    ],
  },
  {
    id: "basketball-court",
    title: "Basketball Court",
    words: [
      { answer: "BASKET", feature: "Function / role", clue: "Players score by shooting the ball into this." },
      { answer: "HOOP", feature: "Properties", clue: "The round ring attached to the backboard." },
      { answer: "DRIBBLE", feature: "Action", clue: "To bounce the ball while moving." },
      { answer: "COURT", feature: "Location", clue: "The indoor or outdoor surface where basketball is played." },
      { answer: "TEAM", feature: "Category", clue: "A group of players working together." },
      { answer: "SNEAKERS", feature: "Association", clue: "Shoes often worn for this sport." },
    ],
  },
  {
    id: "tennis-match",
    title: "Tennis Match",
    words: [
      { answer: "TENNIS", feature: "Category", clue: "A sport played by hitting a ball over a net." },
      { answer: "RACKET", feature: "Function / role", clue: "A tool used to hit the tennis ball." },
      { answer: "SERVE", feature: "Action", clue: "The first hit that starts a point." },
      { answer: "NET", feature: "Properties", clue: "A barrier stretched across the middle of the court." },
      { answer: "COURT", feature: "Location", clue: "The marked area where the match is played." },
      { answer: "BALL", feature: "Association", clue: "A small fuzzy object hit back and forth." },
    ],
  },
  {
    id: "golf-course",
    title: "Golf Course",
    words: [
      { answer: "GOLF", feature: "Category", clue: "A sport where players hit a ball toward holes." },
      { answer: "CLUB", feature: "Function / role", clue: "A tool used to hit the golf ball." },
      { answer: "PUTT", feature: "Action", clue: "A gentle stroke used near the hole." },
      { answer: "GREEN", feature: "Location", clue: "The smooth grassy area around the hole." },
      { answer: "CART", feature: "Association", clue: "A small vehicle used to move around the course." },
      { answer: "TEE", feature: "Properties", clue: "A small peg that holds the ball at the start." },
    ],
  },
  {
    id: "swimming",
    title: "Swimming",
    words: [
      { answer: "SWIM", feature: "Action", clue: "To move through water using your arms and legs." },
      { answer: "POOL", feature: "Location", clue: "A common place where people swim." },
      { answer: "GOGGLES", feature: "Function / role", clue: "They protect your eyes underwater." },
      { answer: "LAP", feature: "Association", clue: "One trip across the pool and back." },
      { answer: "WATER", feature: "Properties", clue: "The liquid you move through when swimming." },
      { answer: "TOWEL", feature: "Function / role", clue: "Used to dry off after swimming." },
    ],
  },
  {
    id: "baseball-game",
    title: "Baseball Game",
    words: [
      { answer: "BASEBALL", feature: "Category", clue: "A sport with bases, bats, and innings." },
      { answer: "BAT", feature: "Function / role", clue: "Used to hit the ball." },
      { answer: "PITCHER", feature: "Association", clue: "The player who throws the ball to the batter." },
      { answer: "CATCH", feature: "Action", clue: "To grab the ball with a glove." },
      { answer: "DIAMOND", feature: "Location", clue: "The shape of the infield with four bases." },
      { answer: "GLOVE", feature: "Properties", clue: "Worn on the hand to catch the ball." },
    ],
  },
  {
    id: "bowling-night",
    title: "Bowling Night",
    words: [
      { answer: "BOWLING", feature: "Category", clue: "A leisure activity where players roll a heavy ball." },
      { answer: "PINS", feature: "Function / role", clue: "The objects you try to knock down." },
      { answer: "LANE", feature: "Location", clue: "The long narrow surface where the ball rolls." },
      { answer: "STRIKE", feature: "Association", clue: "When all pins are knocked down on the first roll." },
      { answer: "ROLL", feature: "Action", clue: "To send the ball down the lane." },
      { answer: "SHOES", feature: "Properties", clue: "Special footwear worn at the bowling alley." },
    ],
  },
  {
    id: "fishing-trip",
    title: "Fishing Trip",
    words: [
      { answer: "FISHING", feature: "Category", clue: "An outdoor activity where people try to catch fish." },
      { answer: "ROD", feature: "Function / role", clue: "A long tool used to cast a line." },
      { answer: "BAIT", feature: "Function / role", clue: "Something used to attract fish." },
      { answer: "CAST", feature: "Action", clue: "To throw the line into the water." },
      { answer: "LAKE", feature: "Location", clue: "A common place to go fishing." },
      { answer: "HOOK", feature: "Properties", clue: "A curved metal piece that catches the fish." },
    ],
  },
  {
    id: "hiking-trail",
    title: "Hiking Trail",
    words: [
      { answer: "HIKING", feature: "Category", clue: "A leisure activity that involves walking outdoors." },
      { answer: "TRAIL", feature: "Location", clue: "A marked path people follow while hiking." },
      { answer: "BOOTS", feature: "Properties", clue: "Sturdy footwear worn on uneven ground." },
      { answer: "BACKPACK", feature: "Function / role", clue: "Used to carry water, snacks, and supplies." },
      { answer: "CLIMB", feature: "Action", clue: "To move upward on a hill or mountain." },
      { answer: "MAP", feature: "Association", clue: "Helps hikers know where to go." },
    ],
  },
  {
    id: "snowboarding",
    title: "Snowboarding",
    words: [
      { answer: "SNOWBOARD", feature: "Function / role", clue: "The board used to ride down snowy slopes." },
      { answer: "SLOPE", feature: "Location", clue: "A snowy hill or run used for the activity." },
      { answer: "HELMET", feature: "Function / role", clue: "Protects your head while riding." },
      { answer: "CARVE", feature: "Action", clue: "To turn smoothly on the edge of the board." },
      { answer: "WINTER", feature: "Association", clue: "The season most connected with snowboarding." },
      { answer: "GOGGLES", feature: "Properties", clue: "Protect the eyes from snow and wind." },
    ],
  },
  {
    id: "dance-class",
    title: "Dance Class",
    words: [
      { answer: "DANCE", feature: "Category", clue: "A leisure activity that uses movement and rhythm." },
      { answer: "MUSIC", feature: "Association", clue: "Something dancers often move to." },
      { answer: "STUDIO", feature: "Location", clue: "A room where dance classes may happen." },
      { answer: "STEP", feature: "Action", clue: "A single movement in a dance routine." },
      { answer: "BALANCE", feature: "Function / role", clue: "A skill dancers use to stay steady." },
      { answer: "SHOES", feature: "Properties", clue: "Footwear dancers may wear for class." },
    ],
  },
];

const CROSSWORD_TEMPLATE_SETS = {
  "Sports & Leisure": SFA_SPORTS_LEISURE_TEMPLATES,
};

function pickRandomTemplates(templates, count) {
  const featured = templates.find((template) => template.id === FEATURED_CROSSWORD_ID);
  const shuffled = templates.filter((template) => template.id !== FEATURED_CROSSWORD_ID);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const ordered = featured ? [featured, ...shuffled] : shuffled;
  return ordered.slice(0, Math.min(count, ordered.length));
}

function normalizeCrosswordAnswer(answer) {
  return String(answer || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function cellKey(row, col) {
  return `${row},${col}`;
}

function getGridCell(grid, row, col) {
  return grid.get(cellKey(row, col));
}

function canPlaceCrosswordWord(grid, word, row, col, direction, requireCrossing = true) {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;
  let crossings = 0;
  const before = getGridCell(grid, row - dr, col - dc);
  const after = getGridCell(grid, row + dr * word.length, col + dc * word.length);
  if (before || after) return false;

  for (let i = 0; i < word.length; i += 1) {
    const r = row + dr * i;
    const c = col + dc * i;
    const existing = getGridCell(grid, r, c);
    if (existing && existing !== word[i]) return false;
    if (existing === word[i]) {
      crossings += 1;
      continue;
    }
    if (direction === "across") {
      if (getGridCell(grid, r - 1, c) || getGridCell(grid, r + 1, c)) return false;
    } else if (getGridCell(grid, r, c - 1) || getGridCell(grid, r, c + 1)) {
      return false;
    }
  }

  return !requireCrossing || crossings > 0;
}

function writeCrosswordWord(grid, entry, row, col, direction) {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;
  for (let i = 0; i < entry.answer.length; i += 1) {
    grid.set(cellKey(row + dr * i, col + dc * i), entry.answer[i]);
  }
  return { ...entry, row, col, direction };
}

function buildInteractiveCrossword(template) {
  const entries = template.words
    .map((word, index) => ({
      ...word,
      answer: normalizeCrosswordAnswer(word.answer),
      originalIndex: index,
    }))
    .filter((word) => word.answer.length > 1)
    .sort((a, b) => b.answer.length - a.answer.length);
  const grid = new Map();
  const placements = [];

  if (!entries.length) {
    return { ...template, width: 0, height: 0, cells: [], clues: { across: [], down: [] }, words: [] };
  }

  placements.push(writeCrosswordWord(grid, entries[0], 0, 0, "across"));

  for (const entry of entries.slice(1)) {
    let placed = null;
    const occupied = [...grid.entries()].map(([key, letter]) => {
      const [row, col] = key.split(",").map(Number);
      return { row, col, letter };
    });

    for (const cell of occupied) {
      if (placed) break;
      for (let i = 0; i < entry.answer.length; i += 1) {
        if (entry.answer[i] !== cell.letter) continue;
        for (const direction of ["down", "across"]) {
          const row = cell.row - (direction === "down" ? i : 0);
          const col = cell.col - (direction === "across" ? i : 0);
          if (canPlaceCrosswordWord(grid, entry.answer, row, col, direction, true)) {
            placed = writeCrosswordWord(grid, entry, row, col, direction);
            break;
          }
        }
        if (placed) break;
      }
    }

    if (!placed) {
      const rows = [...grid.keys()].map((key) => Number(key.split(",")[0]));
      const nextRow = Math.max(...rows, 0) + 2;
      placements.push(writeCrosswordWord(grid, entry, nextRow, 0, "across"));
    } else {
      placements.push(placed);
    }
  }

  const coords = [...grid.keys()].map((key) => key.split(",").map(Number));
  const minRow = Math.min(...coords.map(([row]) => row));
  const minCol = Math.min(...coords.map(([, col]) => col));
  const maxRow = Math.max(...coords.map(([row]) => row));
  const maxCol = Math.max(...coords.map(([, col]) => col));
  const width = maxCol - minCol + 1;
  const height = maxRow - minRow + 1;
  const normalizedPlacements = placements
    .map((placement) => ({
      ...placement,
      row: placement.row - minRow,
      col: placement.col - minCol,
    }))
    .sort((a, b) => a.row - b.row || a.col - b.col || a.direction.localeCompare(b.direction));
  const startNumbers = new Map();
  normalizedPlacements.forEach((placement) => {
    const key = cellKey(placement.row, placement.col);
    if (!startNumbers.has(key)) {
      startNumbers.set(key, startNumbers.size + 1);
    }
  });

  const cells = Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) => {
      const solution = getGridCell(grid, row + minRow, col + minCol);
      if (!solution) return null;
      return {
        row,
        col,
        key: cellKey(row, col),
        solution,
        number: startNumbers.get(cellKey(row, col)) || null,
      };
    })
  );

  const numberedPlacements = normalizedPlacements.map((placement) => ({
    ...placement,
    number: startNumbers.get(cellKey(placement.row, placement.col)),
  }));

  return {
    ...template,
    width,
    height,
    cells,
    words: entries,
    clues: {
      across: numberedPlacements.filter((word) => word.direction === "across"),
      down: numberedPlacements.filter((word) => word.direction === "down"),
    },
  };
}

function slugToTitle(slug) {
  return (slug || "")
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function BreadcrumbHeader({ crumbs, onBack, backLabel = "Back", className = "" }) {
  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`.trim()} data-testid="breadcrumb-header">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center text-sm text-zinc-600 hover:text-indigo-600 font-display font-medium"
        data-testid="breadcrumb-back"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
      </button>
      <span className="hidden sm:inline-block w-px h-4 bg-zinc-300" />
      <nav
        className="flex items-center gap-1.5 text-sm text-zinc-500 flex-wrap"
        aria-label="Breadcrumb"
      >
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          const obj = typeof c === "string" ? { label: c } : c;
          const clickable = !isLast && typeof obj.onClick === "function";
          return (
            <React.Fragment key={i}>
              {i > 0 ? <ChevronRight className="w-3.5 h-3.5 text-zinc-400" /> : null}
              {clickable ? (
                <button
                  type="button"
                  onClick={obj.onClick}
                  className="hover:text-indigo-600 hover:underline underline-offset-2 transition"
                  data-testid={`breadcrumb-crumb-${i}`}
                >
                  {obj.label}
                </button>
              ) : (
                <span
                  className={isLast ? "text-zinc-900 font-display font-semibold" : ""}
                  data-testid={`breadcrumb-crumb-${i}`}
                >
                  {obj.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}

function CrosswordSettings({ activity, category }) {
  const navigate = useNavigate();
  const smartBack = useSmartBack();
  const { isActive, start, logActivity } = useSession();
  const [crosswordType, setCrosswordType] = useState(CROSSWORD_TYPE_OPTIONS[0]);
  const [wordSet, setWordSet] = useState(CROSSWORD_WORD_SET_OPTIONS[0]);
  const [crosswordCount, setCrosswordCount] = useState(2);
  const [responseMode, setResponseMode] = useState(CROSSWORD_RESPONSE_MODES[0]);
  const [addedToSession, setAddedToSession] = useState(false);
  const [startedCrossword, setStartedCrossword] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [activeCrosswordIndex, setActiveCrosswordIndex] = useState(0);

  const handleAddToSession = () => {
    if (!isActive) {
      start();
      window.setTimeout(() => {
        logActivity({
          category,
          activity_slug: activity.slug,
          activity_title: activity.title,
        });
      }, 0);
    } else {
      logActivity({
        category,
        activity_slug: activity.slug,
        activity_title: activity.title,
      });
    }
    setAddedToSession(true);
  };

  const generateSelectedTemplates = () => {
    const availableTemplates = crosswordType === CROSSWORD_TYPE_OPTIONS[0]
      ? CROSSWORD_TEMPLATE_SETS[wordSet] || []
      : [];
    const pickedCrosswords = pickRandomTemplates(availableTemplates, crosswordCount).map(buildInteractiveCrossword);
    setSelectedTemplates(pickedCrosswords);
    setActiveCrosswordIndex(0);
    return pickedCrosswords;
  };

  const handleGenerateCrossword = () => {
    generateSelectedTemplates();
    setStartedCrossword(true);
  };

  const handleStartCrossword = () => {
    handleAddToSession();
    generateSelectedTemplates();
    setStartedCrossword(true);
  };

  const handleNextCrossword = () => {
    setActiveCrosswordIndex((current) => {
      if (current < selectedTemplates.length - 1) {
        return current + 1;
      }
      // TODO: Connect to a completion/end-of-pack state once the full activity flow exists.
      return current;
    });
  };

  const handleEndCrossword = () => {
    navigate("/category/games");
  };

  const handleFullscreenPlaceholder = () => {
    // TODO: Wire this to the shared activity full-screen shell when that pattern is available.
  };

  const breadcrumb = (
    <BreadcrumbHeader
      onBack={smartBack}
      crumbs={[
        { label: "Hub", onClick: () => navigate("/dashboard") },
        { label: "Games", onClick: () => navigate("/category/games") },
        "Crossword",
      ]}
    />
  );

  if (startedCrossword) {
    const activeCrossword = selectedTemplates[activeCrosswordIndex];

    return (
      <section className="crossword-settings-page crossword-active-page fade-up" data-testid="crossword-active-page">
        {activeCrossword ? (
          <InteractiveCrosswordCard
            key={`${activeCrossword.id}-${activeCrosswordIndex}`}
            crossword={activeCrossword}
            index={activeCrosswordIndex}
            responseMode={responseMode}
            totalCrosswords={selectedTemplates.length}
            hasNextCrossword={activeCrosswordIndex < selectedTemplates.length - 1}
            onEditSettings={() => setStartedCrossword(false)}
            onEndActivity={handleEndCrossword}
            onFullscreen={handleFullscreenPlaceholder}
            onNextCrossword={handleNextCrossword}
          />
        ) : (
          <div className="crossword-template-empty">
            <Puzzle className="h-6 w-6" />
            <h2>No templates available yet</h2>
            <p>Choose Semantic Feature Analysis and Sports & Leisure to use this imported template pack.</p>
            <Button type="button" variant="outline" className="crossword-edit-settings-btn" onClick={() => setStartedCrossword(false)}>
              Edit settings
            </Button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="crossword-settings-page fade-up" data-testid="crossword-settings-page">
      {breadcrumb}

      <div className="crossword-settings-heading">
        <h1>Crossword Settings</h1>
        <p>Configure a crossword activity for your session.</p>
      </div>

      <div className="crossword-settings-card" data-testid="crossword-settings-card">
        <div className="crossword-settings-card-header">
          <span className="crossword-game-tile" aria-hidden="true">
            <Gamepad2 className="h-8 w-8" />
          </span>
          <div className="crossword-settings-card-title">
            <h2>{activity.title || "Crossword"}</h2>
          </div>
          <span className="crossword-domain-pill">Games</span>
        </div>

        <div className="crossword-settings-divider" />

        <div className="crossword-settings-grid">
          <label className="crossword-field">
            <span>1. Crossword type</span>
            <span className="crossword-select-wrap">
              <select
                value={crosswordType}
                onChange={(event) => setCrosswordType(event.target.value)}
                className="crossword-select"
                data-testid="crossword-type-select"
              >
                {CROSSWORD_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </span>
          </label>

          <label className="crossword-field">
            <span>2. Theme / word set</span>
            <span className="crossword-select-wrap">
              <select
                value={wordSet}
                onChange={(event) => setWordSet(event.target.value)}
                className="crossword-select"
                data-testid="crossword-word-set-select"
              >
                {CROSSWORD_WORD_SET_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </span>
          </label>

          <div className="crossword-field">
            <span>3. Number of crosswords</span>
            <div className="crossword-segmented" role="group" aria-label="Number of crosswords">
              {CROSSWORD_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  className={count === crosswordCount ? "is-selected" : ""}
                  aria-pressed={count === crosswordCount}
                  onClick={() => setCrosswordCount(count)}
                  data-testid={`crossword-count-${count}`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="crossword-field crossword-field-full">
            <span>4. Response mode</span>
            <div className="crossword-segmented crossword-segmented-wide" role="group" aria-label="Response mode">
              {CROSSWORD_RESPONSE_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={mode === responseMode ? "is-selected" : ""}
                  aria-pressed={mode === responseMode}
                  onClick={() => setResponseMode(mode)}
                  data-testid={`crossword-response-${mode.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="crossword-settings-footer">
          <div className="crossword-actions">
            <Button type="button" className="crossword-start-btn" onClick={handleStartCrossword}>
              Start <ArrowRight className="h-4 w-4" />
            </Button>
            <Button type="button" className="crossword-generate-btn" onClick={handleGenerateCrossword}>
              <Sparkles className="h-4 w-4" /> Generate crossword
            </Button>
            <Button type="button" variant="outline" className="crossword-add-btn" onClick={handleAddToSession}>
              <Plus className="h-5 w-5" /> {addedToSession ? "Added to session" : "Add to session"}
            </Button>
          </div>

          <div className="crossword-summary-strip" aria-label="Selected crossword settings">
            <span><Puzzle className="h-4 w-4" /> {crosswordCount} {crosswordCount === 1 ? "crossword" : "crosswords"}</span>
            <span><Globe className="h-4 w-4" /> {wordSet}</span>
            <span><Keyboard className="h-4 w-4" /> {responseMode}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function InteractiveCrosswordCard({
  crossword,
  index,
  responseMode,
  totalCrosswords,
  hasNextCrossword,
  onEditSettings,
  onEndActivity,
  onFullscreen,
  onNextCrossword,
}) {
  const [answers, setAnswers] = useState({});
  const cells = crossword.cells.flat().filter(Boolean);
  const correctCount = cells.filter((cell) => answers[cell.key] === cell.solution).length;
  const progressTotal = crossword.progressTotal || cells.length;
  const displayedCorrectCount = Math.min(correctCount, progressTotal);
  const isClinicianLed = responseMode === "Clinician-led";
  const showWordBank = responseMode === "Word bank";
  const blockCellKey = getDisplayBlockCellKey(crossword);

  const handleCellChange = (cell, value) => {
    const next = value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setAnswers((current) => ({ ...current, [cell.key]: next }));
  };

  return (
    <article className="crossword-activity-screen" data-testid={`interactive-crossword-${crossword.id}`}>
      <header className="crossword-activity-head">
        <div className="crossword-activity-title">
          <span>Crossword {index + 1}</span>
          <h1>{crossword.title}</h1>
          <p>Use the picture clues and semantic feature helpers to complete the crossword.</p>
        </div>

        <div className="crossword-activity-controls">
          <div className="crossword-activity-button-row">
            <Button type="button" variant="outline" className="crossword-activity-edit-btn" onClick={onEditSettings}>
              <SlidersHorizontal className="h-4 w-4" /> Edit settings
            </Button>
            <Button type="button" variant="outline" className="crossword-activity-end-btn" onClick={onEndActivity}>
              <Flag className="h-4 w-4" /> End activity
            </Button>
            <Button
              type="button"
              variant="outline"
              className="crossword-activity-fullscreen-btn"
              aria-label="Full screen"
              onClick={onFullscreen}
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="crossword-score-pill" aria-live="polite">
            {displayedCorrectCount}/{progressTotal} correct
          </div>
        </div>
      </header>

      {showWordBank ? (
        <div className="crossword-word-bank" aria-label="Word bank">
          {crossword.words.map((word) => (
            <span key={word.answer}>{word.answer}</span>
          ))}
        </div>
      ) : null}

      <div className="crossword-activity-layout">
        <section className="crossword-picture-panel" aria-label="Picture clues">
          <PictureClueSection title="Across (Picture Clues)" clues={crossword.clues.across} />
          <PictureClueSection title="Down (Picture Clues)" clues={crossword.clues.down} />
        </section>

        <section className="crossword-grid-panel" aria-label={`${crossword.title} crossword grid panel`}>
          <div
            className="crossword-grid is-activity-grid"
            style={{ gridTemplateColumns: `repeat(${crossword.width}, minmax(0, 1fr))` }}
            aria-label={`${crossword.title} crossword grid`}
          >
            {crossword.cells.flatMap((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = cellKey(rowIndex, colIndex);
                if (!cell) {
                  return (
                    <div
                      key={key}
                      className={`crossword-cell is-empty ${blockCellKey === key ? "is-block" : ""}`}
                      aria-hidden="true"
                    />
                  );
                }
                const value = answers[cell.key] || "";
                const isCorrect = value && value === cell.solution;
                return (
                  <label
                    key={cell.key}
                    className={`crossword-cell ${isCorrect ? "is-correct" : ""}`}
                  >
                    {cell.number ? <span>{cell.number}</span> : null}
                    <input
                      value={value}
                      maxLength={1}
                      disabled={isClinicianLed}
                      aria-label={`Row ${cell.row + 1}, column ${cell.col + 1}`}
                      onChange={(event) => handleCellChange(cell, event.target.value)}
                      onFocus={(event) => event.target.select()}
                    />
                  </label>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="crossword-sfa-panel" aria-label="Semantic feature analysis helpers">
        <div className="crossword-sfa-heading">
          <span aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Let's think around the word
        </div>
        <div className="crossword-sfa-cards">
          {SFA_HELPER_CARDS.map(({ title, prompt, Icon, tone }) => (
            <div key={title} className={`crossword-sfa-card tone-${tone}`}>
              <Icon className="h-4 w-4" />
              <strong>{title}</strong>
              <p>{prompt}</p>
            </div>
          ))}
        </div>
        <div className="crossword-next-row">
          <Button
            type="button"
            className="crossword-next-btn"
            onClick={onNextCrossword}
            disabled={!hasNextCrossword}
            aria-label={hasNextCrossword ? `Go to crossword ${index + 2} of ${totalCrosswords}` : "No next crossword available"}
          >
            Next crossword <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </article>
  );
}

function PictureClueSection({ title, clues }) {
  return (
    <div className="crossword-picture-section">
      <h2>{title}</h2>
      <div className="crossword-picture-grid">
        {clues.map((clue) => (
          <article
            key={`${clue.direction}-${clue.number}-${clue.answer}`}
            className="crossword-picture-card"
            aria-label={`${clue.number}. ${slugToTitle(clue.answer.toLowerCase())}`}
          >
            <span className="crossword-picture-number">{clue.number}</span>
            <span className={`crossword-picture-visual is-${getPictureClueKind(clue.answer)}`} aria-hidden="true">
              <span />
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function getPictureClueKind(answer) {
  return CROSSWORD_PICTURE_CLUES[normalizeCrosswordAnswer(answer)] || "default";
}

function getDisplayBlockCellKey(crossword) {
  const emptyCells = [];
  crossword.cells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) emptyCells.push({ row: rowIndex, col: colIndex, key: cellKey(rowIndex, colIndex) });
    });
  });
  if (!emptyCells.length) return null;
  const targetRow = crossword.height * 0.62;
  const targetCol = crossword.width * 0.62;
  emptyCells.sort((a, b) => (
    Math.hypot(a.row - targetRow, a.col - targetCol) - Math.hypot(b.row - targetRow, b.col - targetCol)
  ));
  return emptyCells[0].key;
}

function ComplexityDots({ level, color, neon = false }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label={`Complexity ${level} of 3`}
      data-testid={`complexity-dots-${level}`}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={
            i <= level
              ? {
                  background: color,
                  boxShadow: neon
                    ? `0 0 6px ${color}, 0 0 12px ${color}aa`
                    : undefined,
                }
              : { background: "#D4D4D8" }
          }
        />
      ))}
    </span>
  );
}

function renderActivity(a) {
  switch (a.type) {
    case "reading":
      return <ReadingExercise activity={a} />;
    case "reading-leveled":
      return <LeveledReadingExercise activity={a} />;
    case "ai-reading":
      return <AIReadingExercise activity={a} />;
    case "writing":
      return <WritingExercise activity={a} />;
    case "naming":
      return <NamingExercise activity={a} />;
    case "list":
      return <ListExercise activity={a} />;
    case "mcq":
      return <MCQExercise activity={a} />;
    case "yesno":
      return <YesNoExercise activity={a} />;
    case "dialogue":
      return <DialogueExercise activity={a} />;
    case "sfa":
      return <Navigate to="/sfa" replace />;
    default:
      return <ActivityPlaceholder activity={a} />;
  }
}

function ActivityPlaceholder({ activity }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-[0_20px_60px_rgba(49,46,129,0.10)]">
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 px-8 py-10 text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" /> Guided practice
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold">{activity.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          {activity.summary || activity.description || "A guided communication activity designed for focused practice."}
        </p>
      </div>
      <div className="flex flex-col gap-5 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-zinc-900">This activity is being prepared</h3>
          <p className="mt-1 text-sm text-zinc-500">The polished interactive practice screen will be available here soon.</p>
        </div>
        <Link to={`/category/${activity.category}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700">
          Browse category <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ReadingExercise({ activity, onChangeLevel, levelLabel, onNext, nextLabel, fullscreen, onToggleFullscreen, onAttempt, onHint, onEnd, layout = "split" }) {
  const { text, questions, letterhead } = activity.content;
  const isPhoneMenu = letterhead?.format === "phone-menu";
  const isVoicemail = letterhead?.format === "voicemail";
  const [values, setValues] = useState({});
  const [replayNonce, setReplayNonce] = useState(0);
  const triggerReplay = () => setReplayNonce((n) => n + 1);
  // Reset replay counter when the audio source changes (next item)
  useEffect(() => {
    setReplayNonce(0);
  }, [letterhead?.audio_url]);
  const [submitted, setSubmitted] = useState({});
  const [hints, setHints] = useState({});
  const { logAttempt, logCue } = useSession();

  const onSubmit = (i, value) => {
    if (submitted[i] != null) return;
    const trimmed = (value || "").trim();
    if (!trimmed) return;
    const q = questions[i];
    const expected = q.options[q.answer];
    const correct = matchesAnswer(trimmed, expected);
    const usedHint = !!hints[i];
    setSubmitted((s) => ({ ...s, [i]: { correct, picked: trimmed } }));
    logAttempt({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      qid: `q${i}`,
      correct,
      picked: trimmed,
      expected,
    });
    if (typeof onAttempt === "function") {
      onAttempt({ qid: `q${i}`, correct, usedHint });
    }
  };

  const onShowHint = (i) => {
    if (hints[i]) return;
    setHints((h) => ({ ...h, [i]: true }));
    logCue({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      cue_type: "hint",
      detail: `q${i}`,
    });
    if (typeof onHint === "function") {
      onHint({ qid: `q${i}` });
    }
  };

  return (
    <div>
      {onChangeLevel ? (
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2" data-testid="leveled-reading-toolbar">
          {levelLabel ? (
            <span
              className="inline-flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white text-xs sm:text-[13px] font-display font-extrabold uppercase tracking-[0.18em]"
              style={{
                color: levelLabel.color,
                border: `1px solid ${levelLabel.border}`,
                boxShadow: `0 10px 24px -14px ${levelLabel.shadow}, 0 1px 0 rgba(255,255,255,0.7) inset`,
              }}
              data-testid="level-pill"
            >
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center gap-1 rounded-full px-1.5 py-1"
                style={{ background: levelLabel.dotsBg }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        i < (levelLabel.complexity || 1)
                          ? levelLabel.dot
                          : levelLabel.dotMuted,
                    }}
                  />
                ))}
              </span>
              {levelLabel.text}
            </span>
          ) : <span />}
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleFullscreen ? (
              <Button
                type="button"
                variant="outline"
                onClick={onToggleFullscreen}
                className="rounded-full font-display h-10 px-4"
                data-testid="fullscreen-toggle-btn"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                {fullscreen ? "Exit full screen" : "Full screen"}
              </Button>
            ) : null}
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
        </div>
      ) : null}
      {letterhead || text ? (
        isPhoneMenu ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start" data-testid="reading-phone-menu">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight inline-flex items-center gap-2">
                Questions
                <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              </h2>
              <div className="mt-4 space-y-4" data-testid="reading-questions">
                {questions.map((q, i) => (
                  <PhoneKeypadCard
                    key={i}
                    qid={i}
                    q={q}
                    value={values[i] || ""}
                    onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                    onSubmit={(v) => onSubmit(i, v)}
                    onReplay={triggerReplay}
                    result={submitted[i]}
                  />
                ))}
              </div>
              {onNext || onEnd ? (
                <div className="mt-5 flex flex-wrap justify-start gap-3" data-testid="next-letter-cta">
                  {onNext ? (
                    <Button
                      type="button"
                      onClick={onNext}
                      className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-11 px-5"
                      data-testid="next-letter-btn"
                    >
                      {nextLabel || "Next letter"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : null}
                  {onEnd ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onEnd}
                      className="rounded-full font-display h-11 px-5 border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      data-testid="end-activity-btn"
                    >
                      <Flag className="w-4 h-4 mr-2" /> End activity
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2 lg:sticky lg:top-20">
              <LetterheadView letterhead={letterhead} replayNonce={replayNonce} />
            </div>
          </div>
        ) : layout === "stacked" ? (
          <div className="space-y-6 max-w-3xl mx-auto" data-testid="reading-stacked">
            <div>
              {letterhead ? (
                <LetterheadView letterhead={letterhead} />
              ) : (
                <div className="reading-block" data-testid="reading-text">{text}</div>
              )}
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight inline-flex items-center gap-2">
                Questions
                <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              </h2>
              <div className="mt-4 space-y-4" data-testid="reading-questions">
                {questions.map((q, i) => (
                  isPhoneMenu ? (
                    <PhoneKeypadCard
                      key={i}
                      qid={i}
                      q={q}
                      value={values[i] || ""}
                      onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                      onSubmit={(v) => onSubmit(i, v)}
                      onReplay={triggerReplay}
                      result={submitted[i]}
                    />
                  ) : (
                    <TextAnswerCard
                      key={i}
                      qid={i}
                      q={q}
                      value={values[i] || ""}
                      onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                      onSubmit={(v) => onSubmit(i, v)}
                      onShowHint={() => onShowHint(i)}
                      hintShown={!!hints[i]}
                      result={submitted[i]}
                    />
                  )
                ))}
              </div>
              {onNext || onEnd ? (
                <div className="mt-5 flex flex-wrap justify-start gap-3" data-testid="next-letter-cta">
                  {onNext ? (
                    <Button
                      type="button"
                      onClick={onNext}
                      className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-11 px-5"
                      data-testid="next-letter-btn"
                    >
                      {nextLabel || "Next letter"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : null}
                  {onEnd ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onEnd}
                      className="rounded-full font-display h-11 px-5 border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      data-testid="end-activity-btn"
                    >
                      <Flag className="w-4 h-4 mr-2" /> End activity
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className={isVoicemail ? "lg:col-span-2" : "lg:col-span-3"}>
            {letterhead ? (
              <LetterheadView letterhead={letterhead} />
            ) : (
              <div className="reading-block" data-testid="reading-text">{text}</div>
            )}
          </div>
          <div className={`${isVoicemail ? "lg:col-span-3" : "lg:col-span-2"} lg:sticky lg:top-20`}>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight inline-flex items-center gap-2">
              Questions
              <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            </h2>
            <div className="mt-4 space-y-4" data-testid="reading-questions">
              {questions.map((q, i) => (
                isPhoneMenu ? (
                  <PhoneKeypadCard
                    key={i}
                    qid={i}
                    q={q}
                    value={values[i] || ""}
                    onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                    onSubmit={(v) => onSubmit(i, v)}
                    onReplay={triggerReplay}
                    result={submitted[i]}
                  />
                ) : (
                  <TextAnswerCard
                    key={i}
                    qid={i}
                    q={q}
                    value={values[i] || ""}
                    onChange={(v) => setValues((x) => ({ ...x, [i]: v }))}
                    onSubmit={(v) => onSubmit(i, v)}
                    onShowHint={() => onShowHint(i)}
                    hintShown={!!hints[i]}
                    result={submitted[i]}
                  />
                )
              ))}
            </div>

            {onNext || onEnd ? (
              <div className="mt-5 flex flex-wrap justify-start gap-3" data-testid="next-letter-cta">
                {onNext ? (
                  <Button
                    type="button"
                    onClick={onNext}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-11 px-5"
                    data-testid="next-letter-btn"
                  >
                    {nextLabel || "Next letter"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : null}
                {onEnd ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onEnd}
                    className="rounded-full font-display h-11 px-5 border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    data-testid="end-activity-btn"
                  >
                    <Flag className="w-4 h-4 mr-2" /> End activity
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        )
      ) : null}
    </div>
  );
}

function PhoneKeypadCard({ qid, q, value, onChange, onSubmit, onReplay, result }) {
  const locked = !!result;
  const status = result ? (result.correct ? "correct" : "incorrect") : null;
  const opts = q.options || [];
  const replayKey = q.replay_key ? String(q.replay_key) : null;

  // Match an option string by canonical key (e.g. "Press 1" -> "1", "Stay on the line" -> "stay").
  const canonical = (s) => {
    const t = String(s || "").trim().toLowerCase();
    const m = t.match(/press\s*([0-9*#])/);
    if (m) return m[1];
    if (t.includes("stay")) return "stay";
    if (t.includes("hang")) return "hang";
    return t;
  };
  const optionForKey = (key) => opts.find((o) => canonical(o) === key);
  const correctOpt = opts[q.answer];
  const correctKey = canonical(correctOpt);
  const pickedKey = result ? canonical(result.picked) : null;

  const pressed = (key, label) => {
    if (locked) return;
    // Replay key — restart the audio instead of submitting an answer.
    if (replayKey && key === replayKey) {
      if (onReplay) onReplay();
      return;
    }
    const opt = optionForKey(key) || label;
    onChange(opt);
    onSubmit(opt);
  };

  const KEYS = [
    { k: "1", letters: " " },
    { k: "2", letters: "ABC" },
    { k: "3", letters: "DEF" },
    { k: "4", letters: "GHI" },
    { k: "5", letters: "JKL" },
    { k: "6", letters: "MNO" },
    { k: "7", letters: "PQRS" },
    { k: "8", letters: "TUV" },
    { k: "9", letters: "WXYZ" },
    { k: "*", letters: " " },
    { k: "0", letters: "+" },
    { k: "#", letters: " " },
  ];

  const renderKey = ({ k, letters }) => {
    const isCorrect = locked && k === correctKey;
    const isWrongPick = locked && k === pickedKey && k !== correctKey;
    return (
      <button
        key={k}
        type="button"
        disabled={locked}
        onClick={() => pressed(k, `Press ${k}`)}
        data-testid={`question-${qid}-keypad-${k}`}
        className="rounded-full grid place-items-center transition active:scale-95 hover:bg-zinc-50 disabled:cursor-not-allowed select-none"
        style={{
          aspectRatio: "1 / 1",
          background: isCorrect ? "#DCFCE7" : isWrongPick ? "#FEE2E2" : "#FFFFFF",
          color: isCorrect ? "#065F46" : isWrongPick ? "#9F1239" : "#0F172A",
          border: isCorrect
            ? "2px solid #10B981"
            : isWrongPick
            ? "2px solid #F43F5E"
            : "1px solid #E4E4E7",
          boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 2px 4px rgba(15,23,42,0.04)",
        }}
      >
        <div className="flex flex-col items-center leading-none">
          <span className="font-display font-extrabold" style={{ fontSize: 24 }}>
            {k}
          </span>
          <span className="text-[9px] font-bold tracking-[0.18em] text-zinc-500 mt-0.5 min-h-[10px]">
            {letters.trim() ? letters : "\u00A0"}
          </span>
        </div>
      </button>
    );
  };

  const stayOpt = optionForKey("stay");
  const hangOpt = optionForKey("hang");

  return (
    <div
      className="rounded-3xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(180deg,#FDF2F8 0%,#FFFFFF 60%)",
        border: "1px solid #FBCFE8",
        boxShadow: "0 10px 28px -16px rgba(236,72,153,0.35)",
      }}
      data-testid={`question-${qid}`}
    >
      <div className="text-[11px] uppercase tracking-[0.18em] font-display font-bold text-pink-700">
        Scenario
      </div>
      <div
        className="font-display font-bold text-zinc-900 mt-1 leading-snug"
        style={{ fontSize: 18 }}
        data-testid={`question-${qid}-prompt`}
      >
        {q.q}
      </div>

      <div className="mt-5 mx-auto grid grid-cols-3 gap-2.5" style={{ maxWidth: 280 }}>
        {KEYS.map(renderKey)}
      </div>

      {(stayOpt || hangOpt) && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
          {stayOpt ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => pressed("stay", stayOpt)}
              data-testid={`question-${qid}-keypad-stay`}
              className="flex-1 h-12 rounded-full font-display font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background:
                  locked && pickedKey === "stay"
                    ? correctKey === "stay"
                      ? "#10B981"
                      : "#F43F5E"
                    : correctKey === "stay" && locked
                    ? "#10B981"
                    : "#FFFFFF",
                color:
                  locked && (pickedKey === "stay" || correctKey === "stay") ? "#FFFFFF" : "#065F46",
                border: "1.5px solid #10B981",
              }}
            >
              Stay on the line
            </button>
          ) : null}
          {hangOpt ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => pressed("hang", hangOpt)}
              data-testid={`question-${qid}-keypad-hang`}
              className="flex-1 h-12 rounded-full font-display font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background:
                  locked && pickedKey === "hang"
                    ? correctKey === "hang"
                      ? "#10B981"
                      : "#F43F5E"
                    : "#FFFFFF",
                color: locked && pickedKey === "hang" ? "#FFFFFF" : "#9F1239",
                border: "1.5px solid #F43F5E",
              }}
            >
              Hang up
            </button>
          ) : null}
        </div>
      )}

      {locked ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-display font-semibold">
          {status === "correct" ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Correct — {correctOpt}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-700">
              <XCircle className="w-4 h-4" /> The correct answer was {correctOpt}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function TextAnswerCard({ qid, q, value, onChange, onSubmit, onShowHint, hintShown, result }) {
  const locked = !!result;
  const status = result ? (result.correct ? "correct" : "incorrect") : null;

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const inputStyle = (() => {
    if (status === "correct") return { borderColor: "#10B981", background: "#ECFDF5" };
    if (status === "incorrect") return { borderColor: "#F43F5E", background: "#FFF1F2" };
    return undefined;
  })();

  const canSubmit = !locked && value && value.trim().length > 0;

  return (
    <div className="border border-zinc-200 rounded-2xl p-4 sm:p-5 bg-white" data-testid={`question-${qid}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="shrink-0 inline-grid place-items-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-display font-bold text-sm"
          >
            {qid + 1}
          </span>
          <div
            className="font-display font-semibold text-base sm:text-lg leading-snug pt-1"
            data-testid={`question-${qid}-prompt`}
          >
            {q.q}
          </div>
        </div>
        {!hintShown && !locked ? (
          <button
            type="button"
            onClick={onShowHint}
            data-testid={`question-${qid}-show-hint`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display shrink-0 pt-1.5 group"
          >
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-indigo-600">Hint:</span>
            <span className="font-medium text-zinc-400 group-hover:text-zinc-600 transition">
              show multiple choices
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={locked}
          placeholder="Type your answer and press Enter"
          data-testid={`question-${qid}-input`}
          className="h-12 rounded-xl pr-14"
          style={inputStyle}
        />
        {status ? (
          <span className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
            {status === "correct" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500" />
            )}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => onSubmit(value)}
          disabled={!canSubmit}
          aria-label="Submit answer"
          data-testid={`question-${qid}-submit`}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-grid place-items-center w-9 h-9 rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:bg-indigo-100 disabled:text-indigo-300 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {hintShown ? (
        <div className="mt-3" data-testid={`question-${qid}-hints`}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 font-bold mb-1.5">
            Hint — possible answers
          </div>
          <div className="flex flex-wrap gap-1.5">
            {q.options.map((opt, idx) => {
              const isPicked =
                result && matchesAnswer(opt, result.picked);
              const optStyle = isPicked
                ? status === "correct"
                  ? {
                      borderColor: "#10B981",
                      background: "#ECFDF5",
                      color: "#065F46",
                    }
                  : {
                      borderColor: "#F43F5E",
                      background: "#FFF1F2",
                      color: "#9F1239",
                    }
                : undefined;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    onChange(opt);
                    onSubmit(opt);
                  }}
                  data-testid={`question-${qid}-option-${idx}`}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium border bg-white border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 transition disabled:opacity-100 disabled:cursor-not-allowed"
                  style={optStyle}
                >
                  {isPicked && status === "correct" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : null}
                  {isPicked && status === "incorrect" ? (
                    <XCircle className="w-4 h-4" />
                  ) : null}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {locked && status === "incorrect" ? (
        <div className="mt-2.5 text-xs text-zinc-600">
          Correct answer:{" "}
          <span className="font-semibold text-zinc-900">{q.options[q.answer]}</span>
        </div>
      ) : null}
    </div>
  );
}

function LetterheadView_DEPRECATED() { return null; }


const LEVEL_THEME = {
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

const VOICEMAIL_LEVEL_ICON_ASSETS = {
  green: difficultyLevelGreenIcon,
  amber: difficultyLevelAmberIcon,
  red: difficultyLevelRedIcon,
  pink: difficultyLevelPinkIcon,
};

function LeveledReadingExercise({ activity }) {
  const navigate = useNavigate();
  const smartBack = useSmartBack();
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get("level");
  const letterId = searchParams.get("letter");
  const isDone = searchParams.get("done") === "1";
  const levels = activity.content.levels || {};
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
  const letters = lv ? lv.letters || [] : [];
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

  const categoryName = slugToTitle(activity.category);

  const itemLabelSingular = (lv && lv.item_label_singular) || "Letter";
  const itemLabelPlural = (lv && lv.item_label_plural) || "letters";

  const computeSummary = () => {
    const s = statsRef.current;
    const totalLetters = (lv && lv.letters && lv.letters.length) || 0;
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
  const goActivitiesLibrary = () => navigate("/all-activities");
  const goCategory = () => navigate(`/category/${activity.category}`);
  const goDifficulty = () => setSearchParams({});
  const goLevelOverview = (key) => setSearchParams({ level: key });
  const goLetter1OfLevel = (key) => {
    const lvObj = levels[key];
    const first = lvObj && lvObj.letters && lvObj.letters[0];
    if (first) setSearchParams({ level: key, letter: String(first.id) });
    else setSearchParams({ level: key });
  };

  const hubCrumb = { label: "Hub", onClick: goHub };
  const categoryCrumb = { label: categoryName, onClick: goCategory };
  const activityCrumb = { label: activity.title, onClick: goDifficulty };
  const isVoicemailActivity = activity.slug === "voicemails";
  const rootCrumb = isVoicemailActivity
    ? { label: "Activities Library", onClick: goActivitiesLibrary }
    : hubCrumb;
  const domainCrumb = isVoicemailActivity
    ? { label: "Functional Tasks", onClick: goCategory }
    : categoryCrumb;
  const currentActivityCrumb = isVoicemailActivity
    ? { label: "Listening to Voicemail", onClick: goDifficulty }
    : activityCrumb;
  const levelCrumb = lv ? { label: lv.title, onClick: () => goLevelOverview(lv.key) } : null;

  // Compute breadcrumb crumbs + back behaviour for the current step
  let crumbs;
  let onBack;
  if (!lv) {
    crumbs = isVoicemailActivity
      ? [rootCrumb, domainCrumb, "Listening to Voicemail"]
      : [rootCrumb, domainCrumb, currentActivityCrumb, "Choose difficulty level"];
    onBack = smartBack;
  } else if (isDone) {
    crumbs = [rootCrumb, domainCrumb, currentActivityCrumb, levelCrumb, "Complete"];
    onBack = () => setSearchParams({ level: lv.key });
  } else if (!letter) {
    crumbs = [rootCrumb, domainCrumb, currentActivityCrumb, lv.title];
    onBack = () => setSearchParams({});
  } else {
    crumbs = [rootCrumb, domainCrumb, currentActivityCrumb, levelCrumb, `${itemLabelSingular} ${letter.id}`];
    onBack = () => setSearchParams({ level: lv.key });
  }

  const top = (
    <BreadcrumbHeader
      crumbs={crumbs}
      onBack={onBack}
      className={isVoicemailActivity && !lv ? "voicemail-difficulty-breadcrumb" : ""}
    />
  );

  if (!lv) {
    return (
      <>
        {top}
        <div className={isVoicemailActivity ? "mt-2" : "mt-5"}>
          <DifficultyPicker
            activity={activity}
            onSelect={(k) => setSearchParams({ level: k })}
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
          <CompletionScreen
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

  const theme = LEVEL_THEME[lv.key];
  const innerActivity = {
    ...activity,
    slug: `${activity.slug}-${lv.key}-${letter.id}`,
    title: `${activity.title} — ${lv.title} · ${letter.title || `Letter ${letter.id}`}`,
    content: {
      text: letter.text,
      letterhead: letter.letterhead,
      questions: letter.questions || [],
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
      nextLabel={Number(letter.id) === 10 ? "Finish" : `Next ${itemLabelPlural.replace(/s$/, "")}`}
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
<title>Artiqal — Session Summary</title>
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
    <img class="logo-img" src="/brand/artiqal-logo-v2.png" alt="Artiqal logo" />
    <span class="brand">Artiqal</span>
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
  <div class="foot"><span>Artiqal — functional communication practice</span><span>Generated ${fmtDateTime(summary.endedAt)}</span></div>
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
      <img src="/brand/artiqal-logo-v2.png" width="36" height="36" alt="Artiqal" style="border-radius: 11px; object-fit: contain;" />
      <span class="brand">Artiqal</span>
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

function CompletionScreen({ level, summary, onChangeLevel, onReplay }) {
  const theme = LEVEL_THEME[level.key];
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
          <RefreshCw className="w-4 h-4 mr-2" /> Restart from Letter 1
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

function DifficultyPicker({ activity, onSelect }) {
  const levels = activity.content.levels || {};
  const order = ["green", "amber", "red", "pink"];
  const isVoicemailActivity = activity.slug === "voicemails";
  const activityIllustration = getActivityIllustration(activity);
  const voicemailSummary =
    "Practice functional listening comprehension with realistic voicemail messages. Clients listen to everyday messages, answer targeted questions, and work on key details, recall, sequencing, and inference.";
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
    <div
      className={isVoicemailActivity ? "voicemail-difficulty-picker" : undefined}
      data-testid="difficulty-picker"
    >
      <div
        className={isVoicemailActivity ? "voicemail-difficulty-header" : "mb-5"}
        data-testid="difficulty-section-header"
      >
        {isVoicemailActivity ? (
          <div className="voicemail-difficulty-intro">
            {activityIllustration ? (
              <div className="voicemail-difficulty-illustration" aria-hidden="true">
                <img src={activityIllustration} alt="" loading="eager" />
              </div>
            ) : null}
            <div className="voicemail-difficulty-copy">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                {activity.title}
              </h2>
              <p className="voicemail-difficulty-summary">
                {voicemailSummary}
              </p>
            </div>
          </div>
        ) : (
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {activity.title}
          </h2>
        )}
        <p className="voicemail-difficulty-level-label mt-1.5 text-sm font-display font-semibold text-zinc-600">
          {isVoicemailActivity ? "Select a level" : "Choose difficulty level:"}
        </p>
      </div>

      <div className={`grid ${gridCols} ${isVoicemailActivity ? "voicemail-difficulty-grid" : "gap-4"} items-stretch`}>
        {visibleLevels
          .map((k) => {
            const lv = levels[k];
            const theme = LEVEL_THEME[k];
            const LevelIcon = LEVEL_ICON[k] || Tag;
            const levelIconAsset = isVoicemailActivity ? VOICEMAIL_LEVEL_ICON_ASSETS[k] : null;
            return (
              <div
                key={k}
                className={`diff-card rounded-2xl flex flex-col h-full ${isVoicemailActivity ? "voicemail-difficulty-card" : "p-5"}`}
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
                        className={`difficulty-icon-ring ${levelIconAsset ? "has-image" : ""}`}
                        style={{
                          color: theme.dot,
                          borderColor: theme.pillBorder,
                          "--level-accent": theme.dot,
                          "--level-pill-bg": theme.pillBg,
                        }}
                        aria-hidden="true"
                      >
                        {levelIconAsset ? (
                          <img className="difficulty-icon-image" src={levelIconAsset} alt="" loading="eager" />
                        ) : (
                          <LevelIcon className="difficulty-icon" />
                        )}
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
                    {lv.est_minutes && !isVoicemailActivity ? (
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
                {!isVoicemailActivity ? (
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
                ) : null}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function LetterPicker({ activity, level, onPickLetter, onChangeLevel }) {
  const theme = LEVEL_THEME[level.key];
  const target = level.target_letter_count || (level.letters || []).length || 0;
  const ready = (level.letters || []).length;
  const itemSing = level.item_label_singular || "Letter";
  const itemPlur = level.item_label_plural || "letters";
  const isVoicemailActivity = activity.slug === "voicemails";

  const subtitleText = (() => {
    if (!isVoicemailActivity) {
      return `${level.questions_per_letter} questions per ${itemSing.toLowerCase()}.`;
    }
    const counts = (level.letters || []).map((l) => (l.questions || []).length);
    const min = counts.length ? Math.min(...counts) : level.questions_per_letter;
    const max = counts.length ? Math.max(...counts) : level.questions_per_letter;
    const qLabel = min === max
      ? `${min} ${min === 1 ? "question" : "questions"} each`
      : `${min}–${max} questions each`;
    return `${ready} ${itemPlur} · ${qLabel}`;
  })();

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
          {(level.letters || []).map((l, idx) =>
            isVoicemailActivity ? (
              <VoicemailListCard
                key={l.id}
                level={level}
                item={l}
                index={idx}
                itemSing={itemSing}
                onPick={() => onPickLetter(l.id)}
              />
            ) : (
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
            )
          )}
        </ul>
      )}
    </div>
  );
}

// Per-level, per-index emoji mapping for the voicemail activity
const VOICEMAIL_EMOJI = {
  green: ["🏥", "💊", "🎂", "📦", "✂️", "🎨", "🩸", "🚕", "📚", "📬"],
  amber: ["📅", "💊", "🚐", "🎂", "🐶", "📚", "🏋️", "🦷", "☕", "✂️"],
  red:   ["🎂", "🔐", "🔑", "🐕", "🩺", "💡", "💊", "🔧", "🚑", "💳"],
  pink:  ["🏥", "💊", "🏨", "🏛️", "📦", "🦷", "🍽️", "🔐", "🎬", "✂️"],
};

// Soft pastel backgrounds cycled across the 10 cards
const VOICEMAIL_PASTELS = [
  "#FCE7F3", // pink
  "#DBEAFE", // sky
  "#FEF3C7", // amber
  "#DCFCE7", // mint
  "#E0E7FF", // indigo
  "#FFE4E6", // rose
  "#FEF9C3", // lemon
  "#CFFAFE", // cyan
  "#F3E8FF", // violet
  "#FFEDD5", // peach
];

function VoicemailListCard({ level, item, index, itemSing, onPick }) {
  const emoji = (VOICEMAIL_EMOJI[level.key] || [])[index] || "📞";
  const pastel = VOICEMAIL_PASTELS[index % VOICEMAIL_PASTELS.length];
  const qCount = (item.questions || []).length;

  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        data-testid={`letter-${item.id}`}
        className="group relative w-full text-left rounded-2xl border border-zinc-200/80 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition flex flex-col h-[232px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center text-2xl shrink-0"
            style={{ background: pastel }}
            aria-hidden="true"
          >
            <span>{emoji}</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-zinc-400 mt-1">
            {itemSing} {item.id}
          </div>
        </div>

        <div className="mt-4 min-h-0 flex-1">
          <div className="font-display font-bold text-[17px] leading-snug text-zinc-900 line-clamp-1">
            {item.title}
          </div>
          {item.summary ? (
            <div className="text-[13px] text-zinc-500 mt-1 leading-snug line-clamp-2">
              {item.summary}
            </div>
          ) : null}
        </div>

        <div className="pt-3 flex items-end justify-between">
          <div className="text-xs text-zinc-400 font-medium">
            {qCount} {qCount === 1 ? "question" : "questions"}
          </div>
          <span
            className="inline-grid place-items-center w-7 h-7 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition"
            aria-hidden="true"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>
    </li>
  );
}

function QuestionCard({ q, picked, onPick, qid }) {
  return (
    <div className="border border-zinc-200 rounded-2xl p-5 bg-white">
      <div className="font-display font-semibold text-lg">{q.q}</div>
      <div className="mt-3 grid sm:grid-cols-3 gap-2">
        {q.options.map((opt, idx) => {
          const correct = picked != null && idx === q.answer;
          const wrong = picked != null && picked === idx && idx !== q.answer;
          const chosen = picked === idx;
          return (
            <button
              key={idx}
              data-testid={`question-${qid}-option-${idx}`}
              onClick={() => onPick(idx)}
              className="text-left h-12 px-4 rounded-xl border transition font-medium"
              style={{
                borderColor: correct ? "#10B981" : wrong ? "#F43F5E" : chosen ? "#4F46E5" : "#E5E7EB",
                background: correct ? "#ECFDF5" : wrong ? "#FFF1F2" : chosen ? "#EEF2FF" : "white",
                color: correct ? "#065F46" : wrong ? "#9F1239" : "#0A0A0A",
              }}
            >
              {opt} {correct ? <CheckCircle2 className="inline w-4 h-4 ml-1" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AIReadingExercise({ activity }) {
  const [scenarioType, setScenarioType] = useState(activity.content.options[0].key);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/generate-scenario", { scenario_type: scenarioType });
      setText(data.text || "");
    } catch {
      setText("Could not generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" data-testid="ai-scenario-types">
        {activity.content.options.map((o) => (
          <button
            key={o.key}
            onClick={() => setScenarioType(o.key)}
            data-testid={`ai-scenario-type-${o.key}`}
            className="px-4 h-11 rounded-full text-sm font-display font-semibold border"
            style={
              scenarioType === o.key
                ? { background: "#4F46E5", color: "white", borderColor: "#4F46E5" }
                : { background: "white", color: "#0A0A0A", borderColor: "#E5E7EB" }
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <Button
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-12 px-5"
          data-testid="ai-generate-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate
        </Button>
        {text ? (
          <Button
            variant="outline"
            onClick={generate}
            disabled={loading}
            className="rounded-full font-display h-12 px-5"
            data-testid="ai-regenerate-btn"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> New one
          </Button>
        ) : null}
      </div>

      {text ? (
        <div className="reading-block mt-6" data-testid="ai-scenario-text">{text}</div>
      ) : null}
    </div>
  );
}

function WritingExercise({ activity }) {
  const c = activity.content;
  if (c.fields) {
    return (
      <div className="space-y-4" data-testid="writing-form">
        {c.fields.map((f, i) => (
          <div key={i}>
            <label className="font-display font-semibold">{f.label}</label>
            <Input className="h-12 rounded-xl mt-1" data-testid={`writing-field-${i}`} />
          </div>
        ))}
        <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-12 px-5">
          Save practice
        </Button>
      </div>
    );
  }
  if (c.items) {
    return (
      <div className="space-y-5" data-testid="writing-items">
        {c.items.map((p, i) => (
          <div key={i} className="border border-zinc-200 rounded-2xl p-5 bg-white">
            <div className="font-display font-semibold text-lg">{p}</div>
            <Textarea className="mt-3 rounded-xl" rows={3} data-testid={`writing-input-${i}`} />
          </div>
        ))}
      </div>
    );
  }
  // single prompt
  return (
    <div data-testid="writing-prompt">
      <div className="reading-block">{c.prompt}</div>
      <Textarea
        className="mt-4 rounded-xl"
        rows={6}
        defaultValue={c.starter || ""}
        data-testid="writing-input-0"
      />
      <div className="mt-4">
        <AudioControls text={c.prompt} />
      </div>
    </div>
  );
}

function NamingExercise({ activity }) {
  const items = activity.content.items;
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [transcript, setTranscript] = useState("");
  const it = items[idx];
  const { logCue } = useSession();

  const next = () => {
    setShowAnswer(false);
    setTranscript("");
    setIdx((idx + 1) % items.length);
  };

  const reveal = () => {
    setShowAnswer((v) => {
      const nv = !v;
      if (nv) {
        logCue({
          activity_slug: activity.slug,
          activity_title: activity.title,
          category: activity.category,
          cue_type: "show_answer",
          detail: it.answer,
        });
      }
      return nv;
    });
  };

  return (
    <div data-testid="naming-exercise">
      <div className="text-sm text-zinc-500">
        {idx + 1} of {items.length}
      </div>
      <div className="reading-block mt-3 text-2xl font-display font-bold">{it.clue}</div>
      <div className="mt-5">
        <AudioControls
          text={it.clue}
          audioSrc={idx === 0 ? "/audio/G01_GP_Appointment_Reminder.mp3" : undefined}
          onTranscript={(t) => setTranscript(t)}
        />
      </div>

      {transcript ? (
        <div className="mt-4 text-sm text-zinc-600" data-testid="naming-transcript">
          You said: <strong>{transcript}</strong>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="rounded-full font-display h-12 px-5"
          onClick={reveal}
          data-testid="naming-reveal-btn"
        >
          {showAnswer ? "Hide answer" : "Show answer"}
        </Button>
        <Button
          onClick={next}
          className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-display h-12 px-5"
          data-testid="naming-next-btn"
        >
          Next
        </Button>
      </div>

      {showAnswer ? (
        <div className="mt-4 inline-flex items-center px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 font-display font-semibold">
          Answer: {it.answer}
        </div>
      ) : null}
    </div>
  );
}

function ListExercise({ activity }) {
  return (
    <ul className="space-y-3" data-testid="list-exercise">
      {activity.content.categories.map((c, i) => (
        <li key={i} className="border border-zinc-200 rounded-2xl p-5 bg-white flex items-center justify-between">
          <span className="font-display font-semibold text-lg">{c}</span>
          <AudioControls text={`Name three things. ${c}`} />
        </li>
      ))}
    </ul>
  );
}

function MCQExercise({ activity }) {
  const [answers, setAnswers] = useState({});
  const { logAttempt } = useSession();
  const onPick = (i, idx) => {
    if (answers[i] != null) return;
    setAnswers({ ...answers, [i]: idx });
    const q = activity.content.items[i];
    logAttempt({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      qid: `q${i}`,
      correct: idx === q.answer,
      picked: q.options[idx],
      expected: q.options[q.answer],
    });
  };
  return (
    <div className="space-y-5" data-testid="mcq-exercise">
      {activity.content.items.map((q, i) => (
        <div key={i}>
          <div className="flex gap-3 items-center">
            <AudioControls text={q.q} />
          </div>
          <QuestionCard
            q={q}
            picked={answers[i]}
            onPick={(idx) => onPick(i, idx)}
            qid={i}
          />
        </div>
      ))}
    </div>
  );
}

function YesNoExercise({ activity }) {
  const [answers, setAnswers] = useState({});
  const { logAttempt } = useSession();
  const onPick = (i, idx) => {
    if (answers[i] != null) return;
    setAnswers({ ...answers, [i]: idx });
    const q = activity.content.items[i];
    const isYes = idx === 0;
    logAttempt({
      activity_slug: activity.slug,
      activity_title: activity.title,
      category: activity.category,
      qid: `q${i}`,
      correct: isYes === q.answer,
      picked: isYes ? "Yes" : "No",
      expected: q.answer ? "Yes" : "No",
    });
  };
  return (
    <div className="space-y-5" data-testid="yesno-exercise">
      {activity.content.items.map((q, i) => (
        <div key={i} className="border border-zinc-200 rounded-2xl p-5 bg-white">
          <div className="font-display font-semibold text-lg">{q.q}</div>
          <div className="mt-4 flex gap-3">
            <AudioControls text={q.q} />
          </div>
          <div className="mt-3 flex gap-2">
            {["Yes", "No"].map((label, idx) => {
              const isYes = idx === 0;
              const correct = answers[i] != null && (isYes === q.answer);
              const wrong = answers[i] === idx && !correct;
              const chosen = answers[i] === idx;
              return (
                <button
                  key={idx}
                  data-testid={`yesno-${i}-${label.toLowerCase()}`}
                  onClick={() => onPick(i, idx)}
                  className="h-12 px-6 rounded-full font-display font-semibold border transition"
                  style={{
                    borderColor: correct ? "#10B981" : wrong ? "#F43F5E" : chosen ? "#4F46E5" : "#E5E7EB",
                    background: correct ? "#ECFDF5" : wrong ? "#FFF1F2" : chosen ? "#EEF2FF" : "white",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DialogueExercise({ activity }) {
  const c = activity.content;
  return (
    <div data-testid="dialogue-exercise">
      <div className="reading-block">
        <div className="font-display font-semibold mb-2">Scene</div>
        {c.scene}
      </div>
      <ul className="mt-6 space-y-3">
        {c.lines.map((line, i) => {
          const isYou = line.speaker === "You";
          return (
            <li
              key={i}
              className="rounded-2xl p-4 border"
              style={{
                background: isYou ? "#EEF2FF" : "white",
                borderColor: isYou ? "#C7D2FE" : "#E5E7EB",
              }}
              data-testid={`dialogue-line-${i}`}
            >
              <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{line.speaker}</div>
              <div className="font-display text-lg mt-1">{line.text}</div>
              <div className="mt-3">
                <AudioControls text={line.text} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
