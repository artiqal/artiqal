import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { RouteScrollRestoration } from "./RouteScrollRestoration";

let mockCurrentLocation = { key: "landing", pathname: "/", search: "", hash: "" };

jest.mock(
  "react-router-dom",
  () => ({
    useLocation: () => mockCurrentLocation,
  }),
  { virtual: true },
);

describe("RouteScrollRestoration", () => {
  let container;
  let root;
  let originalScrollTo;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    mockCurrentLocation = { key: "landing", pathname: "/", search: "", hash: "" };
    originalScrollTo = window.scrollTo;
    window.scrollTo = jest.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    window.scrollTo = originalScrollTo;
  });

  async function renderRoute(location) {
    mockCurrentLocation = location;
    await act(async () => root.render(<RouteScrollRestoration />));
  }

  test("positions a direct Contact load at the document top", async () => {
    await renderRoute({ key: "contact", pathname: "/contact", search: "", hash: "" });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  test.each(["/terms", "/privacy"])("positions a direct %s load at the document top", async (pathname) => {
    await renderRoute({ key: pathname, pathname, search: "", hash: "" });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  test("resets pathname changes while leaving same-page anchors alone", async () => {
    const landing = { key: "landing", pathname: "/", search: "", hash: "" };
    await renderRoute(landing);
    window.scrollTo.mockClear();

    await renderRoute({ key: "about", pathname: "/", search: "", hash: "#about" });
    expect(window.scrollTo).not.toHaveBeenCalled();

    await renderRoute({ key: "contact", pathname: "/contact", search: "", hash: "" });
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "auto" });

    window.scrollTo.mockClear();
    await renderRoute({ key: "about", pathname: "/", search: "", hash: "#about" });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
