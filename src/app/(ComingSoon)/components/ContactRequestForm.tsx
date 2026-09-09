"use client";

import { useEffect, useRef, useState } from "react";
import HighlightMark from "@/app/shared/HighlightMark";
import SuccessCheckIcon from "@/app/shared/SuccessCheckIcon";
import { ButtonBlue } from "@/app/shared/Button";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import { SHEET_HEADERS, submitToSheet } from "@/lib/formSubmission";
import { contactEmail } from "@/app/(ComingSoon)/data/landing";

/**
 * The main site's public Contact page form (`contact/components/
 * ContactPageForm.tsx`), rendered inside the "Request a callback" modal:
 * the same field set (name, email, phone, services multiselect, message),
 * the same validate-on-submit-then-live-revalidate behaviour, the same copy,
 * the same success state.
 *
 * The first deliberate difference is the category. The main site offers a
 * picker; this panel takes new-project briefs only, so it states the category
 * as copy instead of asking, and submits that one value silently.
 *
 * The second is sizing. Every length here is an `em` against the panel's
 * fluid `text-body`, exactly as `RequestModal`'s email field already was,
 * instead of the main site's fixed `px-4 py-3.5`/`gap-4`
 * — at 14px (this app's floor, and the main site's `text-sm`) they resolve to
 * the same pixels, and above it the form scales with the rest of the page
 * rather than shrinking into a large display. See the `@theme` note in
 * globals.css for why this app has no fixed scale.
 *
 * Where the main site's copy still fakes its submit on a timer, a valid
 * submission here is posted to the Google Sheet (see `lib/formSubmission.ts`)
 * and only flips to the success panel once the script confirms the row — a
 * failure keeps every field intact and says so, rather than thanking someone
 * for a brief that never arrived.
 */

// Not a choice any more: the "Partnership" / "Careers" / "Something else"
// options are off the UI and this panel only takes new-project briefs. The
// value is still submitted so the sheet's category column keeps the shape
// every existing row already has.
const CATEGORY = "New project";

const SERVICES = [
  "strategic user research",
  "experience design",
  "ai transformation",
  "product experience transformation planning",
  "web experience design & development",
  "mvp product development",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{10,15}$/;

type FormValues = {
  name: string;
  email: string;
  phone: string;
  services: string[];
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type Status = "idle" | "loading" | "success";

function validateField<K extends keyof FormValues>(
  field: K,
  value: FormValues[K],
): string | undefined {
  switch (field) {
    case "name":
      return (value as string).trim() === ""
        ? "Your name is required"
        : undefined;
    case "email": {
      const trimmed = (value as string).trim();
      if (trimmed === "") return "Email is required";
      if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";
      return undefined;
    }
    case "phone": {
      const trimmed = (value as string).trim();
      if (trimmed === "") return "Phone number is required";
      if (!PHONE_PATTERN.test(trimmed)) return "Enter a valid phone number";
      return undefined;
    }
    case "services":
      return (value as string[]).length === 0
        ? "Select at least one service"
        : undefined;
    case "message":
      return undefined;
    default:
      return undefined;
  }
}

const fieldBaseClassName =
  "w-full rounded-lg border bg-[#0000000A] px-[1.15em] py-[1em] text-body text-[#392B56] placeholder-[#00000066] outline-none transition-colors focus:bg-[#EFEDE9] disabled:cursor-not-allowed disabled:opacity-50";

function fieldClassName(hasError: boolean, extra = "") {
  return `${fieldBaseClassName} ${hasError ? "border-red-500" : "border-transparent"} ${extra}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-[0.43em] text-micro text-red-500">{message}</p>;
}

export default function ContactRequestForm({
  titleId,
  title,
  description,
  targetSheet,
  onClose,
}: {
  titleId: string;
  title: string;
  description: string;
  targetSheet: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);

  const servicesRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Escape belongs to the innermost thing that is open: the services list
  // first, the modal only once it is closed. This panel owns the key for the
  // whole modal (`RequestModal` deliberately doesn't bind it) so that
  // decision lives in one place.
  useEscapeKey(() => {
    if (isServicesOpen) {
      setIsServicesOpen(false);
      return;
    }
    onClose();
  });

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isServicesOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isServicesOpen]);

  function handleFieldChange<K extends "name" | "email" | "phone" | "message">(
    field: K,
    value: string,
    setter: (value: string) => void,
  ) {
    setter(value);
    if (hasSubmitted) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function toggleService(service: string) {
    const next = selectedServices.includes(service)
      ? selectedServices.filter((item) => item !== service)
      : [...selectedServices, service];

    setSelectedServices(next);
    if (hasSubmitted) {
      setErrors((prev) => ({
        ...prev,
        services: validateField("services", next),
      }));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      name: validateField("name", name),
      email: validateField("email", email),
      phone: validateField("phone", phone),
      services: validateField("services", selectedServices),
      message: validateField("message", message),
    };

    setErrors(nextErrors);
    setHasSubmitted(true);
    setSubmitError(undefined);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) return;

    setIsServicesOpen(false);
    setStatus("loading");

    try {
      await submitToSheet(targetSheet, {
        // Keys are the sheet's column headers — see `lib/formSubmission.ts`.
        [SHEET_HEADERS.category]: CATEGORY,
        [SHEET_HEADERS.name]: name.trim(),
        [SHEET_HEADERS.email]: email.trim(),
        [SHEET_HEADERS.phone]: phone.trim(),
        // One cell, one service per comma — the sheet stays readable and the
        // notification email doesn't need to know this was a multiselect.
        [SHEET_HEADERS.services]: selectedServices.join(", "),
        [SHEET_HEADERS.message]: message.trim(),
      });

      setStatus("success");
    } catch (error) {
      console.error("[request] submission failed", error);
      setStatus("idle");
      setSubmitError(
        `Something went wrong sending that. Please try again, or email us at ${contactEmail}.`,
      );
    }
  }

  const servicesTriggerLabel = isServicesOpen
    ? null
    : selectedServices.length > 0
      ? selectedServices.join(", ")
      : "/ Service *";

  const isSubmitting = status === "loading";

  if (status === "success") {
    return (
      <div className="flex min-h-[16em] flex-col items-center justify-center gap-fluid-sm text-center">
        <SuccessCheckIcon
          className="h-[max(56px,3.9vw)] w-[max(56px,3.9vw)] bg-[#392B56]"
          iconClassName="h-[max(28px,1.95vw)] w-[max(28px,1.95vw)] text-white"
        />

        <div className="animate-fade-in-up flex flex-col gap-fluid-2xs">
          <p
            id={titleId}
            className="text-[max(18px,1.4vw)] leading-tight text-[#392B56]"
          >
            Thanks — message sent.
          </p>
          <p className="max-w-[26em] text-body text-[#8A8781]">
            A founder or design lead — never a bot — will read your note and
            reply within two working days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2
        id={titleId}
        className="text-[max(20px,1.67vw)] leading-tight tracking-[-0.033em] text-[#392B56]"
      >
        {title}
      </h2>

      <p className="mt-fluid-xs text-body text-[#8A8781]">{description}</p>

      <HighlightMark
        text="I'm here about a New Project"
        className="mt-fluid-md text-neutral-400"
        sizeClassName="text-micro tracking-[0.1725em]"
      />

      {/* `text-body` on the form itself is what every `em` below resolves
          against, so the whole control set scales as one. */}
      <form
        className="mt-fluid-xs flex flex-col gap-[1.14em] text-body"
        onSubmit={handleSubmit}
        noValidate
      >
        <input type="hidden" name="category" value={CATEGORY} />

        <div className="grid grid-cols-1 gap-[1.14em] sm:grid-cols-2">
          <div>
            <input
              ref={nameRef}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="/ Your name"
              value={name}
              disabled={isSubmitting}
              onChange={(event) =>
                handleFieldChange("name", event.target.value, setName)
              }
              className={fieldClassName(Boolean(errors.name))}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="/ Email"
              value={email}
              disabled={isSubmitting}
              onChange={(event) =>
                handleFieldChange("email", event.target.value, setEmail)
              }
              className={fieldClassName(Boolean(errors.email))}
            />
            <FieldError message={errors.email} />
          </div>
        </div>

        <div>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="/ Phone"
            value={phone}
            disabled={isSubmitting}
            onChange={(event) =>
              handleFieldChange("phone", event.target.value, setPhone)
            }
            className={fieldClassName(Boolean(errors.phone))}
          />
          <FieldError message={errors.phone} />
        </div>

        <div ref={servicesRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isServicesOpen}
            disabled={isSubmitting}
            onClick={() => setIsServicesOpen((open) => !open)}
            className={fieldClassName(
              Boolean(errors.services),
              `flex cursor-pointer items-center justify-between gap-[0.57em] text-left ${isServicesOpen ? "bg-[#EFEDE9]" : ""}`,
            )}
          >
            {isServicesOpen ? (
              <span className="text-[#392B56]/70">
                Services <span className="text-red-500">*</span>
              </span>
            ) : (
              <span
                className={
                  selectedServices.length > 0
                    ? "truncate text-[#392B56]"
                    : "text-[#8A8781]"
                }
              >
                {servicesTriggerLabel}
              </span>
            )}

            <svg
              className={`h-[1em] w-[1em] shrink-0 text-[#392B56]/60 transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M6 9l6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isServicesOpen && (
            <div
              role="listbox"
              aria-multiselectable="true"
              className="no-scrollbar absolute inset-x-0 top-full z-20 mt-[0.57em] max-h-[20.5em] overflow-y-auto rounded-lg border border-[#392B561F] bg-white p-[0.57em] shadow-lg"
            >
              {SERVICES.map((service) => {
                const checked = selectedServices.includes(service);

                return (
                  <label
                    key={service}
                    className="flex cursor-pointer items-center gap-[0.86em] rounded-md px-[0.86em] py-[0.71em] text-body text-[#392B56]/80 transition-colors hover:bg-[#F5F4F2]"
                  >
                    <span className="relative flex h-[1.14em] w-[1.14em] shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(service)}
                        className="peer sr-only"
                      />
                      <span className="h-[1.14em] w-[1.14em] rounded-sm border border-[#392B56]/30 transition-colors peer-checked:border-[#392B56] peer-checked:bg-[#392B56]" />
                      <svg
                        className={`absolute h-[0.86em] w-[0.86em] text-white ${checked ? "opacity-100" : "opacity-0"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    {service}
                  </label>
                );
              })}
            </div>
          )}
          <FieldError message={errors.services} />
        </div>

        <div>
          <textarea
            name="message"
            placeholder="/ Tell us about your project"
            rows={4}
            value={message}
            disabled={isSubmitting}
            onChange={(event) =>
              handleFieldChange("message", event.target.value, setMessage)
            }
            className={fieldClassName(Boolean(errors.message), "resize-none")}
          />
          <FieldError message={errors.message} />
        </div>

        <div className="mt-fluid-2xs flex flex-col items-center gap-fluid-xs md:flex-row">
          <ButtonBlue
            text="Send message"
            type="submit"
            className="w-full md:w-max"
            loading={isSubmitting}
          />
          <p className="text-micro text-[#8A8781]">
            We reply within two working days.
          </p>
        </div>

        {submitError && (
          <p role="alert" className="text-micro text-red-500">
            {submitError}
          </p>
        )}
      </form>
    </div>
  );
}
