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
    LetterheadView: ({ letterhead, replayNonce = 0 }) =>
      React.createElement(
        "div",
        {
          "data-replay-nonce": replayNonce,
          "data-testid": "letterhead-view",
        },
        letterhead?.caller_name || "Reading material",
      ),
  };
});

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    let route = { category: "reading", slug: "receipt" };
    let currentLocation = {
      pathname: "/activity/reading/receipt",
      search: "",
      hash: "",
      state: null,
    };
    const navigate = jest.fn();

    const toSearchParams = (nextValue) => {
      if (nextValue instanceof URLSearchParams) {
        return new URLSearchParams(nextValue);
      }
      return new URLSearchParams(nextValue || {});
    };

    return {
      __navigate: navigate,
      __setRoute: ({ category, slug, search = "" }) => {
        route = { category, slug };
        currentLocation = {
          pathname: `/activity/${category}/${slug}`,
          search,
          hash: "",
          state: null,
        };
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
        const updateParams = React.useCallback((nextValue) => {
          const nextParams = toSearchParams(nextValue);
          const nextSearch = nextParams.toString();
          currentLocation = {
            ...currentLocation,
            search: nextSearch ? `?${nextSearch}` : "",
          };
          setParams(nextParams);
        }, []);

        return [params, updateParams];
      },
    };
  },
  { virtual: true },
);

const { __navigate: navigate, __setRoute: setRoute } = jest.requireMock("react-router-dom");

const receiptActivity = {
  slug: "receipt",
  title: "Reading a Receipt",
  summary: "Read a receipt and answer the questions.",
  type: "reading",
  content: {
    text: "Corner Shop receipt — total £12.50 — paid by card.",
    questions: [
      {
        q: "Which shop issued the receipt?",
        options: ["Corner Shop", "Parkside Pharmacy"],
        answer: 0,
      },
      {
        q: "What was the total?",
        options: ["£12.50", "£8.00"],
        answer: 0,
      },
      {
        q: "How was the receipt paid?",
        options: ["Card", "Cash"],
        answer: 0,
      },
    ],
  },
};

const phoneMenuOptions = [
  "Press 1",
  "Press 2",
  "Press 3",
  "Press 4",
  "Press 5",
  "Stay on the line",
  "Hang up",
];

const phoneMenuActivity = {
  slug: "voicemails",
  title: "Listening to a Voicemail",
  summary: "Listen to phone menus and choose the right action.",
  type: "reading-leveled",
  content: {
    levels: {
      pink: {
        key: "pink",
        title: "Extended",
        item_label_singular: "Phone menu",
        item_label_plural: "phone menus",
        letters: [
          {
            id: 1,
            title: "Service Phone Menu",
            text: "Automated service phone menu",
            letterhead: {
              format: "phone-menu",
              caller_name: "Community Services",
              audio_url: "/phone-menu.mp3",
            },
            questions: [
              {
                q: "Which number reaches appointments?",
                options: phoneMenuOptions,
                answer: 1,
                replay_key: "5",
              },
              {
                q: "What should you do for an urgent issue?",
                options: phoneMenuOptions,
                answer: 5,
              },
              {
                q: "What should you do if no option applies?",
                options: phoneMenuOptions,
                answer: 6,
              },
              {
                q: "Which number reaches test results?",
                options: phoneMenuOptions,
                answer: 2,
              },
            ],
          },
        ],
      },
    },
  },
};

function SessionProbe() {
  const { active } = useSession();
  return <output data-testid="session-state">{JSON.stringify(active)}</output>;
}

describe("ActivityPage shared reading renderer", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    api.get.mockReset();
    navigate.mockClear();
    setRoute({ category: "reading", slug: "receipt" });
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem(
      "concentric_active_session_v1",
      JSON.stringify({
        started_at: "2026-01-01T12:00:00.000Z",
        activities: [],
        attempts: [],
        cues: [],
      }),
    );
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

  const renderActivity = async (activity) => {
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

  test("protects receipt text entry, hints, option submission, locking, and session payloads", async () => {
    await renderActivity(receiptActivity);

    expect(container.querySelector('[data-testid="reading-text"]').textContent)
      .toContain("Corner Shop receipt");
    expect(container.querySelector('[data-testid="reading-questions"]').children).toHaveLength(3);

    await enterText('[data-testid="question-0-input"]', "Corner Shop");
    await click('[data-testid="question-0-submit"]');

    expect(container.querySelector('[data-testid="question-0-input"]').disabled).toBe(true);
    expect(container.querySelector('[data-testid="question-0-submit"]').disabled).toBe(true);

    await enterText('[data-testid="question-1-input"]', "£8.00");
    await pressEnter('[data-testid="question-1-input"]');

    expect(container.querySelector('[data-testid="question-1"]').textContent)
      .toContain("Correct answer: £12.50");

    await click('[data-testid="question-2-show-hint"]');
    expect(container.querySelector('[data-testid="question-2-hints"]')).not.toBeNull();
    await click('[data-testid="question-2-option-0"]');

    expect(container.querySelector('[data-testid="question-2-option-0"]').disabled).toBe(true);
    expect(container.querySelector('[data-testid="question-2-option-0"]').textContent)
      .toContain("Card");

    await pressEnter('[data-testid="question-0-input"]');

    const session = readSession();
    expect(session.attempts).toHaveLength(3);
    expect(session.attempts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        activity_slug: "receipt",
        activity_title: "Reading a Receipt",
        category: "reading",
        qid: "q0",
        correct: true,
        picked: "Corner Shop",
        expected: "Corner Shop",
      }),
      expect.objectContaining({
        activity_slug: "receipt",
        activity_title: "Reading a Receipt",
        category: "reading",
        qid: "q1",
        correct: false,
        picked: "£8.00",
        expected: "£12.50",
      }),
      expect.objectContaining({
        activity_slug: "receipt",
        activity_title: "Reading a Receipt",
        category: "reading",
        qid: "q2",
        correct: true,
        picked: "Card",
        expected: "Card",
      }),
    ]));
    expect(session.cues).toEqual([
      expect.objectContaining({
        activity_slug: "receipt",
        activity_title: "Reading a Receipt",
        category: "reading",
        cue_type: "hint",
        detail: "q2",
      }),
    ]);
  });

  test("protects phone-menu keypad actions, replay propagation, feedback, locking, and attempts", async () => {
    setRoute({
      category: "functional-communication",
      slug: "voicemails",
      search: "?level=pink&pack=mixed-bag&language=en&count=1&questions=5&letter=1",
    });
    await renderActivity(phoneMenuActivity);

    expect(container.querySelector('[data-testid="reading-phone-menu"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-testid^="question-0-keypad-"]')).toHaveLength(14);
    expect(container.querySelector('[data-testid="letterhead-view"]').dataset.replayNonce).toBe("0");

    await click('[data-testid="question-0-keypad-5"]');

    expect(container.querySelector('[data-testid="letterhead-view"]').dataset.replayNonce).toBe("1");
    expect(container.querySelector('[data-testid="question-0-keypad-2"]').disabled).toBe(false);
    expect(readSession().attempts).toHaveLength(0);

    await click('[data-testid="question-0-keypad-2"]');
    expect(container.querySelector('[data-testid="question-0"]').textContent)
      .toContain("Correct — Press 2");
    expect(
      Array.from(container.querySelectorAll('[data-testid^="question-0-keypad-"]'))
        .every((button) => button.disabled),
    ).toBe(true);

    await click('[data-testid="question-1-keypad-stay"]');
    expect(container.querySelector('[data-testid="question-1"]').textContent)
      .toContain("Correct — Stay on the line");

    await click('[data-testid="question-2-keypad-hang"]');
    expect(container.querySelector('[data-testid="question-2"]').textContent)
      .toContain("Correct — Hang up");

    await click('[data-testid="question-3-keypad-hang"]');
    expect(container.querySelector('[data-testid="question-3"]').textContent)
      .toContain("The correct answer was Press 3");

    const session = readSession();
    expect(session.attempts).toHaveLength(4);
    expect(session.attempts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        activity_slug: "voicemails-pink-1",
        activity_title: "Listening to a Voicemail — Extended · Service Phone Menu",
        category: "functional-communication",
        qid: "q0",
        correct: true,
        picked: "Press 2",
        expected: "Press 2",
      }),
      expect.objectContaining({ qid: "q1", correct: true, picked: "Stay on the line" }),
      expect.objectContaining({ qid: "q2", correct: true, picked: "Hang up" }),
      expect.objectContaining({
        qid: "q3",
        correct: false,
        picked: "Hang up",
        expected: "Press 3",
      }),
    ]));
  });
});
