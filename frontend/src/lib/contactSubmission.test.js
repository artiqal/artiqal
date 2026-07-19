import { api } from "@/lib/api";
import { submitContactMessage } from "./contactSubmission";

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
  formatApiErrorDetail: (detail) => String(detail),
}));

const fields = {
  fullName: "Aisha Rahman",
  contactType: "Student",
  email: "aisha@example.com",
  subject: "Question",
  message: "Please help.",
  honeypot: "",
};

describe("submitContactMessage", () => {
  beforeEach(() => api.post.mockReset().mockResolvedValue({ status: 202 }));

  test("submits multipart form data without an optional attachment", async () => {
    await submitContactMessage({ ...fields, attachments: [] });

    const [path, body] = api.post.mock.calls[0];
    expect(path).toBe("/contact");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("fullName")).toBe("Aisha Rahman");
    expect(body.get("honeypot")).toBe("");
    expect(body.has("attachments")).toBe(false);
  });

  test("includes every selected attachment under the repeated multipart field", async () => {
    const attachments = [
      new File(["%PDF-test"], "context.pdf", { type: "application/pdf" }),
      new File(["PNG-test"], "screen.png", { type: "image/png" }),
    ];
    await submitContactMessage({ ...fields, attachments });

    const body = api.post.mock.calls[0][1];
    expect(body.getAll("attachments").map((file) => file.name)).toEqual([
      "context.pdf",
      "screen.png",
    ]);
  });

  test("preserves retry timing returned by a rate-limited backend", async () => {
    api.post.mockRejectedValue({
      response: {
        status: 429,
        data: {
          detail: "Too many contact requests. Please try again later.",
          retryAfterSeconds: 412,
        },
      },
    });

    await expect(submitContactMessage({ ...fields, attachments: [] })).rejects.toMatchObject({
      message: "Too many contact requests. Please try again later.",
      retryAfterSeconds: 412,
    });
  });
});
