import React, { act } from "react";
import { createRoot } from "react-dom/client";

import ExplorePage from "./ExplorePage";
import { api } from "@/lib/api";
import {
  FAVOURITE_STORAGE_KEY,
  writeStoredFavourites,
} from "@/lib/activityFavourites";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");

    return {
      Link: ({ children, to, ...props }) =>
        React.createElement("a", { href: to, ...props }, children),
      useLocation: () => ({
        pathname: "/explore/favourites",
        search: "",
        hash: "",
      }),
      useNavigate: () => jest.fn(),
      useParams: () => ({ slug: "favourites" }),
    };
  },
  { virtual: true },
);

const activities = [
  {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
    description: "Listen to realistic voicemails and answer targeted questions.",
  },
  {
    category: "functional-communication",
    slug: "voicemails",
    title: "Listening to a Voicemail",
    description: "Duplicate API record that must not create another card.",
  },
  {
    category: "games",
    slug: "crossword",
    title: "Crossword",
    description: "Use clues to complete a themed crossword.",
  },
  {
    category: "word-finding",
    slug: "naming",
    title: "Name the Picture",
    description: "Look at a description and name the object.",
  },
];

const categories = [
  { slug: "functional-communication", name: "Functional Tasks" },
  { slug: "games", name: "Games" },
  { slug: "word-finding", name: "Word Finding" },
];

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
};

describe("Favourite Activities page", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    api.get.mockReset();
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

  const setStoredFavourites = (keys) => {
    window.localStorage.setItem(FAVOURITE_STORAGE_KEY, JSON.stringify(keys));
  };

  const mockSuccessfulLoad = (activityData = activities) => {
    api.get.mockImplementation((path) => {
      if (path === "/activities") return Promise.resolve({ data: activityData });
      if (path === "/categories") return Promise.resolve({ data: categories });
      return Promise.reject(new Error(`Unexpected API request: ${path}`));
    });
  };

  const renderPage = async () => {
    await act(async () => {
      root.render(<ExplorePage />);
    });
  };

  const settle = async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  const click = async (element) => {
    await act(async () => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  };

  test("loads the shared activity feed and renders each favourite once", async () => {
    const activityRequest = createDeferred();
    const categoryRequest = createDeferred();
    setStoredFavourites(["voicemails", "crossword", "voicemails"]);
    api.get.mockImplementation((path) => {
      if (path === "/activities") return activityRequest.promise;
      if (path === "/categories") return categoryRequest.promise;
      return Promise.reject(new Error(`Unexpected API request: ${path}`));
    });

    await renderPage();

    expect(container.textContent).toContain("Loading favourites...");
    expect(api.get.mock.calls).toEqual([["/activities"], ["/categories"]]);

    await act(async () => {
      activityRequest.resolve({ data: activities });
      categoryRequest.resolve({ data: categories });
      await Promise.all([activityRequest.promise, categoryRequest.promise]);
    });
    await settle();

    expect(container.querySelectorAll('[data-testid="activity-card-voicemails"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="activity-card-crossword"]')).toHaveLength(1);
    expect(container.querySelector('[data-testid="activity-card-naming"]')).toBeNull();
  });

  test("removes an unfavourited activity from the page immediately", async () => {
    setStoredFavourites(["voicemails"]);
    mockSuccessfulLoad();

    await renderPage();
    await settle();

    const removeButton = container.querySelector(
      '[aria-label="Remove from favourites: Listening to a Voicemail"]',
    );
    expect(removeButton).not.toBeNull();

    await click(removeButton);

    expect(container.querySelector('[data-testid="activity-card-voicemails"]')).toBeNull();
    expect(container.textContent).toContain("No favourite activities yet.");
    expect(JSON.parse(window.localStorage.getItem(FAVOURITE_STORAGE_KEY))).toEqual([]);
  });

  test("synchronizes when favourites change elsewhere in the app", async () => {
    setStoredFavourites(["voicemails"]);
    mockSuccessfulLoad();

    await renderPage();
    await settle();
    expect(container.querySelector('[data-testid="activity-card-voicemails"]')).not.toBeNull();

    await act(async () => {
      writeStoredFavourites(new Set(["crossword"]));
    });

    expect(container.querySelector('[data-testid="activity-card-voicemails"]')).toBeNull();
    expect(container.querySelector('[data-testid="activity-card-crossword"]')).not.toBeNull();
  });

  test("shows the empty state when no activities are favourited", async () => {
    mockSuccessfulLoad();

    await renderPage();
    await settle();

    expect(container.textContent).toContain("No favourite activities yet.");
    expect(container.textContent).toContain("Tap the heart on an activity card to save it here.");
    expect(container.querySelector('a[href="/all-activities"]')?.textContent).toBe(
      "Browse Activities Library",
    );
  });

  test("falls back to the existing empty state when activity loading fails", async () => {
    setStoredFavourites(["voicemails"]);
    api.get.mockImplementation((path) => {
      if (path === "/activities") return Promise.reject(new Error("Activity API unavailable"));
      if (path === "/categories") return Promise.resolve({ data: categories });
      return Promise.reject(new Error(`Unexpected API request: ${path}`));
    });

    await renderPage();
    await settle();

    expect(container.textContent).toContain("No favourite activities yet.");
    expect(container.querySelector('[data-testid="activity-card-voicemails"]')).toBeNull();
  });
});
