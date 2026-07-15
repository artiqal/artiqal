import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { ActivityCard } from "./ActivityCard";
import { FAVOURITE_STORAGE_KEY } from "@/lib/activityFavourites";

jest.mock(
  "react-router-dom",
  () => {
    const navigate = jest.fn();
    return {
      __navigate: navigate,
      useLocation: () => ({
        pathname: "/all-activities",
        search: "?search=voice",
        hash: "",
      }),
      useNavigate: () => navigate,
    };
  },
  { virtual: true },
);

const { __navigate: navigate } = jest.requireMock("react-router-dom");

const voicemailActivity = {
  category: "functional-communication",
  slug: "voicemails",
  title: "Listening to a Voicemail",
};

describe("ActivityCard shared interactions", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    navigate.mockClear();
    window.localStorage.clear();
    window.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
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

  async function renderCard(children) {
    await act(async () => {
      root.render(children);
    });
  }

  async function click(element) {
    await act(async () => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  test("only Start navigates and preserves the source location", async () => {
    await renderCard(<ActivityCard activity={voicemailActivity} />);

    const title = container.querySelector(".cat-card-title");

    await click(title);
    expect(navigate).not.toHaveBeenCalled();

    await click(container.querySelector('[aria-label="Start Listening to a Voicemail"]'));

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      "/activity/functional-communication/voicemails",
      {
        state: {
          from: {
            pathname: "/all-activities",
            search: "?search=voice",
            hash: "",
          },
        },
      },
    );
  });

  test("information panel closes with Escape and an outside click", async () => {
    await renderCard(<ActivityCard activity={voicemailActivity} />);

    const trigger = container.querySelector(
      '[aria-label="About this activity: Listening to a Voicemail"]',
    );

    await click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain("Auditory comprehension, verbal memory and functional listening");

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await click(trigger);
    await act(async () => {
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  test("favourite changes persist and synchronize across shared card instances", async () => {
    await renderCard(
      <>
        <ActivityCard activity={voicemailActivity} />
        <ActivityCard activity={voicemailActivity} />
      </>,
    );

    const favouriteButtons = Array.from(container.querySelectorAll(".cat-card-favourite"));
    expect(favouriteButtons).toHaveLength(2);
    expect(favouriteButtons.map((button) => button.getAttribute("aria-pressed"))).toEqual([
      "false",
      "false",
    ]);

    await click(favouriteButtons[0]);
    expect(favouriteButtons.map((button) => button.getAttribute("aria-pressed"))).toEqual([
      "true",
      "true",
    ]);
    expect(JSON.parse(window.localStorage.getItem(FAVOURITE_STORAGE_KEY))).toEqual(["voicemails"]);

    await click(favouriteButtons[1]);
    expect(favouriteButtons.map((button) => button.getAttribute("aria-pressed"))).toEqual([
      "false",
      "false",
    ]);
    expect(JSON.parse(window.localStorage.getItem(FAVOURITE_STORAGE_KEY))).toEqual([]);
  });
});
