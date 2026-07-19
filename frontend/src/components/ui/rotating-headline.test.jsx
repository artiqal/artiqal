import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { RotatingHeadline } from "./rotating-headline";

const phrases = ["First phrase.", "Second phrase.", "Third phrase."];
const originalMatchMedia = window.matchMedia;

function mockReducedMotion(matches) {
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

describe("RotatingHeadline", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockReducedMotion(false);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    window.matchMedia = originalMatchMedia;
    jest.useRealTimers();
  });

  async function renderHeadline() {
    await act(async () => {
      root.render(
        <h1>
          <RotatingHeadline fixedLine="Fixed line" phrases={phrases} />
        </h1>,
      );
    });
  }

  test("keeps the first line fixed while cycling the reserved phrases", async () => {
    await renderHeadline();

    expect(container.querySelector(".rotating-headline-fixed").textContent).toBe("Fixed line");
    expect(container.querySelectorAll(".rotating-headline-reserve")).toHaveLength(3);
    expect(container.querySelector("[data-active-phrase]").textContent).toBe("First phrase.");

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(
      container.querySelector("[data-active-phrase]").classList.contains("is-exiting"),
    ).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(180);
    });
    expect(container.querySelector("[data-active-phrase]").textContent).toBe("Second phrase.");
    expect(container.querySelector(".rotating-headline-fixed").textContent).toBe("Fixed line");
  });

  test("keeps the first phrase static when reduced motion is requested", async () => {
    mockReducedMotion(true);
    await renderHeadline();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(container.querySelector("[data-active-phrase]").textContent).toBe("First phrase.");
    expect(
      container.querySelector(".rotating-headline").getAttribute("data-reduced-motion"),
    ).toBe("true");
  });
});
