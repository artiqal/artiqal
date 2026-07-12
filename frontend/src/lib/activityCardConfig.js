const ACTIVITY_CARD_METADATA_BY_KEY = {
  "reading/receipt": {
    clinicalTarget: "Reading comprehension",
    activityFormat: "Functional task",
    cardVisual: "receipt",
  },
  "word-finding/naming": {
    clinicalTarget: "Word finding",
    activityFormat: "Naming task",
    cardVisual: "name-picture",
  },
  "reading/appointment-letter": {
    clinicalTarget: "Reading comprehension",
    activityFormat: "Levelled task",
    cardVisual: "appointment-letter",
  },
  "reading/prescription-medication-labels": {
    clinicalTarget: "Reading comprehension",
    activityFormat: "Levelled task",
    cardVisual: "prescription-medication",
  },
  "functional-communication/appointment-letter": {
    clinicalTarget: "Reading comprehension",
    activityFormat: "Levelled task",
    cardVisual: "appointment-letter",
  },
  "functional-communication/prescription-medication-labels": {
    clinicalTarget: "Reading comprehension",
    activityFormat: "Levelled task",
    cardVisual: "prescription-medication",
  },
  "functional-communication/voicemails": {
    clinicalTarget: "Listening comprehension",
    activityFormat: "Levelled task",
    cardVisual: "voicemail",
    activityInfo: {
      clinicalTargets: "Auditory comprehension, verbal memory and functional listening",
      taskFormat: null,
      difficulty: "3 graded levels plus a phone-menu challenge",
      usefulFor: "Adults with aphasia or cognitive-communication difficulties",
      itemCount: null,
      searchKeywords: ["voicemail", "phone menu", "key details", "recall"],
    },
  },
  "games/crossword": {
    clinicalTarget: "Word finding",
    activityFormat: "Game",
    cardVisual: "crossword",
  },
  "word-finding/sfa-tool": {
    clinicalTarget: "Word finding",
    activityFormat: "Therapy tool",
    cardVisual: "sfa",
  },
};

const ACTIVITY_CARD_METADATA_BY_SLUG = Object.entries(ACTIVITY_CARD_METADATA_BY_KEY).reduce(
  (metadataBySlug, [key, metadata]) => {
    const slug = key.split("/")[1];
    return { ...metadataBySlug, [slug]: metadata };
  },
  {}
);

const DOMAIN_CARD_METADATA_FALLBACKS = {
  "word-finding": {
    clinicalTarget: "Word finding",
    activityFormat: "Therapy task",
  },
  reading: {
    clinicalTarget: "Reading comprehension",
    activityFormat: "Functional task",
  },
  writing: {
    clinicalTarget: "Written expression",
    activityFormat: "Writing task",
  },
  "auditory-comprehension": {
    clinicalTarget: "Listening comprehension",
    activityFormat: "Listening task",
  },
  "functional-communication": {
    clinicalTarget: "Functional communication",
    activityFormat: "Practice task",
  },
  games: {
    clinicalTarget: "Cognitive-linguistic practice",
    activityFormat: "Game",
  },
  dysphagia: {
    clinicalTarget: "Swallowing education",
    activityFormat: "Clinical resource",
  },
  "motor-speech": {
    clinicalTarget: "Speech clarity",
    activityFormat: "Practice task",
  },
  voice: {
    clinicalTarget: "Voice",
    activityFormat: "Practice task",
  },
  "cognitive-communication": {
    clinicalTarget: "Cognitive communication",
    activityFormat: "Strategy task",
  },
  "ai-practice": {
    clinicalTarget: "Functional practice",
    activityFormat: "AI-generated",
  },
};

export const ACTIVITY_CARD_LABELS = {};

const getActivityKey = (activity, categorySlug) =>
  `${categorySlug || activity?.category || ""}/${activity?.slug || ""}`;

export function getActivityCardMetadata(activity, categorySlug) {
  const key = getActivityKey(activity, categorySlug);
  const config =
    ACTIVITY_CARD_METADATA_BY_KEY[key] ||
    ACTIVITY_CARD_METADATA_BY_SLUG[activity?.slug] ||
    DOMAIN_CARD_METADATA_FALLBACKS[categorySlug] ||
    DOMAIN_CARD_METADATA_FALLBACKS[activity?.category] ||
    {};

  return {
    clinicalTarget:
      activity?.clinicalTarget ||
      activity?.clinical_target ||
      activity?.clinical_target_label ||
      config.clinicalTarget ||
      "Clinical practice",
    activityFormat:
      activity?.activityFormat ||
      activity?.activity_format ||
      activity?.formatLabel ||
      config.activityFormat ||
      "Activity",
    cardVisual: activity?.cardVisual || activity?.card_visual || config.cardVisual,
    activityInfo: config.activityInfo || {},
  };
}

export function getActivityCardVisualKind(activity, categorySlug) {
  return getActivityCardMetadata(activity, categorySlug).cardVisual;
}

const normalizeInfoText = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" || typeof item === "number" ? String(item).trim() : ""))
      .filter(Boolean);

    return items.length ? items : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text || null;
  }

  return null;
};

const collectPlainSearchText = (value) => {
  if (value === null || value === undefined || value === false) {
    return [];
  }

  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text ? [text] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectPlainSearchText);
  }

  if (typeof value === "object") {
    if (value.searchable === false) {
      return [];
    }

    return Object.entries(value)
      .filter(([key]) => !["searchable", "id", "key"].includes(key))
      .flatMap(([, entryValue]) => collectPlainSearchText(entryValue));
  }

  return [];
};

const uniqueTextValues = (values) => {
  const seen = new Set();

  return values.filter((value) => {
    const text = String(value || "").trim();
    if (!text || seen.has(text)) {
      return false;
    }

    seen.add(text);
    return true;
  });
};

const getRecordCount = (record) => {
  if (!record) {
    return 0;
  }

  if (Array.isArray(record)) {
    return record.length;
  }

  if (typeof record === "object") {
    return Object.keys(record).length;
  }

  return 0;
};

const getActivityQuantityLabel = (activity) => {
  const explicitValue =
    activity?.numberOfItems ||
    activity?.number_of_items ||
    activity?.itemCount ||
    activity?.item_count ||
    activity?.availableLevels ||
    activity?.available_levels;

  const explicitText = normalizeInfoText(explicitValue);

  if (explicitText) {
    return explicitText;
  }

  const levelCount = getRecordCount(activity?.levels || activity?.content?.levels || activity?.difficultyLevels);
  if (levelCount > 0) {
    return `${levelCount} ${levelCount === 1 ? "level" : "levels"} available`;
  }

  const itemCount = getRecordCount(activity?.items || activity?.content?.items || activity?.questions || activity?.content?.questions);
  if (itemCount > 0) {
    return `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
  }

  return null;
};

const firstConfiguredInfoValue = (...values) => values.find((value) => value !== undefined);

export function getActivityCardInfo(activity, categorySlug) {
  const metadata = getActivityCardMetadata(activity, categorySlug);
  const activityInfo = activity?.activityInfo || activity?.activity_info || activity?.info || {};
  const info = { ...metadata.activityInfo, ...activityInfo };

  return {
    clinicalTargets: normalizeInfoText(
      firstConfiguredInfoValue(
        info.clinicalTargets,
        info.clinical_targets,
        activity?.clinicalTargets,
        activity?.clinical_targets,
        metadata.clinicalTarget
      )
    ),
    skillsAddressed: normalizeInfoText(
      firstConfiguredInfoValue(
        info.skillsAddressed,
        info.skills_addressed,
        activity?.skillsAddressed,
        activity?.skills_addressed,
        activity?.skills
      )
    ),
    taskFormat: normalizeInfoText(
      firstConfiguredInfoValue(
        info.taskFormat,
        info.task_format,
        activity?.taskFormat,
        activity?.task_format,
        activity?.activityFormat,
        activity?.activity_format,
        metadata.activityFormat
      )
    ),
    difficulty: normalizeInfoText(
      firstConfiguredInfoValue(
        info.difficulty,
        info.difficultyLabel,
        info.difficulty_label,
        activity?.difficulty,
        activity?.difficultyLabel,
        activity?.difficulty_label
      )
    ),
    usefulFor: normalizeInfoText(
      firstConfiguredInfoValue(
        info.usefulFor,
        info.useful_for,
        activity?.usefulFor,
        activity?.useful_for
      )
    ),
    suggestedLevel: normalizeInfoText(
      firstConfiguredInfoValue(
        info.suggestedLevel,
        info.suggested_level,
        activity?.suggestedLevel,
        activity?.suggested_level,
        activity?.level
      )
    ),
    itemCount: normalizeInfoText(
      firstConfiguredInfoValue(info.itemCount, info.item_count, info.quantity, getActivityQuantityLabel(activity))
    ),
    clinicianTips: normalizeInfoText(
      firstConfiguredInfoValue(
        info.clinicianTips,
        info.clinician_tips,
        activity?.clinicianTips,
        activity?.clinician_tips
      )
    ),
  };
}

export function getActivityCardSearchTextValues(activity, categorySlug) {
  const metadata = getActivityCardMetadata(activity, categorySlug);
  const activityInfo = activity?.activityInfo || activity?.activity_info || activity?.info || {};
  const displayedInfo = getActivityCardInfo(activity, categorySlug);
  const standardInfoText = {
    clinicalTargets: displayedInfo.clinicalTargets,
    difficulty: displayedInfo.difficulty,
    usefulFor: displayedInfo.usefulFor,
  };

  return uniqueTextValues([
    ...collectPlainSearchText(standardInfoText),
    ...collectPlainSearchText(metadata.activityInfo?.searchKeywords),
    ...collectPlainSearchText(metadata.activityInfo?.search_keywords),
    ...collectPlainSearchText(activityInfo.searchKeywords),
    ...collectPlainSearchText(activityInfo.search_keywords),
    ...collectPlainSearchText(activity?.searchTerms),
    ...collectPlainSearchText(activity?.search_terms),
    ...collectPlainSearchText(activity?.searchKeywords),
    ...collectPlainSearchText(activity?.search_keywords),
    ...collectPlainSearchText(activity?.keywords),
  ]);
}
