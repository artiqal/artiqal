import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { SessionProvider, useSession } from "./SessionContext";

const baseActivity = {
  category: "functional-communication",
  activity_slug: "voicemails",
  title: "Listening to a Voicemail",
  setup_config: {
    difficultyId: "amber",
    themePackId: "mixed-bag",
    languageId: "en",
    itemCount: 4,
    questionsPerVoicemail: 3,
  },
};

const distinctActivity = {
  ...baseActivity,
  setup_config: {
    ...baseActivity.setup_config,
    questionsPerVoicemail: 5,
  },
};

function SessionHarness() {
  const { active, logActivity, start } = useSession();

  return (
    <>
      <button type="button" data-action="start" onClick={start}>Start session</button>
      <button type="button" data-action="add-base" onClick={() => logActivity(baseActivity)}>
        Add base
      </button>
      <button type="button" data-action="add-distinct" onClick={() => logActivity(distinctActivity)}>
        Add distinct
      </button>
      <output data-testid="activities">{JSON.stringify(active?.activities || [])}</output>
    </>
  );
}

describe("SessionContext activity identity", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
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

  async function click(selector) {
    await act(async () => {
      container.querySelector(selector).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  const readActivities = (container) =>
    JSON.parse(container.querySelector('[data-testid="activities"]').textContent);

  test("prevents duplicate configured activities while preserving distinct configurations", async () => {
    await act(async () => {
      root.render(
        <SessionProvider>
          <SessionHarness />
        </SessionProvider>,
      );
    });

    await click('[data-action="start"]');
    await click('[data-action="add-base"]');
    await click('[data-action="add-base"]');

    expect(readActivities(container)).toHaveLength(1);

    await click('[data-action="add-distinct"]');
    const activities = readActivities(container);
    expect(activities).toHaveLength(2);
    expect(activities.map((activity) => activity.setup_config.questionsPerVoicemail)).toEqual([3, 5]);
  });
});
