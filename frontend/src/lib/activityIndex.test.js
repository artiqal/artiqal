import { buildActivityIndex, searchActivityIndex } from "./activityIndex";

const activities = [
  {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
    description: "Listen to realistic voicemails and answer targeted questions.",
  },
  {
    category: "word-finding",
    slug: "naming",
    title: "Name the Picture",
    description: "Look at a description and name the object.",
    tags: ["object naming"],
  },
];

const categories = [
  { slug: "functional-communication", name: "Functional Tasks" },
  { slug: "word-finding", name: "Word Finding" },
];

const index = buildActivityIndex(activities, categories);
const resultSlugs = (query) => searchActivityIndex(index, query).map((activity) => activity.slug);

describe("shared activity search index", () => {
  test.each([
    "verbal memory",
    "functional listening",
    "aphasia",
    "phone menu",
    "key details",
    "recall",
  ])("finds voicemail activity from informational content: %s", (query) => {
    expect(resultSlugs(query)).toContain("voicemails");
  });

  test("treats hyphenated and spaced clinical phrases as equivalent", () => {
    expect(resultSlugs("cognitive communication")).toContain("voicemails");
    expect(resultSlugs("cognitive-communication")).toContain("voicemails");
    expect(resultSlugs("phone-menu")).toContain("voicemails");
  });

  test("keeps one-character searches strict", () => {
    expect(resultSlugs("e")).toEqual([]);
    expect(resultSlugs("l")).toEqual(["voicemails"]);
  });

  test("preserves title, domain, and tag searches", () => {
    expect(resultSlugs("picture")).toEqual(["naming"]);
    expect(resultSlugs("word finding")).toEqual(["naming"]);
    expect(resultSlugs("object naming")).toEqual(["naming"]);
  });
});
