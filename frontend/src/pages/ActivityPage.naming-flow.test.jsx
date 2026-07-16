import React, { act } from "react";
import { createRoot } from "react-dom/client";

import ActivityPage from "./ActivityPage";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock("@/components/AudioControls", () => {
  const React = require("react");

  return {
    AudioControls: ({ text, audioSrc, onTranscript }) =>
      React.createElement(
        "div",
        {
          "data-audio-src": audioSrc || "",
          "data-audio-text": text,
          "data-testid": "audio-controls",
        },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => onTranscript?.("spoken response"),
            "data-testid": "record-response",
          },
          "Record response",
        ),
      ),
  };
});

jest.mock("@/contexts/SessionContext", () => {
  const logActivity = jest.fn();
  const logCue = jest.fn();

  return {
    __logActivity: logActivity,
    __logCue: logCue,
    useSession: () => ({ logActivity, logCue }),
  };
});

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    const route = { category: "word-finding", slug: "naming" };
    const location = {
      pathname: "/activity/word-finding/naming",
      search: "",
      hash: "",
      state: null,
    };
    const navigate = jest.fn();

    return {
      __navigate: navigate,
      Link: ({ children, to, ...props }) =>
        React.createElement("a", { href: to, ...props }, children),
      Navigate: ({ to }) => React.createElement("span", { "data-navigate-to": to }),
      useLocation: () => location,
      useNavigate: () => navigate,
      useParams: () => route,
      useSearchParams: () => {
        const [params, setParams] = React.useState(() => new URLSearchParams());
        return [params, setParams];
      },
    };
  },
  { virtual: true },
);

const {
  __logActivity: logActivity,
  __logCue: logCue,
} = jest.requireMock("@/contexts/SessionContext");

const namingActivity = {
  slug: "naming",
  title: "Name the Picture",
  summary: "Name each item from its description.",
  category: "word-finding",
  type: "naming",
  content: {
    items: [
      { clue: "You wear this on your head when it is sunny.", answer: "hat" },
      { clue: "You sit on this at a table.", answer: "chair" },
      { clue: "You drink hot coffee from this.", answer: "mug" },
    ],
  },
};

describe("ActivityPage Naming activity", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    api.get.mockReset();
    logActivity.mockClear();
    logCue.mockClear();
    window.localStorage.clear();
    window.sessionStorage.clear();
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

  const renderNaming = async () => {
    api.get.mockResolvedValue({ data: namingActivity });
    await act(async () => {
      root.render(<ActivityPage />);
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
  };

  const exerciseText = () =>
    container.querySelector('[data-testid="naming-exercise"]').textContent;

  const audioControls = () =>
    container.querySelector('[data-testid="audio-controls"]');

  test("renders the direct route, reveals the answer, displays a transcript, and logs the cue", async () => {
    await renderNaming();

    expect(api.get).toHaveBeenCalledWith("/activities/word-finding/naming");
    expect(logActivity).toHaveBeenCalledWith({
      category: "word-finding",
      activity_slug: "naming",
      activity_title: "Name the Picture",
    });
    expect(container.querySelector('[data-testid="activity-title"]').textContent)
      .toBe("Name the Picture");
    expect(exerciseText()).toContain("1 of 3");
    expect(exerciseText()).toContain("You wear this on your head when it is sunny.");
    expect(audioControls().dataset.audioText)
      .toBe("You wear this on your head when it is sunny.");
    expect(audioControls().dataset.audioSrc)
      .toBe("/audio/G01_GP_Appointment_Reminder.mp3");

    await click('[data-testid="record-response"]');
    expect(container.querySelector('[data-testid="naming-transcript"]').textContent)
      .toContain("You said: spoken response");

    await click('[data-testid="naming-reveal-btn"]');
    expect(exerciseText()).toContain("Answer: hat");
    expect(container.querySelector('[data-testid="naming-reveal-btn"]').textContent)
      .toBe("Hide answer");
    expect(logCue).toHaveBeenCalledTimes(1);
    expect(logCue).toHaveBeenCalledWith({
      activity_slug: "naming",
      activity_title: "Name the Picture",
      category: "word-finding",
      cue_type: "show_answer",
      detail: "hat",
    });

    await click('[data-testid="naming-reveal-btn"]');
    expect(exerciseText()).not.toContain("Answer: hat");
    expect(container.querySelector('[data-testid="naming-reveal-btn"]').textContent)
      .toBe("Show answer");
    expect(logCue).toHaveBeenCalledTimes(1);
  });

  test("progresses through items, resets item state, and cycles after the final item", async () => {
    await renderNaming();

    await click('[data-testid="record-response"]');
    await click('[data-testid="naming-reveal-btn"]');
    await click('[data-testid="naming-next-btn"]');

    expect(exerciseText()).toContain("2 of 3");
    expect(exerciseText()).toContain("You sit on this at a table.");
    expect(exerciseText()).not.toContain("Answer:");
    expect(container.querySelector('[data-testid="naming-transcript"]')).toBeNull();
    expect(container.querySelector('[data-testid="naming-reveal-btn"]').textContent)
      .toBe("Show answer");
    expect(audioControls().dataset.audioText).toBe("You sit on this at a table.");
    expect(audioControls().dataset.audioSrc).toBe("");

    await click('[data-testid="naming-reveal-btn"]');
    expect(exerciseText()).toContain("Answer: chair");
    await click('[data-testid="naming-next-btn"]');

    expect(exerciseText()).toContain("3 of 3");
    expect(exerciseText()).toContain("You drink hot coffee from this.");
    expect(exerciseText()).not.toContain("Answer:");
    expect(audioControls().dataset.audioSrc).toBe("");

    await click('[data-testid="record-response"]');
    await click('[data-testid="naming-reveal-btn"]');
    expect(exerciseText()).toContain("Answer: mug");
    await click('[data-testid="naming-next-btn"]');

    expect(exerciseText()).toContain("1 of 3");
    expect(exerciseText()).toContain("You wear this on your head when it is sunny.");
    expect(exerciseText()).not.toContain("Answer:");
    expect(container.querySelector('[data-testid="naming-transcript"]')).toBeNull();
    expect(audioControls().dataset.audioSrc)
      .toBe("/audio/G01_GP_Appointment_Reminder.mp3");
    expect(logCue.mock.calls.map(([cue]) => cue.detail)).toEqual(["hat", "chair", "mug"]);
  });
});
