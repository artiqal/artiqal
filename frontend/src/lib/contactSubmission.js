import { api, formatApiErrorDetail } from "@/lib/api";

export async function submitContactMessage(message) {
  const formData = new FormData();
  ["fullName", "contactType", "email", "subject", "message", "honeypot"].forEach((field) => {
    formData.append(field, message[field] || "");
  });
  (message.attachments || []).forEach((attachment) => {
    formData.append("attachments", attachment, attachment.name);
  });

  try {
    await api.post("/contact", formData);
  } catch (error) {
    const detail = error?.response?.data?.detail;
    const submissionError = new Error(
      detail
        ? formatApiErrorDetail(detail)
        : "We couldn’t send your message. Please try again later.",
    );
    const retryAfterSeconds = Number(error?.response?.data?.retryAfterSeconds);
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      submissionError.retryAfterSeconds = retryAfterSeconds;
    }
    throw submissionError;
  }
}
