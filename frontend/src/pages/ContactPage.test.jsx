import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { AppRouter } from "@/App";
import ContactPage from "./ContactPage";

let mockPathname = "/contact";

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

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

describe("ContactPage", () => {
  let container;
  let root;
  let scrollIntoViewMock;
  let originalMatchMedia;
  let originalScrollIntoView;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    originalMatchMedia = window.matchMedia;
    originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  });

  beforeEach(() => {
    scrollIntoViewMock = jest.fn();
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
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
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  async function renderContact(submitMessage = jest.fn()) {
    await act(async () => {
      root.render(<ContactPage submitMessage={submitMessage} />);
    });
  }

  async function setField(name, value) {
    const field = container.querySelector(`[name="${name}"]`);
    const prototype = field.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : field.tagName === "SELECT"
        ? window.HTMLSelectElement.prototype
        : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value").set;

    await act(async () => {
      setter.call(field, value);
      field.dispatchEvent(new Event(field.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
    });
  }

  async function submitForm() {
    await act(async () => {
      container.querySelector("form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });
  }

  async function selectAttachment(file) {
    const input = container.querySelector('input[name="attachments"]');
    if (!input) throw new Error("No attachment picker is available.");
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    await act(async () => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    return input;
  }

  async function addAttachment(file) {
    const addButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Add another attachment"),
    );
    await act(async () => addButton.click());
    await selectAttachment(file);
  }

  function validPdf(name = "context.pdf") {
    return new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], name, {
      type: "application/pdf",
    });
  }

  async function fillValidForm() {
    await setField("fullName", "Aisha Rahman");
    await setField("contactType", "Speech-language pathologist");
    await setField("email", "aisha@example.com");
    await setField("subject", "Artiqal activity question");
    await setField("message", "I would like to learn more about the activity library.");
  }

  test("renders from the application route and marks Contact as active", async () => {
    await act(async () => {
      root.render(<AppRouter />);
    });

    expect(container.querySelector('[data-testid="contact-page"]')).not.toBeNull();
    expect(container.querySelector("h1").textContent).toBe("Get in touch");
    expect(container.querySelector('a[href="/contact"][aria-current="page"]')?.textContent.trim()).toBe("Contact");
  });

  test("links the informational legal notice to safe placeholder routes", async () => {
    await renderContact();

    const notice = container.querySelector(".contact-legal-notice");
    expect(notice.textContent).toBe(
      "By sending a message, you agree to our Terms of Service and acknowledge our Privacy Policy.",
    );
    expect(notice.querySelector('a[href="/terms"]')?.textContent).toBe("Terms of Service");
    expect(notice.querySelector('a[href="/privacy"]')?.textContent).toBe("Privacy Policy");
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });

  test.each([
    [
      "/terms",
      "Terms of Service",
      "These Terms of Service will explain the rules for using Artiqal, account responsibilities, subscriptions, acceptable use, intellectual property, clinical limitations, and service availability.",
      "This page is being prepared and is not yet the final legal agreement.",
    ],
    [
      "/privacy",
      "Privacy Policy",
      "This Privacy Policy will explain how Artiqal collects, uses, stores, protects, and deletes personal information.",
      "This page is being prepared and is not yet the final privacy policy.",
    ],
  ])("renders the %s placeholder route", async (pathname, heading, intro, notice) => {
    mockPathname = pathname;
    await act(async () => {
      root.render(<AppRouter />);
    });

    expect(container.querySelector('[data-testid="legal-placeholder-page"]')).not.toBeNull();
    expect(container.querySelector(".legal-placeholder > span").textContent).toBe("Legal");
    expect(container.querySelector("h1").textContent).toBe(heading);
    expect(container.querySelector(".legal-placeholder-intro").textContent).toBe(intro);
    expect(container.querySelector('[role="note"]').textContent).toBe(notice);
    expect(container.querySelector(".legal-placeholder-updated").textContent).toBe(
      "Last updated: Draft placeholder",
    );
    expect(container.querySelector('footer a[href="/terms"]')?.textContent).toBe("Terms of Service");
    expect(container.querySelector('footer a[href="/privacy"]')?.textContent).toBe("Privacy Policy");
    mockPathname = "/contact";
  });

  test("shows accessible required-field errors without submitting", async () => {
    const submitMessage = jest.fn();
    await renderContact(submitMessage);

    await submitForm();

    expect(submitMessage).not.toHaveBeenCalled();
    expect(container.querySelectorAll(".contact-field-error")).toHaveLength(5);
    expect(container.textContent).toContain("Enter your full name.");
    expect(container.textContent).toContain("Select how you’re contacting Artiqal.");
    expect(container.querySelector('[name="fullName"]').getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelector('#contactType').getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(container.querySelector('[name="fullName"]'));
  });

  test("uses an accessible required contact-type select in the shared first row", async () => {
    await renderContact();

    const row = container.querySelector('[data-testid="contact-primary-row"]');
    const select = row.querySelector('select[name="contactType"]');
    const trigger = row.querySelector('#contactType');

    expect(row.querySelector('input[name="fullName"]')).not.toBeNull();
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent).toContain("Select one");
    expect(select.required).toBe(true);
    expect(select.value).toBe("");
    expect(Array.from(select.options).slice(1).map((option) => option.textContent)).toEqual([
      "Speech-language pathologist",
      "Client / patient",
      "Family member / caregiver",
      "Student",
      "Other",
    ]);

    await setField("contactType", "Family member / caregiver");
    expect(select.value).toBe("Family member / caregiver");
    expect(trigger.textContent).toContain("Family member / caregiver");
  });

  test("rejects an invalid email while preserving all entered values", async () => {
    const submitMessage = jest.fn();
    await renderContact(submitMessage);
    await fillValidForm();
    await setField("email", "not-an-email");

    await submitForm();

    expect(submitMessage).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Enter a valid email address.");
    expect(container.querySelector('[name="email"]').value).toBe("not-an-email");
    expect(container.querySelector('[name="message"]').value).toContain("activity library");
  });

  test("disables submission while pending and announces the success state", async () => {
    const deferred = createDeferred();
    const submitMessage = jest.fn(() => deferred.promise);
    await renderContact(submitMessage);
    await fillValidForm();

    await submitForm();

    expect(container.querySelector(".contact-submit").disabled).toBe(true);
    expect(container.querySelector(".contact-submit").textContent).toContain("Sending");
    expect(submitMessage).toHaveBeenCalledWith({
      fullName: "Aisha Rahman",
      contactType: "Speech-language pathologist",
      email: "aisha@example.com",
      subject: "Artiqal activity question",
      message: "I would like to learn more about the activity library.",
      honeypot: "",
      attachments: [],
    });

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
      await Promise.resolve();
    });

    expect(container.querySelector('[role="status"]').textContent).toContain("Message sent");
    expect(container.querySelector(".contact-form-intro span").textContent).toBe("Thank you!");
    expect(container.querySelector("#contact-form-heading").textContent).toBe(
      "Your message has been submitted.",
    );
    expect(container.querySelector(".contact-form-intro p")).toBeNull();
    expect(container.querySelector('[role="status"] p').textContent).toBe(
      "A member of the artiqal team will get back to you as soon as possible.",
    );
    expect(container.querySelector('[role="status"] em').textContent).toBe("artiqal");
    expect(container.textContent).not.toContain("Send us a message");
    expect(container.querySelector("form")).toBeNull();
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    await act(async () => {
      root.render(<ContactPage submitMessage={submitMessage} />);
    });
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
  });

  test("announces delivery failures and keeps the completed form", async () => {
    const submitMessage = jest.fn().mockRejectedValue(new Error("Delivery is unavailable."));
    await renderContact(submitMessage);
    await fillValidForm();

    await submitForm();

    expect(container.querySelector('[role="alert"]').textContent).toContain("Delivery is unavailable.");
    expect(container.querySelector("#contact-form-heading").textContent).toBe("Send us a message");
    expect(container.textContent).not.toContain("Your message has been submitted.");
    expect(container.querySelector('[name="email"]').value).toBe("aisha@example.com");
    expect(container.querySelector(".contact-submit").disabled).toBe(false);
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  test("shows and removes a valid optional attachment", async () => {
    await renderContact();
    await selectAttachment(validPdf("clinical context.pdf"));

    expect(container.querySelector(".contact-attachment-selection").textContent).toContain("clinical context.pdf");
    expect(container.querySelector(".contact-attachment-selection").textContent).toContain("6 B");

    const removeButton = container.querySelector('button[aria-label="Remove clinical context.pdf"]');
    await act(async () => removeButton.click());
    expect(container.querySelector(".contact-attachment-selection")).toBeNull();
    expect(container.textContent).toContain("0 of 5 attachments");
  });

  test("adds up to five attachments, blocks a sixth, and allows replacement after removal", async () => {
    await renderContact();
    const files = Array.from({ length: 5 }, (_, index) => validPdf(`context-${index + 1}.pdf`));

    await selectAttachment(files[0]);
    for (const file of files.slice(1)) await addAttachment(file);

    expect(container.querySelectorAll(".contact-attachment-selection")).toHaveLength(5);
    expect(container.textContent).toContain("5 of 5 attachments");
    expect(container.textContent).not.toContain("Add another attachment");
    expect(container.querySelector('input[name="attachments"]')).toBeNull();

    await act(async () => container.querySelector('button[aria-label="Remove context-3.pdf"]').click());
    expect(container.textContent).toContain("4 of 5 attachments");
    expect(container.textContent).toContain("Add another attachment");

    await addAttachment(validPdf("replacement.pdf"));
    expect(container.querySelectorAll(".contact-attachment-selection")).toHaveLength(5);
    expect(container.textContent).toContain("replacement.pdf");
  });

  test("rejects a duplicate while retaining valid selected files", async () => {
    await renderContact();
    const attachment = validPdf("context.pdf");
    await selectAttachment(attachment);
    await act(async () => {
      Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent.includes("Add another attachment"),
      ).click();
    });
    await selectAttachment(attachment);

    expect(container.textContent).toContain("That file has already been added.");
    expect(container.querySelectorAll(".contact-attachment-selection")).toHaveLength(1);
    expect(container.textContent).toContain("context.pdf");
  });

  test("keeps a selected attachment after provider failure", async () => {
    const submitMessage = jest.fn().mockRejectedValue(new Error("Delivery is unavailable."));
    await renderContact(submitMessage);
    await fillValidForm();
    const attachment = validPdf();
    await selectAttachment(attachment);

    await submitForm();

    expect(submitMessage.mock.calls[0][0].attachments).toEqual([attachment]);
    expect(container.querySelector(".contact-attachment-selection").textContent).toContain("context.pdf");
    expect(container.querySelector('[role="alert"]').textContent).toContain("Delivery is unavailable.");
  });

  test("preserves form values and attachments after rate limiting", async () => {
    const rateLimitError = new Error("Too many contact requests. Please try again later.");
    rateLimitError.retryAfterSeconds = 412;
    const submitMessage = jest.fn().mockRejectedValue(rateLimitError);
    await renderContact(submitMessage);
    await fillValidForm();
    await selectAttachment(validPdf());

    await submitForm();

    expect(container.querySelector('[role="alert"]').textContent).toContain(
      "Too many contact requests",
    );
    expect(container.querySelector("#contact-form-heading").textContent).toBe("Send us a message");
    expect(container.textContent).not.toContain("Your message has been submitted.");
    expect(container.querySelector('[name="fullName"]').value).toBe("Aisha Rahman");
    expect(container.querySelector('[name="email"]').value).toBe("aisha@example.com");
    expect(container.querySelector('[name="message"]').value).toContain("activity library");
    expect(container.querySelector(".contact-attachment-selection").textContent).toContain(
      "context.pdf",
    );
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  test("uses immediate success positioning when reduced motion is preferred", async () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    const submitMessage = jest.fn().mockResolvedValue();
    await renderContact(submitMessage);
    await fillValidForm();

    await submitForm();

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "auto",
      block: "center",
      inline: "nearest",
    });
  });

  test("clears the attachment UI only after confirmed success", async () => {
    const deferred = createDeferred();
    const submitMessage = jest.fn(() => deferred.promise);
    await renderContact(submitMessage);
    await fillValidForm();
    await selectAttachment(validPdf());

    await submitForm();
    expect(container.querySelector(".contact-attachment-selection")).not.toBeNull();

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    expect(container.querySelector(".contact-attachment-selection")).toBeNull();
    expect(container.querySelector('[role="status"]').textContent).toContain("Message sent");
  });

  test("prevents duplicate submission while delivery is pending", async () => {
    const deferred = createDeferred();
    const submitMessage = jest.fn(() => deferred.promise);
    await renderContact(submitMessage);
    await fillValidForm();
    await selectAttachment(validPdf());

    await submitForm();
    await submitForm();

    expect(submitMessage).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".contact-submit").disabled).toBe(true);

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });
});
