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

  const finishLevelTransition = async () => {
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 120));
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
    await settle();
    return input;
  };

  const pressEnter = async (selector) => {
    const input = container.querySelector(selector);
    expect(input).not.toBeNull();
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
      }));
    });
    await settle();
  };

  const readSession = () =>
    JSON.parse(container.querySelector('[data-testid="session-state"]').textContent || "null");

  test("transfers selected setup values into the runtime route and UI", async () => {
    await renderFlow();

    await click('[data-testid="difficulty-amber"]');
    await finishLevelTransition();
    await click('[data-testid="item-count-6"]');
    await click('[data-testid="question-count-4"]');

    expect(Array.from(
      container.querySelectorAll(".voicemail-setup-summary-line"),
      (line) => line.textContent,
    )).toEqual([
      "6 voicemails · 4 questions each · English (UK/US) · Mixed Bag",
    ]);
    expect(container.querySelector('[data-testid="add-voicemail-to-session"]')).toBeNull();
    expect(readSession()).toBeNull();

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
    expect(runtimeChanges[0].params.seed).toMatch(/^v1-/);
    expect(runtimeChanges[0].params).not.toHaveProperty("interaction");
    expect(runtimeChanges[1].params.seed).toBe(runtimeChanges[0].params.seed);
    const recordedItemIds = runtimeChanges[0].params.items.split(",");
    expect(recordedItemIds).toHaveLength(6);
    expect(new Set(recordedItemIds).size).toBe(6);
    expect(runtimeChanges[0].params.letter).toBe(recordedItemIds[0]);
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Intermediate");
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Voicemail 1 of 6");
    expect(container.querySelector('[data-testid="reading-questions"]').children).toHaveLength(1);
    expect(container.querySelector('[data-testid="voicemail-question-progress"]').getAttribute("aria-label"))
      .toBe("1 of 4 questions");

    const firstPrompt = container.querySelector('[data-testid="question-0-prompt"]').textContent;
    await enterText('[data-testid="question-0-input"]', "Correct");
    await pressEnter('[data-testid="question-0-input"]');

    expect(container.querySelector('[data-testid="question-0-input"]').disabled).toBe(true);
    expect(container.querySelector('[data-testid="question-0-feedback"]').textContent)
      .toContain("Correct");

    await click('[data-testid="question-0-submit"]');
    await settle();

    expect(container.querySelector('[data-testid="question-0"]')).toBeNull();
    expect(container.querySelector('[data-testid="question-1-prompt"]').textContent)
      .not.toBe(firstPrompt);
    expect(container.querySelector('[data-testid="voicemail-question-progress"]').getAttribute("aria-label"))
      .toBe("2 of 4 questions");

  });

  test("adapts Extended setup without losing the standard question choice", async () => {
    await renderFlow();

    const foundationalFocus = container.querySelector('[aria-label="Focus"]');
    expect(container.querySelector('[data-testid="voicemail-setup-options"]').textContent)
      .not.toContain("Suited to");
    expect(Array.from(foundationalFocus.querySelectorAll(".focus-tag"), (tag) => tag.textContent))
      .toEqual(["Auditory comprehension", "Immediate recall", "Functional listening"]);

    await click('[data-testid="item-count-6"]');
    await click('[data-testid="question-count-5"]');
    await click('[data-testid="difficulty-pink"]');
    await finishLevelTransition();

    const setupOptions = container.querySelector('[data-testid="voicemail-setup-options"]');
    const settingsStack = setupOptions.querySelector(".voicemail-settings-stack");
    expect(settingsStack.querySelector(".voicemail-expanded-controls")).not.toBeNull();
    expect(settingsStack.querySelector('[aria-label="Activity configuration summary"]'))
      .not.toBeNull();
    expect(Array.from(setupOptions.querySelectorAll("legend"), (legend) => legend.textContent))
      .toEqual(["Phone menus", "Interaction"]);
    expect(setupOptions.querySelector('[data-testid="question-count-5"]')).toBeNull();
    expect(Array.from(
      setupOptions.querySelectorAll(".voicemail-setup-summary-line"),
      (line) => line.textContent,
    )).toEqual([
      "6 phone menus · Single decision · English (UK/US) · Mixed Bag",
    ]);
    expect(setupOptions.querySelector('[data-testid="interaction-single"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(setupOptions.querySelector(".voicemail-setup-footer-copy")).toBeNull();
    expect(setupOptions.querySelector(".voicemail-interaction-description")).toBeNull();
    const helpTrigger = setupOptions.querySelector('[data-testid="interaction-help-trigger"]');
    expect(helpTrigger.getAttribute("aria-label")).toBe("About interaction options");
    expect(helpTrigger.getAttribute("aria-expanded")).toBe("false");

    await act(async () => {
      helpTrigger.focus();
    });
    await settle();
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    const helpPopover = document.querySelector('[data-testid="interaction-help-popover"]');
    expect(helpTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(helpPopover.getAttribute("aria-label")).toBe("Interaction options");
    expect(helpPopover.textContent).toContain(
      "Single decisionOne menu choice to reach the correct service.",
    );
    expect(helpPopover.textContent).toContain(
      "Multiple decisionsNavigate through several menu levels before reaching the correct service.",
    );

    await act(async () => {
      helpPopover.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        bubbles: true,
      }));
    });
    await settle();
    expect(document.querySelector('[data-testid="interaction-help-popover"]')).toBeNull();
    expect(helpTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(Array.from(
      setupOptions.querySelectorAll('[aria-label="Focus"] .focus-tag'),
      (tag) => tag.textContent,
    )).toEqual(["Phone navigation", "Auditory scanning", "Decision making"]);

    await click('[data-testid="interaction-multiple"]');

    expect(setupOptions.querySelector('[data-testid="interaction-multiple"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(setupOptions.querySelector('[data-testid="voicemail-interaction-unavailable"]').textContent)
      .toBe("Multiple-interaction voicemails are not available yet.");
    expect(setupOptions.querySelector('[data-testid="start-configured-voicemail"]').disabled)
      .toBe(true);
    expect(Array.from(
      setupOptions.querySelectorAll(".voicemail-setup-summary-line"),
      (line) => line.textContent,
    )).toEqual([
      "0 phone menus · Multiple decisions · English (UK/US) · Mixed Bag",
    ]);

    await click('[data-testid="start-configured-voicemail"]');
    await settle();
    expect(getSearchChanges()).toEqual([]);

    await click('[data-testid="difficulty-amber"]');
    await finishLevelTransition();

    expect(setupOptions.querySelector('[data-testid="question-count-5"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(Array.from(
      setupOptions.querySelectorAll(".voicemail-setup-summary-line"),
      (line) => line.textContent,
    )).toEqual([
      "6 voicemails · 5 questions each · English (UK/US) · Mixed Bag",
    ]);
    expect(setupOptions.querySelector('[data-testid^="interaction-"]')).toBeNull();
    expect(setupOptions.querySelector(".voicemail-setup-footer-row")).not.toBeNull();

    await click('[data-testid="difficulty-pink"]');
    await finishLevelTransition();
    expect(setupOptions.querySelector('[data-testid="interaction-multiple"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(setupOptions.querySelector('[data-testid="add-voicemail-to-session"]')).toBeNull();
    expect(setupOptions.querySelector('[data-testid="start-configured-voicemail"]').disabled)
      .toBe(true);

    await click('[data-testid="interaction-single"]');
    expect(setupOptions.querySelector('[data-testid="voicemail-interaction-unavailable"]'))
      .toBeNull();
    expect(setupOptions.querySelector('[data-testid="start-configured-voicemail"]').disabled)
      .toBe(false);
    await click('[data-testid="start-configured-voicemail"]');
    await settle();

    const runtimeChange = getSearchChanges().find((change) => change.params.letter);
    expect(runtimeChange.params).toMatchObject({
      level: "pink",
      count: "6",
      interaction: "single",
    });
    expect(runtimeChange.params).not.toHaveProperty("questions");
  });

  test("reconstructs runtime safely from the URL after refresh without route state", async () => {
    setInitialSearch("?level=red&pack=mixed-bag&language=en&count=2&questions=2&letter=1");

    await renderFlow();

    expect(container.querySelector('[data-testid="difficulty-picker"]')).toBeNull();
    expect(container.querySelector('[data-testid="level-pill"]').textContent).toContain("Complex");
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Voicemail 1 of 2");
    expect(container.querySelector('[data-testid="reading-questions"]').children).toHaveLength(1);
    expect(getSearchChanges()).toEqual([]);
  });

  test("does not reconstruct multiple interaction runtime from single interaction content", async () => {
    const activity = makeVoicemailActivity();
    activity.content.levels.pink.letters.forEach((item) => {
      item.letterhead.format = "phone-menu";
      item.questions = item.questions.slice(0, 1);
    });
    setInitialSearch(
      "?level=pink&pack=mixed-bag&language=en&count=2&questions=5&interaction=multiple&seed=pink-direct&items=3,2&letter=3",
    );

    await renderFlow(activity);
    await settle();

    expect(container.querySelector('[data-testid="difficulty-picker"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="reading-questions"]')).toBeNull();
    expect(container.querySelector('[data-testid="interaction-multiple"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(container.querySelector('[data-testid="voicemail-interaction-unavailable"]').textContent)
      .toBe("Multiple-interaction voicemails are not available yet.");
    expect(getSearchChanges()).toContainEqual({
      options: { replace: true },
      params: {},
    });
  });

  test("reconstructs a recorded non-leading item order from the URL", async () => {
    setInitialSearch(
      "?level=green&pack=mixed-bag&language=en&count=3&questions=3&seed=direct-seed&items=5,2,6&letter=2",
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

  test("keeps Voicemail-specific runtime copy when optional item labels are absent", async () => {
    const activity = makeVoicemailActivity();
    delete activity.content.levels.green.item_label_singular;
    delete activity.content.levels.green.item_label_plural;
    setInitialSearch(
      "?level=green&pack=mixed-bag&language=en&count=2&questions=3&seed=copy-seed&items=5,2&letter=5",
    );

    await renderFlow(activity);

    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .toContain("Voicemail 1 of 2");
    expect(container.querySelector('[data-testid="level-pill"]').textContent)
      .not.toContain("Letter");
    for (let questionIndex = 0; questionIndex < 3; questionIndex += 1) {
      await enterText(`[data-testid="question-${questionIndex}-input"]`, "Correct");
      await pressEnter(`[data-testid="question-${questionIndex}-input"]`);
      if (questionIndex < 2) {
        await click(`[data-testid="question-${questionIndex}-submit"]`);
        await settle();
      }
    }
    expect(container.querySelector('[aria-label="Next voicemail"]')).not.toBeNull();
  });

  test("presents Extended with matching complexity dots in the option and setup header", async () => {
    await renderFlow();

    const foundationalDot = container.querySelector(
      '[data-testid="difficulty-green"] [data-testid="complexity-dots-1"] span',
    );
    expect(foundationalDot.style.boxShadow).not.toBe("");

    const setupOptions = container.querySelector('[data-testid="voicemail-setup-options"]');
    const setupContent = setupOptions.querySelector('[data-content-key="green"]');
    const setupControls = setupOptions.querySelector(".voicemail-level-controls-transition");
    const setupFooter = setupOptions.querySelector(".voicemail-setup-footer-transition");
    const greenAnchor = setupOptions.querySelector(
      '[data-testid="voicemail-expanded-complexity-anchor"]',
    );
    expect(greenAnchor.querySelector('[data-testid="complexity-dots-1"]')).not.toBeNull();
    await click('[data-testid="difficulty-pink"]');

    const pinkOption = container.querySelector('[data-testid="difficulty-pink"]');
    expect(pinkOption.textContent.trim()).toBe("Extended");
    expect(pinkOption.querySelector('[data-testid="phone-menu-mode-indicator"]')).toBeNull();
    expect(pinkOption.querySelector('[data-testid="complexity-dots-3"]')).not.toBeNull();
    const pinkDot = pinkOption.querySelector('[data-testid="complexity-dots-3"] span');
    expect(pinkDot.style.boxShadow).toContain("0 0 6px");
    expect(container.querySelector('[data-testid="voicemail-setup-options"]')).toBe(setupOptions);
    expect(setupContent.getAttribute("data-transition-state")).toBe("exiting");
    expect(setupControls.getAttribute("data-transition-state")).toBe("exiting");
    expect(setupFooter.getAttribute("data-transition-state")).toBe("exiting");
    expect(Array.from(setupControls.querySelectorAll("legend"), (legend) => legend.textContent))
      .toEqual(["Number of voicemails", "Questions per voicemail"]);

    await finishLevelTransition();

    expect(setupOptions.querySelector('[data-content-key="pink"]')).not.toBeNull();
    expect(
      Array.from(
        setupOptions.querySelectorAll(".voicemail-level-controls-transition legend"),
        (legend) => legend.textContent,
      ),
    ).toEqual(["Phone menus", "Interaction"]);
    expect(setupOptions.querySelector('[data-testid="phone-menu-mode-indicator"]')).toBeNull();
    expect(setupOptions.querySelector('[data-testid="complexity-dots-3"]')).not.toBeNull();
    const pinkAnchor = setupOptions.querySelector(
      '[data-testid="voicemail-expanded-complexity-anchor"]',
    );
    expect(pinkAnchor.querySelector('[data-testid="complexity-dots-3"]')).not.toBeNull();
  });

  test("settles rapid level changes on the latest selected content without remounting the panel", async () => {
    await renderFlow();

    const setupOptions = container.querySelector('[data-testid="voicemail-setup-options"]');
    await click('[data-testid="difficulty-amber"]');
    await click('[data-testid="difficulty-pink"]');

    expect(container.querySelector('[data-testid="voicemail-setup-options"]')).toBe(setupOptions);
    expect(setupOptions.querySelector(".voicemail-expanded-content").dataset.contentKey)
      .toBe("green");

    await finishLevelTransition();

    expect(setupOptions.querySelector(".voicemail-expanded-content").dataset.contentKey)
      .toBe("pink");
    expect(setupOptions.querySelector(".voicemail-expanded-title strong").textContent)
      .toBe("Extended");
    expect(Array.from(
      setupOptions.querySelectorAll(".voicemail-level-controls-transition legend"),
      (legend) => legend.textContent,
    )).toEqual(["Phone menus", "Interaction"]);
  });

  test("switches level content immediately when reduced motion is preferred", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    try {
      await renderFlow();
      await click('[data-testid="difficulty-pink"]');

      const setupOptions = container.querySelector('[data-testid="voicemail-setup-options"]');
      expect(setupOptions.querySelector(".voicemail-expanded-content").dataset.contentKey)
        .toBe("pink");
      expect(setupOptions.querySelector(".voicemail-expanded-content").dataset.transitionState)
        .toBe("stable");
      expect(Array.from(
        setupOptions.querySelectorAll(".voicemail-level-controls-transition legend"),
        (legend) => legend.textContent,
      )).toEqual(["Phone menus", "Interaction"]);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
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

  test("returns incomplete Extended navigation to its question-free setup", async () => {
    setInitialSearch(
      "?level=pink&pack=mixed-bag&language=en&count=6&questions=5&interaction=multiple",
    );

    await renderFlow();

    expect(container.querySelector('[data-testid="difficulty-picker"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="difficulty-pink"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(container.querySelector('[data-testid="item-count-6"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(container.querySelector('[data-testid^="question-count-"]')).toBeNull();
    expect(container.querySelector('[data-testid="interaction-multiple"]').getAttribute("aria-checked"))
      .toBe("true");
    expect(container.querySelector(".voicemail-interaction-description")).toBeNull();
    expect(Array.from(
      container.querySelectorAll(".voicemail-setup-summary-line"),
      (line) => line.textContent,
    )).toEqual([
      "0 phone menus · Multiple decisions · English (UK/US) · Mixed Bag",
    ]);
    expect(container.querySelector('[data-testid="voicemail-interaction-unavailable"]').textContent)
      .toBe("Multiple-interaction voicemails are not available yet.");
    expect(container.querySelector('[data-testid="start-configured-voicemail"]').disabled)
      .toBe(true);
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
    expect(sessionButton).toBeNull();

    startButton.click();
    await settle();

    expect(getSearchChanges()).toEqual([]);
    expect(readSession()).toBeNull();
    expect(container.querySelector('[data-testid="difficulty-picker"]')).not.toBeNull();
  });
});
