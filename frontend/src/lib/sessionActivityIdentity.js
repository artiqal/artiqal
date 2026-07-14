export const SETUP_IDENTITY_FIELDS = [
  "difficultyId",
  "themePackId",
  "languageId",
  "itemCount",
  "questionsPerVoicemail",
];

export function getSessionActivityKey(activity) {
  const activityKey = `${activity?.category || ""}/${activity?.activity_slug || ""}`;
  const setupConfig = activity?.setup_config;
  if (!setupConfig) return activityKey;

  const configurationKey = SETUP_IDENTITY_FIELDS
    .map((field) => `${field}:${setupConfig[field] ?? ""}`)
    .join("|");
  return `${activityKey}|${configurationKey}`;
}
