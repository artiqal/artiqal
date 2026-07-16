import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSmartBack } from "@/lib/navigationHistory";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronDown,
  Flag,
  Gamepad2,
  Globe,
  Keyboard,
  MapPin,
  Maximize2,
  MessageCircle,
  Plus,
  Puzzle,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Tag,
} from "lucide-react";

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

export function CrosswordActivity({ activity, category, BreadcrumbHeader, formatSlugTitle }) {
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
            formatSlugTitle={formatSlugTitle}
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
  formatSlugTitle,
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
          <PictureClueSection
            title="Across (Picture Clues)"
            clues={crossword.clues.across}
            formatSlugTitle={formatSlugTitle}
          />
          <PictureClueSection
            title="Down (Picture Clues)"
            clues={crossword.clues.down}
            formatSlugTitle={formatSlugTitle}
          />
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

function PictureClueSection({ title, clues, formatSlugTitle }) {
  return (
    <div className="crossword-picture-section">
      <h2>{title}</h2>
      <div className="crossword-picture-grid">
        {clues.map((clue) => (
          <article
            key={`${clue.direction}-${clue.number}-${clue.answer}`}
            className="crossword-picture-card"
            aria-label={`${clue.number}. ${formatSlugTitle(clue.answer.toLowerCase())}`}
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
