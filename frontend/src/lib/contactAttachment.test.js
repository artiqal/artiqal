import {
  MAX_CONTACT_ATTACHMENT_BYTES,
  MAX_TOTAL_CONTACT_ATTACHMENT_BYTES,
  validateContactAttachment,
  validateContactAttachmentAddition,
} from "./contactAttachment";

function makeFile(name, type, bytes) {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("validateContactAttachment", () => {
  test.each([
    ["context.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]],
    ["screen.png", "image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    ["photo.jpg", "image/jpeg", [0xff, 0xd8, 0xff, 0xe0]],
    ["notes.doc", "application/msword", [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]],
    [
      "notes.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      [0x50, 0x4b, 0x03, 0x04, 0x14],
    ],
  ])("accepts %s with a matching MIME type and signature", async (name, type, bytes) => {
    await expect(validateContactAttachment(makeFile(name, type, bytes))).resolves.toBe("");
  });

  test("rejects a file larger than 10 MB", async () => {
    const file = makeFile("large.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]);
    Object.defineProperty(file, "size", { value: MAX_CONTACT_ATTACHMENT_BYTES + 1 });
    await expect(validateContactAttachment(file)).resolves.toContain("10 MB");
  });

  test("rejects unsupported extensions and MIME types", async () => {
    await expect(
      validateContactAttachment(makeFile("payload.exe", "application/octet-stream", [0x4d, 0x5a])),
    ).resolves.toContain("PDF, PNG, JPG, DOC, or DOCX");
    await expect(
      validateContactAttachment(makeFile("screen.png", "application/octet-stream", [0x89, 0x50])),
    ).resolves.toContain("does not match an allowed format");
  });

  test("rejects content whose signature does not match its declared type", async () => {
    await expect(
      validateContactAttachment(makeFile("screen.png", "image/png", [0x4d, 0x5a])),
    ).resolves.toContain("contents do not match");
  });
});

describe("validateContactAttachmentAddition", () => {
  test("rejects a duplicate without affecting existing files", async () => {
    const file = makeFile("context.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]);
    await expect(validateContactAttachmentAddition([file], file)).resolves.toContain("already been added");
  });

  test("rejects a sixth file", async () => {
    const existing = Array.from({ length: 5 }, (_, index) => {
      const file = makeFile(`context-${index}.pdf`, "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]);
      Object.defineProperty(file, "lastModified", { value: index });
      return file;
    });
    const next = makeFile("sixth.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]);
    await expect(validateContactAttachmentAddition(existing, next)).resolves.toContain("up to 5");
  });

  test("rejects a combined selection larger than 25 MB", async () => {
    const existing = makeFile("large-context.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]);
    Object.defineProperty(existing, "size", { value: MAX_TOTAL_CONTACT_ATTACHMENT_BYTES - 2 });
    const next = makeFile("more-context.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]);
    await expect(validateContactAttachmentAddition([existing], next)).resolves.toContain("25 MB");
  });
});
