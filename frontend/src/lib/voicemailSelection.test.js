import {
  getClampedVoicemailQuestionCount,
  selectVoicemailItems,
  selectVoicemailQuestions,
} from "./voicemailSelection";

const level = {
  letters: [
    { id: 1, languageId: "en", questions: [{ q: "A" }, { q: "B" }] },
    { id: 1, languageId: "en", questions: [{ q: "Duplicate" }] },
    { id: 2, questions: [{ q: "C" }] },
    { id: 3, languageId: "en", questions: [{ q: "D" }] },
    { id: 4, languageId: "pt-BR", questions: [{ q: "E" }] },
  ],
};

const selection = {
  themePackId: "mixed-bag",
  languageId: "en",
  itemCount: 10,
};

test("voicemail selection returns unique items in source order", () => {
  expect(selectVoicemailItems(level, selection).map((item) => item.id))
    .toEqual([1, 2, 3]);
});

test("requested voicemail count is clamped to matching availability", () => {
  expect(selectVoicemailItems(level, selection)).toHaveLength(3);
});

test("requested question count is clamped for each voicemail", () => {
  expect(getClampedVoicemailQuestionCount(level.letters[0], 5)).toBe(2);
  expect(selectVoicemailQuestions(level.letters[0], 5)).toEqual([
    { q: "A" },
    { q: "B" },
  ]);
});
