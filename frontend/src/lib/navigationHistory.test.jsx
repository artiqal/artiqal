import React, { act } from "react";
import { createRoot } from "react-dom/client";

import {
  DEFAULT_CLINICIAN_BACK_FALLBACK,
  useSmartBack,
} from "./navigationHistory";

jest.mock(
  "react-router-dom",
  () => {
    let currentLocation = {
      pathname: "/activity/functional-communication/voicemails",
      search: "",
      hash: "",
      state: null,
    };
    const navigate = jest.fn();

    return {
      __navigate: navigate,
      __setLocation: (nextLocation) => {
        currentLocation = nextLocation;
      },
      useLocation: () => currentLocation,
      useNavigate: () => navigate,
    };
  },
  { virtual: true },
);

const {
  __navigate: navigate,
  __setLocation: setLocation,
} = jest.requireMock("react-router-dom");

function SmartBackHarness({ fallback }) {
  const smartBack = useSmartBack(fallback);

  return (
    <button type="button" onClick={smartBack}>
      Back
    </button>
  );
}

describe("shared Smart Back navigation", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    navigate.mockClear();
    window.history.replaceState({ idx: 0 }, "", "/");
    setLocation({
      pathname: "/activity/functional-communication/voicemails",
      search: "",
      hash: "",
      state: null,
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
  });

  const renderHarness = async (fallback) => {
    await act(async () => {
      root.render(<SmartBackHarness fallback={fallback} />);
    });
  };

  const goBack = async () => {
    await act(async () => {
      container.querySelector("button").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  };

  test("returns an activity setup page to its explicit owning route before browser history", async () => {
    window.history.replaceState({ idx: 4 }, "", "/");
    setLocation({
      pathname: "/activity/functional-communication/voicemails",
      search: "",
      hash: "",
      state: {
        from: {
          pathname: "/category/listening",
          search: "?sort=recent",
          hash: "#activities",
          state: { selectedDomain: "listening" },
        },
      },
    });

    await renderHarness();
    await goBack();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({
      pathname: "/category/listening",
      search: "?sort=recent",
      hash: "#activities",
      state: { selectedDomain: "listening" },
    });
  });

  test("returns an activity runtime step to setup through browser history", async () => {
    window.history.replaceState({ idx: 2 }, "", "/");
    setLocation({
      pathname: "/activity/functional-communication/voicemails",
      search: "?level=amber&letter=voicemail-1",
      hash: "",
      state: null,
    });

    await renderHarness();
    await goBack();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  test("uses the safe clinician fallback for direct entry or refresh", async () => {
    await renderHarness();
    await goBack();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(DEFAULT_CLINICIAN_BACK_FALLBACK);
  });

  test("does not navigate to an explicit source that resolves to the current route", async () => {
    setLocation({
      pathname: "/activity/functional-communication/voicemails",
      search: "?level=amber",
      hash: "#question-1",
      state: {
        from: {
          pathname: "/activity/functional-communication/voicemails",
          search: "?level=amber",
          hash: "#question-1",
        },
      },
    });

    await renderHarness("/explore/favourites");
    await goBack();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/explore/favourites");
  });

  test.each([
    ["missing", null],
    ["empty", {}],
    ["external", "https://example.com/activities"],
    ["protocol-relative", "//example.com/activities"],
    ["unknown app route", { pathname: "/not-a-clinician-route" }],
  ])("handles %s route state safely", async (_label, from) => {
    setLocation({
      pathname: "/activity/functional-communication/voicemails",
      search: "",
      hash: "",
      state: from === null ? null : { from },
    });

    await renderHarness("/all-activities");
    await goBack();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/all-activities");
  });
});
