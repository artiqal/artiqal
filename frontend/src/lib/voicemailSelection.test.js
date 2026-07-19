import {
  getClampedVoicemailQuestionCount,
  selectVoicemailItems,
  selectVoicemailQuestions,
} from "./voicemailSelection";

const makeQuestion = (q, correct = q) => ({
  q,
  options: [correct, `${q} distractor A`, `${q} distractor B`],
  answer: 0,
});

const level = {
  key: "green",
  letters: [
    { id: 1, languageId: "en", questions: [makeQuestion("A"), makeQuestion("B")] },
    { id: 1, languageId: "en", questions: [makeQuestion("Duplicate")] },
    { id: 2, questions: [makeQuestion("C")] },
    { id: 3, languageId: "en", questions: [makeQuestion("D")] },
    { id: 4, languageId: "pt-BR", questions: [makeQuestion("E")] },
    { id: 5, languageId: "en", questions: [makeQuestion("F")] },
    { id: 6, languageId: "en", questions: [makeQuestion("G")] },
  ],
};

const selection = {
  difficultyId: "green",
  themePackId: "mixed-bag",
  languageId: "en",
  itemCount: 3,
  selectionSeed: "seed-alpha",
};

test("voicemail item selection is reproducible for the same explicit seed", () => {
  const first = selectVoicemailItems(level, selection).map((item) => item.id);
  const second = selectVoicemailItems(level, selection).map((item) => item.id);

  expect(first).toEqual(second);
  expect(first).toHaveLength(3);
  expect(first).not.toEqual([1, 2, 3]);
});

test("different explicit seeds produce different reproducible voicemail selections", () => {
  const first = selectVoicemailItems(level, selection).map((item) => item.id);
  const secondSelection = { ...selection, selectionSeed: "seed-bravo" };
  const second = selectVoicemailItems(level, secondSelection).map((item) => item.id);

  expect(second).toEqual(selectVoicemailItems(level, secondSelection).map((item) => item.id));
  expect(second).not.toEqual(first);
});

test("recorded item IDs reconstruct the same configured session order", () => {
  expect(selectVoicemailItems(level, {
    ...selection,
    itemIds: [3, 1, 6],
  }).map((item) => item.id)).toEqual([3, 1, 6]);
});

test("requested voicemail count is clamped to matching unique availability", () => {
  expect(selectVoicemailItems(level, { ...selection, itemCount: 10 })).toHaveLength(5);
});

test("question selection draws a balanced seeded mix from the full pool", () => {
  const item = {
    id: 11,
    questions: [
      makeQuestion("Who called?"),
      makeQuestion("What was the message about?"),
      makeQuestion("What day is the appointment?"),
      makeQuestion("Where should the listener go?"),
      makeQuestion("Why was the appointment moved?"),
      makeQuestion("What should the listener do if the clinic is closed?"),
      makeQuestion("Which symptoms require urgent medical advice?"),
    ],
  };

  const selectedPrompts = selectVoicemailQuestions(item, 5, "balanced-seed")
    .map((question) => question.q);

  expect(selectedPrompts).toContain("What should the listener do if the clinic is closed?");
  expect(selectedPrompts).toContain("Which symptoms require urgent medical advice?");
  expect(selectedPrompts.some((prompt) => prompt.startsWith("Who ") || prompt.startsWith("What ")))
    .toBe(true);
  expect(selectedPrompts).not.toEqual(item.questions.slice(0, 5).map((question) => question.q));
});

test("question selection is reproducible by seed and can vary the recall subset", () => {
  const item = {
    id: 12,
    questions: Array.from({ length: 8 }, (_, index) => makeQuestion(`Recall ${index + 1}`)),
  };

  const first = selectVoicemailQuestions(item, 3, "question-seed-a").map((question) => question.q);
  const repeated = selectVoicemailQuestions(item, 3, "question-seed-a")
    .map((question) => question.q);
  const second = selectVoicemailQuestions(item, 3, "question-seed-b").map((question) => question.q);

  expect(repeated).toEqual(first);
  expect(second).not.toEqual(first);
});

test("deterministic option reordering preserves correct answers without mutating content", () => {
  const item = {
    id: 21,
    questions: Array.from({ length: 6 }, (_, index) =>
      makeQuestion(`Question ${index + 1}`, `Correct ${index + 1}`)),
  };
  const canonicalQuestions = JSON.parse(JSON.stringify(item.questions));

  const first = selectVoicemailQuestions(item, 6, "option-seed");
  const second = selectVoicemailQuestions(item, 6, "option-seed");

  expect(first).toEqual(second);
  first.forEach((question, index) => {
    expect(question.options[question.answer]).toBe(`Correct ${index + 1}`);
  });
  expect(first.some((question) => question.answer !== 0)).toBe(true);
  expect(item.questions).toEqual(canonicalQuestions);
});

test("phone-menu questions preserve their configured key mapping", () => {
  const item = {
    id: 30,
    letterhead: { format: "phone-menu" },
    questions: [{ q: "Choose a key", options: ["1", "2", "Stay"], answer: 1 }],
  };

  expect(selectVoicemailQuestions(item, 1)).toEqual(item.questions);
});

test("requested question count is clamped for each voicemail", () => {
  expect(getClampedVoicemailQuestionCount(level.letters[0], 5)).toBe(2);
  expect(selectVoicemailQuestions(level.letters[0], 5)).toHaveLength(2);
});
