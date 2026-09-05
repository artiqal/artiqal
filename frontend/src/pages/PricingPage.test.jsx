import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { AppRouter } from "@/App";
import { PricingPlans } from "@/components/marketing/PricingPlans";

let mockPathname = "/pricing";

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");

    return {
      BrowserRouter: ({ children }) => children,
      Link: ({ children, to, ...props }) => React.createElement("a", { href: to, ...props }, children),
      Navigate: () => null,
      Route: () => null,
      Routes: ({ children }) => {
        const route = React.Children.toArray(children).find(
          (child) => child.props.path === mockPathname,
        );
        return route?.props.element ?? null;
      },
      useLocation: () => ({ pathname: mockPathname, search: "", hash: "" }),
      useNavigate: () => jest.fn(),
      useParams: () => ({}),
      useSearchParams: () => [new URLSearchParams(), jest.fn()],
    };
  },
  { virtual: true },
);

describe("PricingPage", () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
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

  test("renders from the pricing route with the shared plan details", async () => {
    await act(async () => {
      root.render(<AppRouter />);
    });

    expect(container.querySelector('[data-testid="pricing-page"]')).not.toBeNull();
    expect(container.querySelector("h1").textContent).toBe("Simple plans for focused clinical work");
    expect(container.textContent).toContain("Standard");
    expect(container.textContent).toContain("$10");
    expect(container.textContent).toContain("Pro");
    expect(container.textContent).toContain("$25");
    expect(container.querySelector('a[href="/pricing"][aria-current="page"]')?.textContent).toBe("Pricing");
    expect(container.querySelectorAll('a[href="/register"][aria-label*="free trial"]')).toHaveLength(2);
  });

  test("provides the same pricing cards as a landing-page section", async () => {
    await act(async () => {
      root.render(<PricingPlans />);
    });

    const section = container.querySelector("#pricing");
    expect(section).not.toBeNull();
    expect(section.querySelectorAll(".marketing-pricing-card")).toHaveLength(2);
    expect(section.textContent).toContain("$10");
    expect(section.textContent).toContain("$25");
  });
});
