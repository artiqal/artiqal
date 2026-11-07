import React, { act } from "react";
import { createRoot } from "react-dom/client";

import ActivityPage from "./ActivityPage";
import { api } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock("@/lib/navigationHistory", () => ({
  useSmartBack: () => jest.fn(),
}));

jest.mock("@/contexts/SessionContext", () => ({
  useSession: jest.fn(),
}));

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    const navigate = jest.fn();

    return {
      __navigate: navigate,
      Link: ({ children, to, ...props }) =>
        React.createElement("a", { href: to, ...props }, children),
      Navigate: ({ to }) => React.createElement("span", { "data-navigate-to": to }),
      useNavigate: () => navigate,
      useParams: () => ({ category: "games", slug: "crossword" }),
      useSearchParams: () => [new URLSearchParams(), jest.fn()],
    };
  },
  { virtual: true },
);

const crosswordActivity = {
  category: "games",
  slug: "crossword",
  title: "Crossword",
  summary: "Use clues to complete a themed crossword.",
  type: "game",
  content: {},
};

describe("Crossword settings-to-runtime flow", () => {
  let container;
  let root;
  let start;
  let logActivity;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    api.get.mockReset();
    api.get.mockResolvedValue({ data: crosswordActivity });
    start = jest.fn();
    logActivity = jest.fn();
    useSession.mockReturnValue({
      isActive: false,
      start,
      logActivity,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const click = async (selector) => {
    const element = container.querySelector(selector);
    expect(element).not.toBeNull();
    await act(async () => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  };

  const select = async (selector, value) => {
    const element = container.querySelector(selector);
    expect(element).not.toBeNull();
    await act(async () => {
      const valueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value",
      ).set;
      valueSetter.call(element, value);
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
  };

  test("presents every existing crossword type in one settings control without removing settings", async () => {
    await act(async () => {
      root.render(<ActivityPage />);
      await Promise.resolve();
    });

    const expectedTypes = [
      "Semantic Feature Analysis (Picture Based)",
      "Descriptions",
      "Synonyms",
      "Antonyms",
      "Categories",
      "Functional Vocabulary",
      "Personalised Words",
    ];
    const typeSelect = container.querySelector('[data-testid="crossword-type-select"]');
    const typeOptions = Array.from(typeSelect.options);
    expect(typeOptions.map((option) => option.textContent.trim())).toEqual(expectedTypes);
    expect(
      container.querySelector('[data-testid="activity-page"]').classList.contains("activity-page-fit-content"),
    ).toBe(true);
    expect(container.querySelector(".crossword-type-selector")).toBeNull();
    expect(container.querySelectorAll('[data-testid="crossword-type-select"]')).toHaveLength(1);

    for (const type of expectedTypes) {
      await select('[data-testid="crossword-type-select"]', type);
      expect(typeSelect.value).toBe(type);
    }

    expect(container.querySelector(".crossword-settings-card-title h2").textContent).toBe("Crossword");
    expect(container.querySelector('[data-testid="crossword-word-set-select"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Number of crosswords"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Response mode"]')).not.toBeNull();
    expect(container.querySelector(".crossword-start-btn").textContent).toContain("Start activity");
  });

  test("preserves selected settings when starting the featured crossword and adds it to the session", async () => {
    await act(async () => {
      root.render(<ActivityPage />);
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="crossword-settings-page"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="crossword-count-2"]').getAttribute("aria-pressed"))
      .toBe("true");

    await click('[data-testid="crossword-count-1"]');
    await click('[data-testid="crossword-response-word-bank"]');
    await click(".crossword-start-btn");

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(start).toHaveBeenCalledTimes(1);
    expect(logActivity).toHaveBeenCalledWith({
      category: "games",
      activity_slug: "crossword",
      activity_title: "Crossword",
    });
    expect(container.querySelector('[data-testid="crossword-active-page"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="interactive-crossword-soccer-football-match"]'))
      .not.toBeNull();
    expect(container.querySelector('[aria-label="Word bank"]')).not.toBeNull();
    expect(container.querySelector(".crossword-grid input").disabled).toBe(false);
  });
});
