import { getValidSetupItemCount } from "./activitySetupConfig";

const LEGACY_SELECTION_SEED = "voicemail-legacy-v1";
const PHONE_MENU_DIFFICULTY_ID = "pink";
const DEFAULT_INTERACTION_MODE = "single";
export const VOICEMAIL_INTERACTION_MODES = Object.freeze(["single", "multiple"]);
let fallbackSeedSequence = 0;

export function isVoicemailPhoneMenuMode(difficultyId) {
  return difficultyId === PHONE_MENU_DIFFICULTY_ID;
}

export function hasConfigurableVoicemailQuestions(difficultyId) {
  return !isVoicemailPhoneMenuMode(difficultyId);
}

export function normalizeVoicemailInteractionMode(value) {
  return VOICEMAIL_INTERACTION_MODES.includes(value) ? value : DEFAULT_INTERACTION_MODE;
}

export function normalizeVoicemailSelectionSeed(value) {
  const normalized = String(value || "").trim();
  return normalized || LEGACY_SELECTION_SEED;
}

export function createVoicemailSelectionSeed() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `v1-${globalThis.crypto.randomUUID()}`;
  }

  fallbackSeedSequence += 1;
  return `v1-${Date.now().toString(36)}-${fallbackSeedSequence.toString(36)}`;
}

function getAvailableOption(options, requestedId, defaultId) {
  const availableOptions = (options || []).filter((option) => option.available);
  return availableOptions.find((option) => option.id === requestedId)
    || availableOptions.find((option) => option.id === defaultId)
    || availableOptions[0]
    || null;
}

export function applyVoicemailActivityOverrides(data, category, config) {
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
          config?.levelOverrides?.[key]
            ? { ...level, ...config.levelOverrides[key] }
            : level,
        ]),
      ),
    },
  };
}

export function createDefaultVoicemailSetup(config, selectionSeed = LEGACY_SELECTION_SEED) {
  return {
    difficultyId: config?.defaultDifficultyId || "",
    themePackId: config?.defaultThemePackId || "",
    languageId: config?.defaultLanguageId || "en",
    itemCount: config ? getValidSetupItemCount(config, config.defaultItemCount) : 1,
    questionsPerVoicemail: config?.defaultQuestionsPerVoicemail || 3,
    interactionMode: DEFAULT_INTERACTION_MODE,
    selectionSeed: normalizeVoicemailSelectionSeed(selectionSeed),
  };
}

export function normalizeVoicemailSetupSelection(config, levels, selection = {}) {
  const defaults = createDefaultVoicemailSetup(config);
  const requested = { ...defaults, ...selection };
  const requestedDifficulty = levels?.[requested.difficultyId]
    ? requested.difficultyId
    : defaults.difficultyId;
  const difficultyId = levels?.[requestedDifficulty] ? requestedDifficulty : "";
  const themePack = getAvailableOption(
    config?.themePacks,
    requested.themePackId,
    defaults.themePackId,
  );
  const language = getAvailableOption(
    config?.languages,
    requested.languageId,
    defaults.languageId,
  );
  const numericQuestionCount = Number(requested.questionsPerVoicemail);
  const questionsPerVoicemail = config?.questionCounts?.includes(numericQuestionCount)
    ? numericQuestionCount
    : defaults.questionsPerVoicemail;

  return {
    difficultyId,
    themePackId: themePack?.id || "",
    languageId: language?.id || "",
    itemCount: getValidSetupItemCount(config, requested.itemCount),
    questionsPerVoicemail,
    interactionMode: normalizeVoicemailInteractionMode(requested.interactionMode),
    selectionSeed: normalizeVoicemailSelectionSeed(requested.selectionSeed),
  };
}

export function isVoicemailSetupValid({
  config,
  levels,
  selection,
  availableItemCount,
}) {
  const normalized = normalizeVoicemailSetupSelection(config, levels, selection);
  return Boolean(
    normalized.difficultyId
    && normalized.themePackId
    && normalized.languageId
    && availableItemCount > 0
    && normalized.questionsPerVoicemail > 0,
  );
}

export function createVoicemailSessionActivity(activity, selection) {
  const includeQuestionCount = hasConfigurableVoicemailQuestions(selection.difficultyId);
  const includeInteractionMode = isVoicemailPhoneMenuMode(selection.difficultyId);
  return {
    category: activity.category,
    activity_slug: activity.slug,
    activity_title: activity.title,
    setup_config: {
      difficultyId: selection.difficultyId,
      themePackId: selection.themePackId,
      languageId: selection.languageId,
      itemCount: selection.itemCount,
      ...(includeQuestionCount
        ? { questionsPerVoicemail: selection.questionsPerVoicemail }
        : {}),
      ...(includeInteractionMode
        ? { interactionMode: normalizeVoicemailInteractionMode(selection.interactionMode) }
        : {}),
      selectionSeed: normalizeVoicemailSelectionSeed(selection.selectionSeed),
    },
  };
}

export function buildVoicemailRuntimeSearchParams(
  selection,
  { letterId, done = false } = {},
) {
  const includeQuestionCount = hasConfigurableVoicemailQuestions(selection.difficultyId);
  const includeInteractionMode = isVoicemailPhoneMenuMode(selection.difficultyId);
  const itemIds = Array.isArray(selection.itemIds)
    ? selection.itemIds.filter((itemId) => itemId !== undefined && itemId !== null)
    : [];
  return {
    level: selection.difficultyId,
    pack: selection.themePackId,
    language: selection.languageId,
    count: String(selection.itemCount),
    ...(includeQuestionCount && selection.questionsPerVoicemail
      ? { questions: String(selection.questionsPerVoicemail) }
      : {}),
    ...(includeInteractionMode
      ? { interaction: normalizeVoicemailInteractionMode(selection.interactionMode) }
      : {}),
    ...(selection.selectionSeed
      ? { seed: normalizeVoicemailSelectionSeed(selection.selectionSeed) }
      : {}),
    ...(itemIds.length ? { items: itemIds.map(String).join(",") } : {}),
    ...(letterId !== undefined && letterId !== null
      ? { letter: String(letterId) }
      : {}),
    ...(done ? { done: "1" } : {}),
  };
}
