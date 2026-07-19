import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Plus, Send, TriangleAlert, X } from "lucide-react";
import { Link } from "react-router-dom";

import { PublicFooter, PublicNav } from "@/components/marketing/MarketingChrome";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTACT_ATTACHMENT_ACCEPT,
  MAX_CONTACT_ATTACHMENTS,
  formatContactFileSize,
  validateContactAttachmentAddition,
} from "@/lib/contactAttachment";
import { submitContactMessage } from "@/lib/contactSubmission";
import "./ContactPage.css";

const initialValues = {
  fullName: "",
  contactType: "",
  email: "",
  subject: "",
  message: "",
  honeypot: "",
};

const contactTypeOptions = [
  "Speech-language pathologist",
  "Client / patient",
  "Family member / caregiver",
  "Student",
  "Other",
];

const fieldOrder = ["fullName", "contactType", "email", "subject", "message"];

export function validateContactForm(values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!values.contactType) errors.contactType = "Select how you’re contacting Artiqal.";
  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.subject.trim()) errors.subject = "Enter a subject.";
  if (!values.message.trim()) errors.message = "Enter your message.";

  return errors;
}

export default function ContactPage({ submitMessage = submitContactMessage }) {
  const formRef = useRef(null);
  const successRef = useRef(null);
  const hasScrolledToSuccess = useRef(false);
  const nextAttachmentPickerId = useRef(1);
  const [values, setValues] = useState(initialValues);
  const [attachments, setAttachments] = useState([]);
  const [attachmentPickerIds, setAttachmentPickerIds] = useState([0]);
  const [attachmentError, setAttachmentError] = useState("");
  const [isInspectingAttachment, setIsInspectingAttachment] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    if (status !== "success" || hasScrolledToSuccess.current || !successRef.current) return;

    hasScrolledToSuccess.current = true;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    successRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [status]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    if (status === "error") {
      setStatus("idle");
      setSubmissionError("");
    }
  };

  const updateAttachment = async (event, pickerId) => {
    const nextAttachment = event.target.files?.[0] || null;
    if (!nextAttachment) return;
    setIsInspectingAttachment(true);
    try {
      const error = await validateContactAttachmentAddition(attachments, nextAttachment);
      if (error) {
        setAttachmentError(error);
        event.target.value = "";
        return;
      }
      setAttachments((current) => [...current, nextAttachment]);
      setAttachmentPickerIds((current) => current.filter((id) => id !== pickerId));
      setAttachmentError("");
    } catch (_error) {
      setAttachmentError("We couldn’t inspect that attachment. Please choose another file.");
      event.target.value = "";
    } finally {
      setIsInspectingAttachment(false);
    }
  };

  const addAttachmentPicker = () => {
    if (status === "submitting" || isInspectingAttachment || attachments.length >= MAX_CONTACT_ATTACHMENTS) return;
    setAttachmentPickerIds((current) => (
      current.length ? current : [...current, nextAttachmentPickerId.current++]
    ));
    setAttachmentError("");
  };

  const removeAttachment = (attachmentToRemove) => {
    if (status === "submitting") return;
    setAttachments((current) => current.filter((attachment) => attachment !== attachmentToRemove));
    setAttachmentError("");
    if (attachments.length === 1 && attachmentPickerIds.length === 0) {
      setAttachmentPickerIds([nextAttachmentPickerId.current++]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "submitting" || isInspectingAttachment) return;
    const nextErrors = validateContactForm(values);

    if (Object.keys(nextErrors).length || attachmentError) {
      setErrors(nextErrors);
      setStatus("idle");
      setSubmissionError("");
      const firstInvalidField = fieldOrder.find((field) => nextErrors[field]);
      const firstInvalidControl = firstInvalidField === "contactType"
        ? formRef.current?.querySelector("#contactType")
        : formRef.current?.elements[firstInvalidField];
      firstInvalidControl?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");
    setSubmissionError("");

    try {
      await submitMessage({
        fullName: values.fullName.trim(),
        contactType: values.contactType,
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        honeypot: values.honeypot,
        attachments,
      });
      setAttachments([]);
      setAttachmentPickerIds([nextAttachmentPickerId.current++]);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setSubmissionError(
        error?.message || "We couldn’t send your message. Please try again later.",
      );
    }
  };

  return (
    <div className="artiqal-contact artiqal-marketing-page" data-testid="contact-page">
      <main>
        <section className="contact-hero">
          <PublicNav />
          <div className="contact-hero-copy">
            <span>Contact Artiqal</span>
            <h1>Get in touch</h1>
            <p>Have a question, need support, or want to learn more about Artiqal? We’re here to help.</p>
          </div>
        </section>

        <section className="contact-form-section" aria-labelledby="contact-form-heading">
          <div className="contact-form-card">
            <div className="contact-form-intro">
              {status === "success" ? (
                <>
                  <span>Thank you!</span>
                  <h2 id="contact-form-heading">Your message has been submitted.</h2>
                </>
              ) : (
                <>
                  <span>We’d love to hear from you</span>
                  <h2 id="contact-form-heading">Send us a message</h2>
                  <p>Complete the form below and we’ll get back to you as soon as possible.</p>
                </>
              )}
            </div>

            {status === "success" ? (
              <div ref={successRef} className="contact-success" role="status" aria-live="polite">
                <span><CheckCircle2 aria-hidden="true" /></span>
                <h3>Message sent</h3>
                <p>A member of the <em>artiqal</em> team will get back to you as soon as possible.</p>
              </div>
            ) : (
              <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-primary-row" data-testid="contact-primary-row">
                  <ContactField
                    label="Full name"
                    name="fullName"
                    value={values.fullName}
                    error={errors.fullName}
                    onChange={updateField}
                    autoComplete="name"
                  />
                  <ContactSelect
                    label="I am a..."
                    name="contactType"
                    value={values.contactType}
                    error={errors.contactType}
                    onChange={updateField}
                    options={contactTypeOptions}
                  />
                </div>

                <ContactField
                  label="Email address"
                  name="email"
                  type="email"
                  value={values.email}
                  error={errors.email}
                  onChange={updateField}
                  autoComplete="email"
                />
                <ContactField
                  label="Subject"
                  name="subject"
                  value={values.subject}
                  error={errors.subject}
                  onChange={updateField}
                />
                <ContactField
                  label="Message"
                  name="message"
                  value={values.message}
                  error={errors.message}
                  onChange={updateField}
                  multiline
                />

                <div className={`contact-attachment${attachmentError ? " has-error" : ""}`}>
                  <div className="contact-attachment-heading">
                    <span id="contact-attachment-label">Attachment</span>
                    <p id="contact-attachment-help">
                      Optional. Upload a screenshot or document that helps explain your message.
                    </p>
                  </div>
                  <div className="contact-attachment-toolbar">
                    <span aria-live="polite">{attachments.length} of {MAX_CONTACT_ATTACHMENTS} attachments</span>
                    {attachments.length > 0
                      && attachments.length < MAX_CONTACT_ATTACHMENTS
                      && attachmentPickerIds.length === 0 && (
                        <button
                          type="button"
                          className="contact-add-attachment"
                          onClick={addAttachmentPicker}
                          disabled={status === "submitting" || isInspectingAttachment}
                        >
                          <Plus aria-hidden="true" />
                          <span>Add another attachment</span>
                        </button>
                      )}
                  </div>
                  {attachmentPickerIds.map((pickerId) => (
                    <input
                      key={pickerId}
                      id={`contactAttachment-${pickerId}`}
                      name="attachments"
                      type="file"
                      accept={CONTACT_ATTACHMENT_ACCEPT}
                      onChange={(event) => updateAttachment(event, pickerId)}
                      disabled={status === "submitting" || isInspectingAttachment}
                      aria-labelledby="contact-attachment-label"
                      aria-busy={isInspectingAttachment}
                      aria-describedby={attachmentError
                        ? "contact-attachment-help contact-attachment-error"
                        : "contact-attachment-help"}
                      aria-invalid={Boolean(attachmentError)}
                    />
                  ))}
                  {attachments.length > 0 && (
                    <div className="contact-attachment-list" aria-label="Selected attachments">
                      {attachments.map((attachment) => (
                        <div className="contact-attachment-selection" key={`${attachment.name}-${attachment.size}-${attachment.lastModified}`}>
                          <FileText aria-hidden="true" />
                          <span>
                            <strong title={attachment.name}>{attachment.name}</strong>
                            <small>{formatContactFileSize(attachment.size)}</small>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment)}
                            disabled={status === "submitting"}
                            aria-label={`Remove ${attachment.name}`}
                          >
                            <X aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {attachmentError && (
                    <p id="contact-attachment-error" className="contact-field-error" role="alert">
                      {attachmentError}
                    </p>
                  )}
                </div>

                <div className="contact-honeypot" aria-hidden="true">
                  <label htmlFor="contactWebsite">Leave this field empty</label>
                  <input
                    id="contactWebsite"
                    name="honeypot"
                    value={values.honeypot}
                    onChange={updateField}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {status === "error" && (
                  <div className="contact-submit-error" role="alert">
                    <TriangleAlert aria-hidden="true" />
                    <span>{submissionError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="contact-submit"
                  disabled={status === "submitting" || isInspectingAttachment}
                >
                  <span>{status === "submitting" ? "Sending…" : "Send message"}</span>
                  <Send aria-hidden="true" />
                </button>
                <p className="contact-legal-notice">
                  By sending a message, you agree to our{" "}
                  <Link to="/terms">Terms of Service</Link> and acknowledge our{" "}
                  <Link to="/privacy">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function ContactSelect({ label, name, value, error, onChange, options }) {
  const errorId = `${name}-error`;

  return (
    <div className={`contact-field contact-select-field${error ? " has-error" : ""}`}>
      <label htmlFor={name}>{label}<span aria-hidden="true">*</span></label>
      <Select
        name={name}
        value={value}
        required
        onValueChange={(nextValue) => onChange({ target: { name, value: nextValue } })}
      >
        <SelectTrigger
          id={name}
          className="contact-select-trigger"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder="Select one" />
        </SelectTrigger>
        <SelectContent
          className="contact-select-menu"
          viewportClassName="contact-select-viewport"
          position="popper"
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
        >
          {options.map((option) => (
            <SelectItem className="contact-select-option" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p id={errorId} className="contact-field-error">{error}</p>}
    </div>
  );
}

function ContactField({
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
  autoComplete,
  multiline = false,
}) {
  const errorId = `${name}-error`;
  const sharedProps = {
    id: name,
    name,
    value,
    onChange,
    required: true,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <div className={`contact-field${error ? " has-error" : ""}`}>
      <label htmlFor={name}>{label}<span aria-hidden="true">*</span></label>
      {multiline ? (
        <textarea {...sharedProps} rows={6} />
      ) : (
        <input {...sharedProps} type={type} autoComplete={autoComplete} />
      )}
      {error && <p id={errorId} className="contact-field-error">{error}</p>}
    </div>
  );
}
