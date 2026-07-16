const QUESTION_TYPES = ["action", "purpose", "identity", "time", "place", "detail"];

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value || "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getStableItemId(item, index) {
  return item?.id === undefined || item?.id === null
    ? `index-${index}`
    : String(item.id);
}

function getDeterministicItemOrder(items, level, selection) {
  const selectionKey = [
    "voicemail",
    selection.difficultyId || level?.key || "level",
    selection.themePackId || "mixed-bag",
    selection.languageId || "en",
  ].join("|");

  return items
    .map((item, index) => ({
      item,
      index,
      rank: stableHash(`${selectionKey}|${getStableItemId(item, index)}`),
    }))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map(({ item }) => item);
}

function classifyQuestion(question) {
  const prompt = String(question?.q || "").trim().toLowerCase().replace(/\s+/g, " ");

  if (
    /\b(if|should|must|avoid|next|options?)\b/.test(prompt)
    || /\bneed(?:s)? to\b/.test(prompt)
    || /\bwhat (?:will|would|might|can)\b/.test(prompt)
  ) {
    return "action";
  }
  if (/\b(about|purpose|reason|why)\b/.test(prompt)) return "purpose";
  if (prompt.startsWith("who ")) return "identity";
  if (prompt.startsWith("where ")) return "place";
  if (
    prompt.startsWith("when ")
    || /\bwhat (?:day|time|date)\b/.test(prompt)
    || /\bhow long\b/.test(prompt)
  ) {
    return "time";
  }
  return "detail";
}

function getQuestionTypeOrder(item) {
  const rotatingTypes = ["identity", "time", "place", "detail"];
  const offset = stableHash(
    `voicemail-question-types|${item?.id || "item"}|${item?.title || ""}`,
  ) % rotatingTypes.length;

  return [
    "action",
    "purpose",
    ...rotatingTypes.slice(offset),
    ...rotatingTypes.slice(0, offset),
  ];
}

function getBalancedQuestionEntries(item, requestedCount) {
  const questions = Array.isArray(item?.questions) ? item.questions : [];
  const count = Math.min(requestedCount, questions.length);
  const buckets = Object.fromEntries(QUESTION_TYPES.map((type) => [type, []]));

  questions.forEach((question, index) => {
    buckets[classifyQuestion(question)].push({ question, index });
  });
  // Later action questions contain the conditional and safety prompts in the
  // current content, so draw from the end of that bucket first.
  buckets.action.reverse();

  const selected = [];
  const typeOrder = getQuestionTypeOrder(item);
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

function reorderQuestionOptions(item, entry) {
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
    `${item?.id || "item"}|${index}|${question.q || "question"}`,
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
) {
  if (!level || themePackId !== "mixed-bag") return [];

  const seenIds = new Set();
  return (level.letters || []).filter((item) => {
    if ((item.languageId || "en") !== languageId) return false;
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

export function selectVoicemailQuestions(item, requestedCount) {
  const questions = Array.isArray(item?.questions) ? item.questions : [];
  const count = getClampedVoicemailQuestionCount(item, requestedCount);
  if (item?.letterhead?.format === "phone-menu") {
    return questions.slice(0, count);
  }

  return getBalancedQuestionEntries(item, count)
    .map((entry) => reorderQuestionOptions(item, entry));
}
