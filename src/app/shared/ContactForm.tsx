"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonWhite } from "@/app/shared/Button";
import SuccessCheckIcon from "@/app/shared/SuccessCheckIcon";
import { CONTACT_FIRST_FIELD_ID } from "@/lib/contactCta";

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
const LOADING_DURATION_MS = 5000;
const SUCCESS_DURATION_MS = 5000;

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
      return (value as string).trim() === "" ? "Name is required" : undefined;
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

const baseInputClassName =
  "w-full rounded-lg border bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";

function fieldClassName(hasError: boolean, extra = "") {
  return `${baseInputClassName} ${hasError ? "border-red-500" : "border-transparent"} ${extra}`;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const servicesRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isServicesOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsServicesOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isServicesOpen]);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

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
      setErrors((prev) => ({ ...prev, services: validateField("services", next) }));
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSelectedServices([]);
    setErrors({});
    setHasSubmitted(false);
    setStatus("idle");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) return;

    setIsServicesOpen(false);
    setStatus("loading");

    loadingTimeoutRef.current = setTimeout(() => {
      setStatus("success");
      successTimeoutRef.current = setTimeout(resetForm, SUCCESS_DURATION_MS);
    }, LOADING_DURATION_MS);
  }

  const servicesTriggerLabel = isServicesOpen
    ? null
    : selectedServices.length > 0
      ? selectedServices.join(", ")
      : "/ Service *";

  const isSubmitting = status === "loading";
  const isFlipped = status === "success";

  return (
    <div className="relative mt-6 [perspective:1200px]">
      <div
        className="relative transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <form
          className={`flex flex-col gap-3 [backface-visibility:hidden] ${isFlipped ? "pointer-events-none" : ""}`}
          onSubmit={handleSubmit}
          noValidate
          inert={isFlipped}
        >
          <input
            // Focused by the contact CTAs once their scroll lands — see
            // `lib/contactCta.ts`.
            id={CONTACT_FIRST_FIELD_ID}
            type="text"
            name="name"
            placeholder="/ Your name *"
            value={name}
            disabled={isSubmitting}
            onChange={(event) => handleFieldChange("name", event.target.value, setName)}
            className={fieldClassName(Boolean(errors.name))}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              name="email"
              placeholder="/ Email *"
              value={email}
              disabled={isSubmitting}
              onChange={(event) => handleFieldChange("email", event.target.value, setEmail)}
              className={fieldClassName(Boolean(errors.email))}
            />
            <input
              type="tel"
              name="phone"
              placeholder="/ Phone *"
              value={phone}
              disabled={isSubmitting}
              onChange={(event) => handleFieldChange("phone", event.target.value, setPhone)}
              className={fieldClassName(Boolean(errors.phone))}
            />
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
                `flex items-center justify-between gap-2 text-left ${isServicesOpen ? "bg-white/10" : ""}`,
              )}
            >
              {isServicesOpen ? (
                <span className="text-white/70">
                  Services <span className="text-red-400">*</span>
                </span>
              ) : (
                <span
                  className={
                    selectedServices.length > 0 ? "truncate text-white" : "text-white/40"
                  }
                >
                  {servicesTriggerLabel}
                </span>
              )}

              <svg
                className={`h-3.5 w-3.5 shrink-0 text-white/60 transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isServicesOpen && (
              <div
                role="listbox"
                aria-multiselectable="true"
                className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-[#2b2148] p-2 shadow-lg"
              >
                {SERVICES.map((service) => {
                  const checked = selectedServices.includes(service);

                  return (
                    <label
                      key={service}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5"
                    >
                      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(service)}
                          className="peer sr-only"
                        />
                        <span className="h-4 w-4 rounded-sm border border-white/30 transition-colors peer-checked:border-white peer-checked:bg-white" />
                        <svg
                          className={`absolute h-3 w-3 text-[#392B56] ${checked ? "opacity-100" : "opacity-0"}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>

                      {service}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <textarea
            name="message"
            placeholder="/ Tell us about your project"
            rows={3}
            value={message}
            disabled={isSubmitting}
            onChange={(event) => handleFieldChange("message", event.target.value, setMessage)}
            className={fieldClassName(Boolean(errors.message), "resize-none")}
          />

          <ButtonWhite text="Send enquiry" type="submit" className="mt-2" loading={isSubmitting} />
        </form>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${isFlipped ? "" : "pointer-events-none"}`}
          inert={!isFlipped}
        >
          <SuccessCheckIcon />
          <p className="text-lg text-white">Thank you!</p>
          <p className="max-w-xs text-sm text-white/60">
            We&apos;ve received your enquiry and will get back to you soon.
          </p>
        </div>
      </div>
    </div>
  );
}
