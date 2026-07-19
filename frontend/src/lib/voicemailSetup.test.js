import { ACTIVITY_SETUP_CONFIGS } from "./activitySetupConfig";
import { getSessionActivityKey } from "./sessionActivityIdentity";
import {
  applyVoicemailActivityOverrides,
  buildVoicemailRuntimeSearchParams,
  createVoicemailSessionActivity,
  normalizeVoicemailSetupSelection,
} from "./voicemailSetup";

const config = ACTIVITY_SETUP_CONFIGS.voicemails;
const levels = {
  green: { title: "Foundational", letters: [] },
  amber: { title: "Intermediate", letters: [] },
  red: { title: "Complex", letters: [] },
  pink: { title: "Bonus", letters: [] },
};

const validSelection = {
  difficultyId: "amber",
  themePackId: "mixed-bag",
  languageId: "en",
  itemCount: 6,
  questionsPerVoicemail: 4,
  interactionMode: "single",
  selectionSeed: "session-seed-42",
};

test("valid voicemail setup values remain unchanged", () => {
  expect(normalizeVoicemailSetupSelection(config, levels, validSelection))
    .toEqual(validSelection);
});

test("invalid or stale voicemail counts fall back to configured defaults", () => {
  expect(normalizeVoicemailSetupSelection(config, levels, {
    ...validSelection,
    itemCount: 3,
    questionsPerVoicemail: 8,
  })).toEqual({
    ...validSelection,
    itemCount: 4,
    questionsPerVoicemail: 3,
  });
});

test("Extended remains the visible label while the stable pink ID is preserved", () => {
  const activity = applyVoicemailActivityOverrides({
    slug: "voicemails",
    content: { levels },
  }, "functional-communication", config);

  expect(Object.keys(activity.content.levels)).toContain("pink");
  expect(activity.content.levels.pink.title).toBe("Extended");
});

test("session identity is stable for identical voicemail configurations", () => {
  const activity = {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
  };
  const first = createVoicemailSessionActivity(activity, validSelection);
  const second = createVoicemailSessionActivity(activity, { ...validSelection });

  expect(getSessionActivityKey(first)).toBe(getSessionActivityKey(second));
});

test("different voicemail configurations produce distinct session identities", () => {
  const activity = {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
  };
  const first = createVoicemailSessionActivity(activity, validSelection);
  const second = createVoicemailSessionActivity(activity, {
    ...validSelection,
    questionsPerVoicemail: 5,
  });

  expect(getSessionActivityKey(first)).not.toBe(getSessionActivityKey(second));
});

test("Extended treats its fixed decisions as content rather than question configuration", () => {
  const activity = {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
  };
  const first = createVoicemailSessionActivity(activity, {
    ...validSelection,
    difficultyId: "pink",
    questionsPerVoicemail: 1,
  });
  const second = createVoicemailSessionActivity(activity, {
    ...validSelection,
    difficultyId: "pink",
    questionsPerVoicemail: 5,
  });

  expect(first.setup_config).not.toHaveProperty("questionsPerVoicemail");
  expect(second.setup_config).not.toHaveProperty("questionsPerVoicemail");
  expect(first.setup_config.interactionMode).toBe("single");
  expect(getSessionActivityKey(first)).toBe(getSessionActivityKey(second));
});

test("Extended interaction choices produce distinct session identities", () => {
  const activity = {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
  };
  const single = createVoicemailSessionActivity(activity, {
    ...validSelection,
    difficultyId: "pink",
    interactionMode: "single",
  });
  const multiple = createVoicemailSessionActivity(activity, {
    ...validSelection,
    difficultyId: "pink",
    interactionMode: "multiple",
  });

  expect(getSessionActivityKey(single)).not.toBe(getSessionActivityKey(multiple));
});

test("legacy Extended session identity defaults to Single interaction", () => {
  const activity = {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
  };
  const current = createVoicemailSessionActivity(activity, {
    ...validSelection,
    difficultyId: "pink",
    interactionMode: "single",
  });
  const legacy = {
    ...current,
    setup_config: { ...current.setup_config },
  };
  delete legacy.setup_config.interactionMode;

  expect(getSessionActivityKey(legacy)).toBe(getSessionActivityKey(current));
});

test("recorded runtime item IDs do not change the configured session identity", () => {
  const activity = {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
  };
  const first = createVoicemailSessionActivity(activity, {
    ...validSelection,
    itemIds: [8, 3, 6],
  });
  const second = createVoicemailSessionActivity(activity, {
    ...validSelection,
    itemIds: [6, 3, 8],
  });

  expect(getSessionActivityKey(first)).toBe(getSessionActivityKey(second));
});

test("selection seeds are stored in configuration without changing clinician setup identity", () => {
  const activity = {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
  };
  const first = createVoicemailSessionActivity(activity, validSelection);
  const second = createVoicemailSessionActivity(activity, {
    ...validSelection,
    selectionSeed: "session-seed-99",
  });

  expect(first.setup_config.selectionSeed).toBe("session-seed-42");
  expect(second.setup_config.selectionSeed).toBe("session-seed-99");
  expect(getSessionActivityKey(first)).toBe(getSessionActivityKey(second));
});

test("runtime URLs record the selected item set for stable reconstruction", () => {
  expect(buildVoicemailRuntimeSearchParams({
    ...validSelection,
    itemIds: [8, 3, 6],
  }, { letterId: 8 })).toEqual({
    level: "amber",
    pack: "mixed-bag",
    language: "en",
    count: "6",
    questions: "4",
    seed: "session-seed-42",
    items: "8,3,6",
    letter: "8",
  });
});

test("Extended runtime URLs omit the hidden standard question count", () => {
  expect(buildVoicemailRuntimeSearchParams({
    ...validSelection,
    difficultyId: "pink",
    itemIds: [8, 3, 6],
  }, { letterId: 8 })).toEqual({
    level: "pink",
    pack: "mixed-bag",
    language: "en",
    count: "6",
    interaction: "single",
    seed: "session-seed-42",
    items: "8,3,6",
    letter: "8",
  });
});

test("Extended runtime URLs preserve the selected interaction mode", () => {
  expect(buildVoicemailRuntimeSearchParams({
    ...validSelection,
    difficultyId: "pink",
    interactionMode: "multiple",
  })).toMatchObject({
    level: "pink",
    interaction: "multiple",
  });
});
