export const MAX_CONTACT_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_CONTACT_ATTACHMENTS = 5;
export const MAX_TOTAL_CONTACT_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export const CONTACT_ATTACHMENT_ACCEPT = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".doc",
  ".docx",
].join(",");

const allowedMimeTypes = {
  ".pdf": new Set(["application/pdf"]),
  ".png": new Set(["image/png"]),
  ".jpg": new Set(["image/jpeg", "image/jpg"]),
  ".jpeg": new Set(["image/jpeg", "image/jpg"]),
  ".doc": new Set(["application/msword"]),
  ".docx": new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
};

export async function validateContactAttachment(file) {
  if (!file) return "";
  if (file.size > MAX_CONTACT_ATTACHMENT_BYTES) {
    return "Attachments must be 10 MB or smaller.";
  }
  if (file.size === 0) return "The selected attachment is empty.";

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowedMimeTypes[extension]) {
    return "Choose a PDF, PNG, JPG, DOC, or DOCX file.";
  }
  if (!allowedMimeTypes[extension].has((file.type || "").toLowerCase())) {
    return "The attachment’s file type does not match an allowed format.";
  }

  const signature = new Uint8Array(await readFilePrefix(file, 8));
  if (!signatureMatches(extension, signature)) {
    return "The attachment’s contents do not match its declared file type.";
  }
  return "";
}

export async function validateContactAttachmentAddition(attachments, file) {
  if (!file) return "";
  if (attachments.length >= MAX_CONTACT_ATTACHMENTS) {
    return "You can attach up to 5 files.";
  }
  if (attachments.some((attachment) => contactAttachmentIdentity(attachment) === contactAttachmentIdentity(file))) {
    return "That file has already been added.";
  }

  const fileError = await validateContactAttachment(file);
  if (fileError) return fileError;

  const combinedSize = attachments.reduce((total, attachment) => total + attachment.size, 0) + file.size;
  if (combinedSize > MAX_TOTAL_CONTACT_ATTACHMENT_BYTES) {
    return "Attachments must be 25 MB or smaller in total.";
  }
  return "";
}

export function contactAttachmentIdentity(file) {
  return [file.name, file.size, file.type, file.lastModified].join("::");
}

export function formatContactFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function signatureMatches(extension, bytes) {
  if (extension === ".pdf") return startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  if (extension === ".png") {
    return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (extension === ".jpg" || extension === ".jpeg") {
    return startsWith(bytes, [0xff, 0xd8, 0xff]);
  }
  if (extension === ".doc") {
    return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }
  if (extension === ".docx") return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
  return false;
}

function startsWith(actual, expected) {
  return expected.every((value, index) => actual[index] === value);
}

function readFilePrefix(file, length) {
  const blob = file.slice(0, length);
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Unable to inspect the attachment."));
    reader.readAsArrayBuffer(blob);
  });
}
