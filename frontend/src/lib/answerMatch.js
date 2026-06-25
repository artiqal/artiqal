// Flexible answer matching for short reading-comprehension questions.
// Aims to be FORGIVING: accepts case differences, punctuation, common time/date
// formats, names with or without titles, and small typos (1 char).
// Only marks an answer wrong when it is genuinely different — not just formatted differently.

const NUM_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
};

const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const TITLES = ["dr", "doctor", "mr", "mrs", "ms", "miss", "prof", "professor", "sir", "madam"];

export function deepNorm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[!?,;:'"`*()_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTitles(s) {
  let out = " " + s + " ";
  for (const t of TITLES) {
    out = out.replace(new RegExp(`\\s${t}\\.?\\s`, "g"), " ");
  }
  return out.replace(/\s+/g, " ").trim();
}

function normalizeName(s) {
  return stripTitles(deepNorm(s));
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array(b.length + 1)
    .fill(0)
    .map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

/* ---------------- Time ---------------- */
// Returns { minutes, ampm } where minutes ∈ [0, 1440) and ampm ∈ {'am','pm',null}.
function parseTime(s) {
  const t0 = (s || "").toLowerCase().trim()
    .replace(/[!?,;:'"`]/g, "")
    .replace(/\./g, ":")
    .replace(/\s+/g, " ")
    .trim();
  const t = t0.replace(/\bo\s?clock\b/g, "oclock").replace(/\bo'?clock\b/g, "oclock");

  // 1) "10:30", "10:30 am", "10:30am", "1030", "1030am"
  let m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m|p\.m)?$/);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const ap = m[3] ? m[3][0] + "m" : null; // 'am'|'pm'|null
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    if (h <= 23 && min <= 59) return { minutes: h * 60 + min, ampm: ap };
  }
  m = t.match(/^(\d{3,4})\s*(am|pm)?$/);
  if (m) {
    const num = m[1];
    const h = parseInt(num.slice(0, num.length - 2), 10);
    const min = parseInt(num.slice(-2), 10);
    let hh = h;
    const ap = m[2] || null;
    if (ap === "pm" && hh < 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
    if (hh <= 23 && min <= 59) return { minutes: hh * 60 + min, ampm: ap };
  }

  // 2) Word-based forms
  // "ten thirty", "ten thirty am"
  let mm = t.match(/^([a-z]+)\s+([a-z]+)(?:\s+(am|pm))?$/);
  if (mm && NUM_WORDS[mm[1]] != null && NUM_WORDS[mm[2]] != null) {
    let hh = NUM_WORDS[mm[1]];
    const min = NUM_WORDS[mm[2]];
    const ap = mm[3] || null;
    if (ap === "pm" && hh < 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
    if (hh <= 23 && min <= 59) return { minutes: hh * 60 + min, ampm: ap };
  }

  // "half past ten", "quarter past ten", "quarter to ten"
  mm = t.match(/^(half|quarter)\s+(past|to)\s+([a-z]+)(?:\s+(am|pm))?$/);
  if (mm) {
    const hWord = mm[3];
    const baseHour = NUM_WORDS[hWord];
    if (baseHour != null) {
      const offset = mm[1] === "half" ? 30 : 15;
      let hh = baseHour;
      let min;
      if (mm[2] === "past") {
        min = offset;
      } else {
        // "to" → previous hour + (60-offset)
        hh = baseHour - 1;
        min = 60 - offset;
      }
      if (hh < 0) hh = 23;
      const ap = mm[4] || null;
      if (ap === "pm" && hh < 12) hh += 12;
      if (ap === "am" && hh === 12) hh = 0;
      if (hh <= 23 && min <= 59) return { minutes: hh * 60 + min, ampm: ap };
    }
  }

  // "ten oclock"
  mm = t.match(/^([a-z]+)\s*oclock(?:\s+(am|pm))?$/);
  if (mm && NUM_WORDS[mm[1]] != null) {
    let hh = NUM_WORDS[mm[1]];
    const ap = mm[2] || null;
    if (ap === "pm" && hh < 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
    return { minutes: hh * 60, ampm: ap };
  }

  return null;
}

function timesEqual(a, b) {
  if (!a || !b) return false;
  if (a.minutes === b.minutes) return true;
  // If either side is missing AM/PM, accept ambiguity (10:30 = 10:30 AM = 10:30 PM)
  if (!a.ampm || !b.ampm) {
    return a.minutes % 720 === b.minutes % 720;
  }
  return false;
}

/* ---------------- Date ---------------- */
// Returns { day, month } where month may be null when the input is just a day.
function parseDate(s) {
  let t = (s || "")
    .toLowerCase()
    .replace(/[!?,;:'"`]/g, "")
    .replace(/\bof\b|\bon\b|\bthe\b/g, "")
    .replace(/(\d+)(st|nd|rd|th)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  // "15 may", "15 may 2026"
  let m = t.match(/^(\d{1,2})\s+([a-z]+)(?:\s+\d{2,4})?$/);
  if (m && MONTHS[m[2]]) return { day: parseInt(m[1], 10), month: MONTHS[m[2]] };

  // "may 15"
  m = t.match(/^([a-z]+)\s+(\d{1,2})(?:\s+\d{2,4})?$/);
  if (m && MONTHS[m[1]]) return { day: parseInt(m[2], 10), month: MONTHS[m[1]] };

  // "15/05", "15-05", "15.05" (with optional year)
  m = t.match(/^(\d{1,2})[/\-.](\d{1,2})(?:[/\-.]\d{2,4})?$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) return { day, month };
  }

  // Just a day "15"
  m = t.match(/^(\d{1,2})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    if (day >= 1 && day <= 31) return { day, month: null };
  }

  return null;
}

function datesEqual(a, b) {
  if (!a || !b) return false;
  if (a.day !== b.day) return false;
  if (a.month && b.month && a.month !== b.month) return false;
  return true;
}

/* ---------------- Semantic content-token matching ---------------- */
// Words that don't carry meaning on their own — articles, copulas, intensifiers,
// generic descriptors that vary between paraphrases of the same idea.
const FILLERS = new Set([
  "a","an","the","of","in","on","at","to","for","with","by","and","or","but",
  "as","is","are","was","were","be","been","being","am",
  "has","have","had","do","does","did","done",
  "will","would","can","could","may","might","must","shall","should",
  "this","that","these","those","there","here","then","than",
  "i","you","he","she","it","we","they","me","my","your","his","her","its","our","their",
  "into","from","up","down","off","out","over","under","through",
  "no","not","nor","so","very","just","also","too","quite","really",
  "any","some","more","most","much","many","all","every","each","several","few",
  "new","worsening","severe","mild","slight","sudden","extra","please",
  "if","when","while","because","since","until","whether","unless",
  "yourself","yours","ours","theirs","myself","ourselves",
  "such","like","etc","including","other","others",
  "about","approximately","around","roughly","nearly","almost",
  "before","after","ahead","prior","next","previous",
  "really","actually","essentially","basically","simply","mostly",
  "feel","feels","felt","feeling",
]);

const NUM_WORD_TO_DIGIT = {
  zero:"0", one:"1", two:"2", three:"3", four:"4", five:"5", six:"6", seven:"7",
  eight:"8", nine:"9", ten:"10", eleven:"11", twelve:"12", thirteen:"13",
  fourteen:"14", fifteen:"15", sixteen:"16", seventeen:"17", eighteen:"18",
  nineteen:"19", twenty:"20", thirty:"30", forty:"40", fifty:"50",
  sixty:"60", seventy:"70", eighty:"80", ninety:"90", hundred:"100",
};

// Map common variants to a canonical token so paraphrases align.
const SYNONYMS = {
  ache:"pain", aches:"pain",
  pains:"pain",
  doctor:"dr", physician:"dr",
  consultation:"appointment", consultations:"appointment",
  visit:"appointment", appointments:"appointment",
  medicine:"medication", medicines:"medication",
  meds:"medication", prescription:"medication", prescriptions:"medication",
  prescribed:"medication",
  symptom:"symptom", symptoms:"symptom",
  weakness:"weak", weaker:"weak",
  numbness:"numb", numbing:"numb",
  swelling:"swell", swollen:"swell", swells:"swell",
  bleeding:"bleed", bled:"bleed", bleeds:"bleed",
  bruising:"bruise", bruises:"bruise", bruised:"bruise",
  begin:"start", begins:"start", began:"start", begun:"start", started:"start", starts:"start", beginning:"start",
  attend:"attend", attending:"attend", attended:"attend",
  arrive:"arrive", arriving:"arrive", arrived:"arrive", arrives:"arrive",
  contact:"contact", contacted:"contact", contacting:"contact",
  contact:"call", contacted:"call", contacting:"call", contacts:"call",
  reach:"call", reaches:"call", reached:"call", reaching:"call",
  ring:"call", rang:"call", rung:"call",
  telephone:"call", phoning:"call", phone:"call", calling:"call", called:"call", calls:"call",
  okay:"yes", ok:"yes",
  cant:"cannot", "can't":"cannot",
  wont:"will", "won't":"will",
  bp:"bloodpressure", "blood-pressure":"bloodpressure",
  ecg:"ecg", ekg:"ecg",
  receptionist:"reception",
  receptions:"reception",
  practitioner:"dr",
  nurse:"nurse", nurses:"nurse",
};

// Light singularizer for plurals not covered by the synonyms map.
function singularize(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is") && !w.endsWith("as")) {
    return w.slice(0, -1);
  }
  return w;
}

function canonToken(t) {
  let x = t.toLowerCase();
  if (NUM_WORD_TO_DIGIT[x] != null) x = NUM_WORD_TO_DIGIT[x];
  if (SYNONYMS[x] != null) return SYNONYMS[x];
  const sing = singularize(x);
  if (SYNONYMS[sing] != null) return SYNONYMS[sing];
  return sing;
}

function contentTokens(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[!?,;:'"`*()_./\\\u2013\u2014]/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .filter((t) => !FILLERS.has(t))
    .map(canonToken)
    .filter((t) => t && !FILLERS.has(t) && (t.length >= 2 || /^\d+$/.test(t)));
}

function tokenInSet(token, set) {
  if (set.has(token)) return true;
  // 1-edit fuzzy match for tokens long enough to be meaningful (typos, basic plural variants).
  if (token.length >= 5) {
    for (const x of set) {
      if (x.length >= 5 && Math.abs(token.length - x.length) <= 1 && levenshtein(token, x) <= 1) {
        return true;
      }
    }
  }
  return false;
}

function semanticMatches(typed, expected) {
  const userTokens = contentTokens(typed);
  const expTokens = contentTokens(expected);
  if (!userTokens.length || !expTokens.length) return false;

  const userSet = new Set(userTokens);
  const expSet = new Set(expTokens);

  // Require either ≥ 2 tokens, or a single token ≥ 4 chars (strong content word).
  const distinctive =
    userTokens.length >= 2 ||
    (userTokens.length === 1 && userTokens[0].length >= 4);
  if (!distinctive) return false;

  // Direction A: every user token appears in expected (partial answer captures
  // a slice of the expected — e.g. "back pain, numbness" ⊂ "new worsening back
  // pain and numbness or tingling in the legs").
  let allUserInExp = true;
  for (const t of userTokens) {
    if (!tokenInSet(t, expSet)) { allUserInExp = false; break; }
  }
  if (allUserInExp) return true;

  // Direction B: every expected token appears in user (verbose user answer
  // adds extra descriptive words — e.g. "arrive ten minutes early" ⊃ "10
  // minutes early"). Requires the expected to have at least 2 distinctive
  // tokens, otherwise this becomes too loose.
  if (expTokens.length >= 2) {
    let allExpInUser = true;
    for (const t of expTokens) {
      if (!tokenInSet(t, userSet)) { allExpInUser = false; break; }
    }
    if (allExpInUser) return true;
  }

  return false;
}

/* ---------------- Public matcher ---------------- */

export function matchesAnswer(typed, expected) {
  if (!typed || !expected) return false;

  const a = deepNorm(typed);
  const b = deepNorm(expected);
  if (a === b) return true;

  // Time — if BOTH look like times, decide on time equality alone.
  const tA = parseTime(typed);
  const tB = parseTime(expected);
  if (tA && tB) return timesEqual(tA, tB);

  // Date — if BOTH look like dates, decide on date equality alone.
  const dA = parseDate(typed);
  const dB = parseDate(expected);
  if (dA && dB) return datesEqual(dA, dB);

  // Name (titles stripped)
  const nA = normalizeName(typed);
  const nB = normalizeName(expected);
  if (nA && nB && nA === nB) return true;

  // Substring tolerance for purely alphabetic answers (e.g. "Bennett" ↔ "Dr Bennett").
  // Skip when the shorter side is a stopword/filler — "the" should not match "the appointment".
  const alphaOnly = (s) => /^[a-z\s]+$/.test(s);
  const shorter = nA.length <= nB.length ? nA : nB;
  if (
    nA &&
    nB &&
    nA.length >= 3 &&
    nB.length >= 3 &&
    alphaOnly(nA) &&
    alphaOnly(nB) &&
    shorter.length >= 4 &&
    !FILLERS.has(shorter)
  ) {
    if (nA.includes(nB) || nB.includes(nA)) return true;
  }

  // Typo tolerance: 1-edit distance for strings of meaningful length
  if (a.length >= 4 && b.length >= 4 && levenshtein(a, b) <= 1) return true;
  if (
    nA &&
    nB &&
    nA.length >= 4 &&
    nB.length >= 4 &&
    levenshtein(nA, nB) <= 1
  )
    return true;

  // Semantic content-token match — accepts partial answers that capture the
  // core meaning, ignoring filler words, accepting items in any order, with
  // singular/plural and number-word ↔ digit normalisation.
  if (semanticMatches(typed, expected)) return true;

  return false;
}
