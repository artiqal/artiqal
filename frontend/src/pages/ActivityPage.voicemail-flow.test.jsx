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
        { "data-testid": "voicemail-letterhead" },
        letterhead?.caller_name || "Voicemail",
      ),
  };
});

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    let initialSearch = "";
    let currentLocation = {
      pathname: "/activity/functional-communication/voicemails",
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
      __getSearchChanges: () => [...searchChanges],
      __navigate: navigate,
      __setInitialSearch: (search) => {
        initialSearch = search;
        currentLocation = { ...currentLocation, search };
        searchChanges.length = 0;
      },
      Link: ({ children, to, ...props }) =>
        React.createElement("a", { href: to, ...props }, children),
      Navigate: ({ to }) => React.createElement("span", { "data-navigate-to": to }),
      useLocation: () => currentLocation,
      useNavigate: () => navigate,
      useParams: () => ({
        category: "functional-communication",
        slug: "voicemails",
      }),
      useSearchParams: () => {
        const [params, setParams] = React.useState(() => new URLSearchParams(initialSearch));
        const updateParams = React.useCallback((nextValue, options) => {
          const nextParams = toSearchParams(nextValue);
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
  __getSearchChanges: getSearchChanges,
  __navigate: navigate,
  __setInitialSearch: setInitialSearch,
} = jest.requireMock("react-router-dom");

const makeQuestions = (levelKey, itemId) =>
  Array.from({ length: 5 }, (_, index) => ({
    q: `${levelKey} voicemail ${itemId} question ${index + 1}`,
    options: ["Correct", "Other", "Unsure"],
    answer: 0,
  }));

const makeItems = (levelKey, count = 6) =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return {
      id,
      title: `${levelKey} voicemail ${id}`,
      text: `${levelKey} voicemail ${id} text`,
      letterhead: {
        format: "voicemail",
        caller_name: `${levelKey} caller ${id}`,
      },
      questions: makeQuestions(levelKey, id),
    };
  });

const makeLevel = (key, title, itemCount = 6) => ({
  key,
  title,
  blurb: `${title} voicemail content.`,
  best_for: `${title} listening practice.`,
  item_label_singular: "Voicemail",
  item_label_plural: "voicemails",
  letters: makeItems(key, itemCount),
});

const makeVoicemailActivity = ({ itemCount = 6 } = {}) => ({
  slug: "voicemails",
  title: "Listening to a Voicemail",
  summary: "Listen to realistic voicemails and answer targeted questions.",
  type: "reading-leveled",
  content: {
    levels: {
      green: makeLevel("green", "Foundational", itemCount),
      amber: makeLevel("amber", "Intermediate", itemCount),
      red: makeLevel("red", "Complex", itemCount),
      pink: makeLevel("pink", "Extended", itemCount),
    },
  },
});

function SessionProbe() {
  const { active } = useSession();
  return <output data-testid="session-state">{JSON.stringify(active)}</output>;
}

describe("Listening to a Voicemail setup-to-runtime flow", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    api.get.mockReset();
    navigate.mockClear();
    setInitialSearch("");
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  const settle = async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  const renderFlow = async (activity = makeVoicemailActivity()) => {
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

  const click = async (selector) => {
    const element = container.querySelector(selector);
    expect(element).not.toBeNull();
    await act(async () => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    return element;
  };

  const readSession = () =>
    JSON.parse(container.querySelector('[data-testid="session-state"]').textContent || "null");

  test("transfers selected setup values into the runtime route, UI, and session identity", async () => {
    await renderFlow();

    await click('[data-testid="difficulty-amber"]');
    await click('[data-testid="item-count-6"]');
    await click('[data-testid="question-count-4"]');

    expect(container.querySelector('[aria-label="Activity configuration summary"]').textContent)
      .toBe("6 voicemails · 4 questions each · English (UK/US) · Mixed Bag");

    await click('[data-testid="add-voicemail-to-session"]');
    await settle();

    let session = readSession();
    expect(session.activities).toHaveLength(1);
    expect(session.activities[0]).toMatchObject({
      category: "functional-communication",
      activity_slug: "voicemails",
      setup_config: {
        difficultyId: "amber",
        themePackId: "mixed-bag",
        languageId: "en",
        itemCount: 6,
        questionsPerVoicemail: 4,
      },
    });

    const startButton = container.querySelector('[data-testid="start-configured-voicemail"]');
    await act(async () => {
      startButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      startButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await settle();

    const runtimeChanges = getSearchChanges().filter((change) => change.params.letter);
    expect(runtimeChanges).toHaveLength(2);
    expect(runtimeChanges[0].params).toMatchObject({
      level: "amber",
      pack: "mixed-bag",
      language: "en",
      count: "6",
      questions: "4",
    });
    const recordedItemIds = runtimeChanges[0].params.items.split(",");
    expect(recordedItemIds).toHaveLength(6);
    expect(new Set(recordedItemIds).size).toBe(6);
    expect(recordedItemIds[0]).not.toBe("1");
    expect(runtimeChanges[0].params.letter).toBe(recordedItemIds[0]);
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Intermediate");
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Voicemail 1 of 6");
    expect(container.querySelector('[data-testid="reading-questions"]').children).toHaveLength(4);

    session = readSession();
    expect(session.activities.filter((item) => item.activity_slug === "voicemails")).toHaveLength(1);
    expect(
      session.activities.filter(
        (item) => item.activity_slug === `voicemails-amber-${recordedItemIds[0]}`,
      ),
    ).toHaveLength(1);
  });

  test("reconstructs runtime safely from the URL after refresh without route state", async () => {
    setInitialSearch("?level=red&pack=mixed-bag&language=en&count=2&questions=2&letter=1");

    await renderFlow();

    expect(container.querySelector('[data-testid="difficulty-picker"]')).toBeNull();
    expect(container.querySelector('[data-testid="level-pill"]').textContent).toContain("Complex");
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Voicemail 1 of 2");
    expect(container.querySelector('[data-testid="reading-questions"]').children).toHaveLength(2);
    expect(getSearchChanges()).toEqual([]);
  });

  test("reconstructs a recorded non-leading item order from the URL", async () => {
    setInitialSearch(
      "?level=green&pack=mixed-bag&language=en&count=3&questions=3&items=5,2,6&letter=2",
    );

    await renderFlow();

    expect(container.querySelector('[data-testid="voicemail-letterhead"]').textContent)
      .toContain("green caller 2");
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Voicemail 2 of 3");
    expect(getSearchChanges()).toEqual([]);
  });

  test("uses Voicemail wording in the completion replay action", async () => {
    setInitialSearch(
      "?level=green&pack=mixed-bag&language=en&count=2&questions=3&items=5,2&done=1",
    );

    await renderFlow();

    expect(container.querySelector('[data-testid="completion-replay"]').textContent)
      .toContain("Restart from Voicemail 1");
    expect(container.querySelector('[data-testid="completion-replay"]').textContent)
      .not.toContain("Letter");
  });

  test("presents a clean Extended option while identifying Phone menu in setup details", async () => {
    await renderFlow();

    await click('[data-testid="difficulty-pink"]');

    const pinkOption = container.querySelector('[data-testid="difficulty-pink"]');
    expect(pinkOption.textContent.trim()).toBe("Extended");
    expect(pinkOption.querySelector('[data-testid="phone-menu-mode-indicator"]')).toBeNull();
    expect(pinkOption.querySelector('[data-testid="complexity-dots-3"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="voicemail-setup-options"] [data-testid="phone-menu-mode-indicator"]'))
      .not.toBeNull();
  });

  test("returns incomplete runtime navigation to setup with its valid configuration preserved", async () => {
    setInitialSearch("?level=amber&pack=mixed-bag&language=en&count=6&questions=4");

    await renderFlow();

    expect(container.querySelector('[data-testid="difficulty-picker"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="difficulty-amber"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(container.querySelector('[data-testid="item-count-6"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(container.querySelector('[data-testid="question-count-4"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(container.querySelector('[data-testid="reading-questions"]')).toBeNull();
    expect(getSearchChanges()).toContainEqual({
      options: { replace: true },
      params: {},
    });
  });

  test("does not start a runtime or session when no voicemail items are available", async () => {
    await renderFlow(makeVoicemailActivity({ itemCount: 0 }));

    const startButton = container.querySelector('[data-testid="start-configured-voicemail"]');
    const sessionButton = container.querySelector('[data-testid="add-voicemail-to-session"]');
    expect(startButton.disabled).toBe(true);
    expect(sessionButton.disabled).toBe(true);

    startButton.click();
    sessionButton.click();
    await settle();

    expect(getSearchChanges()).toEqual([]);
    expect(readSession()).toBeNull();
    expect(container.querySelector('[data-testid="difficulty-picker"]')).not.toBeNull();
  });
});
