const QUESTION_TYPES = ["safety", "conditional", "action", "inference", "recall"];
const HIGH_VALUE_QUESTION_TYPES = ["safety", "conditional", "action", "inference"];
const LEGACY_SELECTION_SEED = "voicemail-legacy-v1";

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value || "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(value) {
  let state = stableHash(value) || 0x6d2b79f5;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function getDeterministicOrder(values, seed) {
  const ordered = [...values];
  const random = createSeededRandom(seed);
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];
  }
  return ordered;
}

function getStableItemId(item, index) {
  return item?.id === undefined || item?.id === null
    ? `index-${index}`
    : String(item.id);
}

function getDeterministicItemOrder(items, level, selection) {
  const selectionKey = [
    "voicemail",
    selection.selectionSeed || LEGACY_SELECTION_SEED,
    selection.difficultyId || level?.key || "level",
    selection.themePackId || "mixed-bag",
    selection.languageId || "en",
  ].join("|");

  return getDeterministicOrder(items, selectionKey);
}

function classifyQuestion(question) {
  const prompt = String(question?.q || "").trim().toLowerCase().replace(/\s+/g, " ");

  if (
    /\b(emergency|urgent|severe|symptoms?|safe|safety|allerg(?:y|ies|ic))\b/.test(prompt)
    || /\b(?:call|contact) (?:111|999|the (?:doctor|clinic|surgery))\b/.test(prompt)
  ) {
    return "safety";
  }
  if (
    /\b(if|unless|otherwise)\b/.test(prompt)
    || /\bwhat (?:will|would|might|can|could) happen\b/.test(prompt)
  ) {
    return "conditional";
  }
  if (
    prompt.startsWith("why ")
    || /\b(?:reason|suggest|likely|probably|infer)\b/.test(prompt)
  ) {
    return "inference";
  }
  if (
    /\b(should|must|avoid|next|options?)\b/.test(prompt)
    || /\bneed(?:s)? to\b/.test(prompt)
    || /\bwhat (?:will|would|might|can)\b/.test(prompt)
  ) {
    return "action";
  }
  return "recall";
}

function getQuestionTypeOrder(item, selectionSeed, buckets) {
  const seedKey = [
    "voicemail-question-types",
    selectionSeed || LEGACY_SELECTION_SEED,
    item?.id || "item",
    item?.title || "",
  ].join("|");
  const highValueTypes = getDeterministicOrder(
    HIGH_VALUE_QUESTION_TYPES.filter((type) => buckets[type].length),
    seedKey,
  );

  if (!highValueTypes.length) return ["recall"];
  return [highValueTypes[0], "recall", ...highValueTypes.slice(1)];
}

function getBalancedQuestionEntries(item, requestedCount, selectionSeed) {
  const questions = Array.isArray(item?.questions) ? item.questions : [];
  const count = Math.min(requestedCount, questions.length);
  const buckets = Object.fromEntries(QUESTION_TYPES.map((type) => [type, []]));

  questions.forEach((question, index) => {
    buckets[classifyQuestion(question)].push({ question, index });
  });
  for (const type of QUESTION_TYPES) {
    buckets[type] = getDeterministicOrder(
      buckets[type],
      `voicemail-question-bucket|${selectionSeed || LEGACY_SELECTION_SEED}|${
        item?.id || "item"
      }|${type}`,
    );
  }

  const selected = [];
  const typeOrder = getQuestionTypeOrder(item, selectionSeed, buckets);
  while (selected.length < count) {
    let foundQuestion = false;
    for (const type of typeOrder) {
      const entry = buckets[type].shift();
      if (!entry) continue;
      selected.push(entry);
      foundQuestion = true;
      if (selected.length === count) break;
    }
    if (!foundQuestion) break;
  }

  return selected.sort((left, right) => left.index - right.index);
}

function reorderQuestionOptions(item, entry, selectionSeed) {
  const { question, index } = entry;
  const options = Array.isArray(question?.options) ? question.options : [];
  const answerIndex = Number(question?.answer);
  if (
    options.length < 2
    || !Number.isInteger(answerIndex)
    || answerIndex < 0
    || answerIndex >= options.length
  ) {
    return question;
  }

  const correctAnswer = options[answerIndex];
  const remainingOptions = options.filter((_option, optionIndex) => optionIndex !== answerIndex);
  const desiredAnswerIndex = stableHash(
    `${selectionSeed || LEGACY_SELECTION_SEED}|${item?.id || "item"}|${index}|${
      question.q || "question"
    }`,
  ) % options.length;
  const reorderedOptions = [...remainingOptions];
  reorderedOptions.splice(desiredAnswerIndex, 0, correctAnswer);

  return {
    ...question,
    options: reorderedOptions,
    answer: desiredAnswerIndex,
  };
}

export function getAvailableVoicemailItems(
  level,
  themePackId,
  languageId = "en",
  interactionMode = "single",
) {
  if (!level || themePackId !== "mixed-bag") return [];

  const requestedInteractionMode = interactionMode === "multiple" ? "multiple" : "single";
  const seenIds = new Set();
  return (level.letters || []).filter((item) => {
    if ((item.languageId || "en") !== languageId) return false;
    if (level.key === "pink") {
      const itemInteractionMode = item.interactionMode === "multiple" ? "multiple" : "single";
      if (itemInteractionMode !== requestedInteractionMode) return false;
    }
    if (item.id === undefined || item.id === null) return true;

    const stableId = String(item.id);
    if (seenIds.has(stableId)) return false;
    seenIds.add(stableId);
    return true;
  });
}

export function getClampedVoicemailItemCount(requestedCount, availableCount) {
  const numericCount = Number(requestedCount);
  const safeAvailableCount = Math.max(0, Number(availableCount) || 0);
  if (!Number.isFinite(numericCount) || numericCount <= 0) {
    return safeAvailableCount;
  }
  return Math.min(Math.floor(numericCount), safeAvailableCount);
}

export function selectVoicemailItems(level, selection) {
  const availableItems = getAvailableVoicemailItems(
    level,
    selection.themePackId,
    selection.languageId,
    selection.interactionMode,
  );
  const itemCount = getClampedVoicemailItemCount(
    selection.itemCount,
    availableItems.length,
  );
  const deterministicItems = getDeterministicItemOrder(availableItems, level, selection);
  const requestedIds = Array.isArray(selection.itemIds)
    ? selection.itemIds.map(String)
    : [];
  if (!requestedIds.length) return deterministicItems.slice(0, itemCount);

  const itemById = new Map(
    availableItems.map((item, index) => [getStableItemId(item, index), item]),
  );
  const idByItem = new Map(
    availableItems.map((item, index) => [item, getStableItemId(item, index)]),
  );
  const selected = [];
  const seenIds = new Set();
  for (const requestedId of requestedIds) {
    const item = itemById.get(requestedId);
    if (!item || seenIds.has(requestedId)) continue;
    selected.push(item);
    seenIds.add(requestedId);
    if (selected.length === itemCount) return selected;
  }
  for (const item of deterministicItems) {
    const itemId = idByItem.get(item);
    if (seenIds.has(itemId)) continue;
    selected.push(item);
    seenIds.add(itemId);
    if (selected.length === itemCount) break;
  }
  return selected;
}

export function getRequestedVoicemailQuestionCount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.floor(numericValue)
    : null;
}

export function getClampedVoicemailQuestionCount(item, requestedCount) {
  const availableCount = Array.isArray(item?.questions)
    ? item.questions.length
    : 0;
  const numericCount = getRequestedVoicemailQuestionCount(requestedCount);
  return numericCount === null
    ? availableCount
    : Math.min(numericCount, availableCount);
}

export function selectVoicemailQuestions(item, requestedCount, selectionSeed) {
  const questions = Array.isArray(item?.questions) ? item.questions : [];
  const count = getClampedVoicemailQuestionCount(item, requestedCount);
  if (item?.letterhead?.format === "phone-menu") {
    return questions.slice(0, count);
  }

  return getBalancedQuestionEntries(item, count, selectionSeed)
    .map((entry) => reorderQuestionOptions(item, entry, selectionSeed));
}
