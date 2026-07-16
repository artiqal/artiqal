import React, { act } from "react";
import { createRoot } from "react-dom/client";

import ActivityPage from "./ActivityPage";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock("@/components/Letterheads", () => {
  const React = require("react");

  return {
    LetterheadView: ({ letterhead }) =>
      React.createElement(
        "div",
        {
          "data-format": letterhead?.format || "letter",
          "data-testid": "letterhead-view",
        },
        letterhead?.clinic_name || "Reading material",
      ),
  };
});

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    let route = {
      category: "functional-communication",
      slug: "appointment-letter",
    };
    let currentLocation = {
      pathname: "/activity/functional-communication/appointment-letter",
      search: "",
      hash: "",
      state: null,
    };
    const navigate = jest.fn();
    const searchChanges = [];

    const toSearchParams = (nextValue) => {
      if (nextValue instanceof URLSearchParams) {
        return new URLSearchParams(nextValue);
      }
      return new URLSearchParams(nextValue || {});
    };

    return {
      __getCurrentSearch: () => currentLocation.search,
      __getSearchChanges: () => [...searchChanges],
      __navigate: navigate,
      __setRoute: ({ category = "functional-communication", slug, search = "" }) => {
        route = { category, slug };
        currentLocation = {
          pathname: `/activity/${category}/${slug}`,
          search,
          hash: "",
          state: null,
        };
        searchChanges.length = 0;
      },
      Link: ({ children, to, ...props }) =>
        React.createElement("a", { href: to, ...props }, children),
      Navigate: ({ to }) => React.createElement("span", { "data-navigate-to": to }),
      useLocation: () => currentLocation,
      useNavigate: () => navigate,
      useParams: () => route,
      useSearchParams: () => {
        const [params, setParams] = React.useState(
          () => new URLSearchParams(currentLocation.search),
        );
        const updateParams = React.useCallback((nextValue, options) => {
          const nextParams = toSearchParams(nextValue);
          const nextSearch = nextParams.toString();
          currentLocation = {
            ...currentLocation,
            search: nextSearch ? `?${nextSearch}` : "",
          };
          searchChanges.push({
            options,
            params: Object.fromEntries(nextParams.entries()),
          });
          setParams(nextParams);
        }, []);

        return [params, updateParams];
      },
    };
  },
  { virtual: true },
);

const {
  __getCurrentSearch: getCurrentSearch,
  __getSearchChanges: getSearchChanges,
  __navigate: navigate,
  __setRoute: setRoute,
} = jest.requireMock("react-router-dom");

const makeQuestions = (itemId) => [
  {
    q: `Question A for item ${itemId}`,
    options: [`Answer ${itemId}A`, "Alternative", "Unsure"],
    answer: 0,
  },
  {
    q: `Question B for item ${itemId}`,
    options: [`Answer ${itemId}B`, "Alternative", "Unsure"],
    answer: 0,
  },
];

const makeItems = (format, count) =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return {
      id,
      title: `${format === "label" ? "Medication Label" : "Appointment Letter"} ${id}`,
      summary: `Summary for item ${id}`,
      text: `Reading text for item ${id}`,
      letterhead: {
        format,
        clinic_name: `Clinic ${id}`,
      },
      questions: makeQuestions(id),
    };
  });

const makeLevel = ({ key, title, format, itemCount, itemLabelSingular, itemLabelPlural }) => ({
  key,
  title,
  blurb: `${title} reading content.`,
  best_for: `${title} reading practice.`,
  questions_per_letter: 2,
  target_letter_count: itemCount || 3,
  item_label_singular: itemLabelSingular,
  item_label_plural: itemLabelPlural,
  est_minutes: "5–10 min",
  letters: makeItems(format, itemCount),
});

function makeLegacyActivity({
  slug = "appointment-letter",
  itemCount = 2,
} = {}) {
  const isMedication = slug === "prescription-medication-labels";
  const format = isMedication ? "label" : "letter";
  const itemLabelSingular = isMedication ? "Label" : "Letter";
  const itemLabelPlural = isMedication ? "labels" : "letters";
  const levels = Object.fromEntries(
    [
      ["green", "Foundational"],
      ["amber", "Intermediate"],
      ["red", "Complex"],
      ["pink", "Bonus"],
    ].map(([key, title]) => [
      key,
      makeLevel({
        key,
        title,
        format,
        itemCount,
        itemLabelSingular,
        itemLabelPlural,
      }),
    ]),
  );

  return {
    slug,
    title: isMedication
      ? "Reading Prescription and Medication Labels"
      : "Reading an Appointment Letter",
    summary: "Choose a difficulty and answer questions.",
    type: "reading-leveled",
    content: { levels },
  };
}

function SessionProbe() {
  const { active } = useSession();
  return <output data-testid="session-state">{JSON.stringify(active)}</output>;
}

describe("Legacy levelled-reading flow", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    api.get.mockReset();
    navigate.mockClear();
    setRoute({ slug: "appointment-letter" });
    window.localStorage.clear();
    window.sessionStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }
    container.remove();
  });

  const settle = async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  const seedActiveSession = () => {
    window.localStorage.setItem(
      "concentric_active_session_v1",
      JSON.stringify({
        started_at: "2026-01-01T12:00:00.000Z",
        activities: [],
        attempts: [],
        cues: [],
      }),
    );
  };

  const renderFlow = async (activity = makeLegacyActivity()) => {
    api.get.mockResolvedValue({ data: activity });
    await act(async () => {
      root.render(
        <SessionProvider>
          <ActivityPage />
          <SessionProbe />
        </SessionProvider>,
      );
    });
    await settle();
  };

  const unmountForRefresh = async () => {
    await act(async () => {
      root.unmount();
    });
    root = createRoot(container);
  };

  const click = async (selector) => {
    const element = container.querySelector(selector);
    expect(element).not.toBeNull();
    await act(async () => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await settle();
    return element;
  };

  const enterText = async (selector, value) => {
    const input = container.querySelector(selector);
    expect(input).not.toBeNull();
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    await act(async () => {
      valueSetter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  const readSession = () =>
    JSON.parse(container.querySelector('[data-testid="session-state"]').textContent || "null");

  const expectSummary = ({ attempted, totalItems = 2, correct, totalAnswers, accuracy, hints }) => {
    const summary = container.querySelector('[data-testid="completion-screen"]');
    expect(summary).not.toBeNull();
    expect(summary.textContent).toContain(`${attempted} of ${totalItems}`);
    expect(summary.textContent).toContain(`${correct} / ${totalAnswers} (${accuracy}%)`);
    expect(summary.textContent).toContain(`${hints}% of questions`);
    expect(summary.textContent).toMatch(/Duration:\s*(?:\d+s|\d+m \d{2}s)/);
  };

  test("moves from difficulty to item selection to split runtime and logs only the synthetic item identity", async () => {
    seedActiveSession();
    await renderFlow();

    expect(container.querySelector('[data-testid="difficulty-picker"]')).not.toBeNull();
    expect(readSession().activities).toEqual([]);

    await click('[data-testid="difficulty-green"]');

    expect(getCurrentSearch()).toBe("?level=green");
    expect(getSearchChanges().at(-1).params).toEqual({ level: "green" });
    expect(container.querySelector('[data-testid="letter-picker"]').textContent)
      .toContain("Foundational · 2 of 2 letters");
    expect(container.querySelector('[data-testid="letter-1"]').textContent).toContain("Letter 1");
    expect(readSession().activities).toEqual([]);

    await click('[data-testid="letter-1"]');

    expect(getCurrentSearch()).toBe("?level=green&letter=1");
    expect(getSearchChanges().at(-1).params).toEqual({ level: "green", letter: "1" });
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Foundational · Letter 1 of 2");
    expect(container.querySelector('[data-testid="reading-stacked"]')).toBeNull();
    const splitLayout = container.querySelector('[data-testid="reading-questions"]').closest("div.grid");
    expect(splitLayout.classList.contains("lg:grid-cols-5")).toBe(true);

    const session = readSession();
    expect(session.activities).toHaveLength(1);
    expect(session.activities[0]).toMatchObject({
      category: "functional-communication",
      activity_slug: "appointment-letter-green-1",
      activity_title:
        "Reading an Appointment Letter — Foundational · Appointment Letter 1",
    });
    expect(session.activities.some((item) => item.activity_slug === "appointment-letter"))
      .toBe(false);
  });

  test("reconstructs a direct appointment runtime after remount without changing its URL", async () => {
    seedActiveSession();
    setRoute({ slug: "appointment-letter", search: "?level=amber&letter=2" });
    const activity = makeLegacyActivity();
    await renderFlow(activity);

    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Intermediate · Letter 2 of 2");
    expect(getSearchChanges()).toEqual([]);
    expect(getCurrentSearch()).toBe("?level=amber&letter=2");

    await unmountForRefresh();
    setRoute({ slug: "appointment-letter", search: "?level=amber&letter=2" });
    await renderFlow(activity);

    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Intermediate · Letter 2 of 2");
    expect(getSearchChanges()).toEqual([]);
    expect(readSession().activities.map((item) => item.activity_slug)).toEqual([
      "appointment-letter-amber-2",
    ]);
  });

  test.each([
    ["missing level", "?letter=1&done=1", "difficulty-picker"],
    ["invalid level", "?level=blue&letter=1", "difficulty-picker"],
    ["missing item", "?level=green", "letter-picker"],
    ["invalid item", "?level=green&letter=999", "letter-picker"],
  ])("preserves current %s fallback behaviour", async (_label, search, expectedTestId) => {
    setRoute({ slug: "appointment-letter", search });
    await renderFlow();

    expect(container.querySelector(`[data-testid="${expectedTestId}"]`)).not.toBeNull();
    expect(getCurrentSearch()).toBe(search);
    expect(getSearchChanges()).toEqual([]);
    expect(container.querySelector('[data-testid="reading-questions"]')).toBeNull();
  });

  test("uses the stacked runtime and Label copy for prescription medication labels", async () => {
    setRoute({
      slug: "prescription-medication-labels",
      search: "?level=green&letter=1",
    });
    await renderFlow(makeLegacyActivity({ slug: "prescription-medication-labels" }));

    expect(container.querySelector('[data-testid="reading-stacked"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Foundational · Label 1 of 2");
    expect(container.querySelector('[data-testid="letterhead-view"]').dataset.format).toBe("label");
    expect(container.querySelector('[data-testid="next-letter-btn"]').textContent)
      .toContain("Next label");
  });

  test("progresses between items, finishes, and reports attempted items, accuracy, hints, and duration", async () => {
    setRoute({ slug: "appointment-letter", search: "?level=green&letter=1" });
    await renderFlow();

    await click('[data-testid="question-0-show-hint"]');
    await enterText('[data-testid="question-0-input"]', "Answer 1A");
    await click('[data-testid="question-0-submit"]');
    await click('[data-testid="next-letter-btn"]');

    expect(getCurrentSearch()).toBe("?level=green&letter=2");
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Letter 2 of 2");
    expect(container.querySelector('[data-testid="next-letter-btn"]').textContent).toContain("Finish");

    await enterText('[data-testid="question-0-input"]', "Wrong answer");
    await click('[data-testid="question-0-submit"]');
    await click('[data-testid="next-letter-btn"]');

    expect(getCurrentSearch()).toBe("?level=green&done=1");
    expect(getSearchChanges().at(-1).params).toEqual({ level: "green", done: "1" });
    expectSummary({ attempted: 2, correct: 1, totalAnswers: 2, accuracy: 50, hints: 50 });
  });

  test("restart and change difficulty clear the previous completion summary", async () => {
    setRoute({ slug: "appointment-letter", search: "?level=green&letter=1" });
    await renderFlow();

    await enterText('[data-testid="question-0-input"]', "Answer 1A");
    await click('[data-testid="question-0-submit"]');
    await click('[data-testid="end-activity-btn"]');
    expectSummary({ attempted: 1, correct: 1, totalAnswers: 1, accuracy: 100, hints: 0 });

    await click('[data-testid="completion-replay"]');
    expect(getCurrentSearch()).toBe("?level=green&letter=1");
    await click('[data-testid="end-activity-btn"]');
    expectSummary({ attempted: 0, correct: 0, totalAnswers: 0, accuracy: 0, hints: 0 });

    await click('[data-testid="completion-replay"]');
    await enterText('[data-testid="question-0-input"]', "Answer 1A");
    await click('[data-testid="question-0-submit"]');
    await click('[data-testid="end-activity-btn"]');
    expectSummary({ attempted: 1, correct: 1, totalAnswers: 1, accuracy: 100, hints: 0 });

    await click('[data-testid="completion-change-difficulty"]');
    expect(getCurrentSearch()).toBe("");
    expect(container.querySelector('[data-testid="difficulty-picker"]')).not.toBeNull();
    await click('[data-testid="difficulty-amber"]');
    await click('[data-testid="letter-1"]');
    await click('[data-testid="end-activity-btn"]');
    expectSummary({ attempted: 0, correct: 0, totalAnswers: 0, accuracy: 0, hints: 0 });
  });

  test.each([
    ["appointment-letter", "Letters", "letters"],
    ["prescription-medication-labels", "Labels", "labels"],
  ])("shows the empty-level fallback and %s item copy", async (slug, heading, plural) => {
    setRoute({ slug, search: "?level=green" });
    await renderFlow(makeLegacyActivity({ slug, itemCount: 0 }));

    expect(container.querySelector('[data-testid="letter-picker"]').textContent)
      .toContain(`Foundational · 0 of 3 ${plural}`);
    expect(container.querySelector('[data-testid="letter-picker-empty"]').textContent)
      .toContain(`${heading} coming soon`);
  });
});
