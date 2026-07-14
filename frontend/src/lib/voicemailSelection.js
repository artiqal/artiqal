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
  return availableItems.slice(0, itemCount);
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
  return questions.slice(
    0,
    getClampedVoicemailQuestionCount(item, requestedCount),
  );
}
