"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { contactEmail } from "@/content/site";

/**
 * Join and Contact forms.
 *
 * Honest behaviour: no backend is connected yet, so submission runs full
 * validation, shows a loading state, and then a success state that says
 * clearly the message was NOT transmitted — with the visitor's text
 * preserved on screen and a prefilled mailto fallback, so nothing typed
 * is ever silently discarded.
 *
 * To connect a real backend, replace `simulateSubmit` with a fetch to your
 * endpoint (see README → "Connecting the forms").
 */

function simulateSubmit(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 900));
}

function Field({
  label,
  error,
  children,
  optional,
}: {
  label: string;
  error?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => ReactNode;
  optional?: boolean;
}) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-2">(optional)</span>}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errId : undefined,
      })}
      {error && (
        <p id={errId} role="alert" className="mt-1.5 text-sm text-[#a4552e]">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessNote({ summary }: { summary: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-cyan bg-cyan/20 p-6"
    >
      <p className="font-medium">Thank you — your message is ready.</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        A small honesty note: this site is not yet connected to a backend, so
        nothing has been transmitted. Your text is preserved below. To reach us
        now, use the pre-addressed email button — it opens your mail client
        with everything filled in.
      </p>
      <a
        className="btn-primary mt-4 text-sm"
        href={`mailto:${contactEmail}?subject=${encodeURIComponent(
          "begod.ai — via website form",
        )}&body=${encodeURIComponent(summary)}`}
      >
        Open email draft
      </a>
      <pre className="mt-4 overflow-x-auto rounded-lg border hairline bg-surface p-4 font-mono text-xs whitespace-pre-wrap text-ink-2">
        {summary}
      </pre>
    </div>
  );
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ----------------------------- Join form ----------------------------- */

const contributionAreas = [
  "Engineering",
  "Agent architecture",
  "Model evaluation",
  "Security",
  "Governance",
  "Philosophy",
  "Economics",
  "Research",
  "Product design",
  "Visual communication",
  "Documentation",
  "Community",
  "Constructive criticism",
];

export function JoinForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    area: "",
    skills: "",
    link: "",
    why: "",
    how: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const set = (k: keyof typeof values) => (v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Please tell us your name.";
    if (!values.email.trim()) errs.email = "Please add an email address.";
    else if (!isEmail(values.email)) errs.email = "That email address doesn't look valid.";
    if (!values.area) errs.area = "Please choose the area closest to your contribution.";
    if (!values.why.trim()) errs.why = "A sentence or two is enough — why this project?";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    await simulateSubmit();
    setState("done");
  }

  if (state === "done") {
    const summary = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Area of contribution: ${values.area}`,
      values.skills && `Skills / perspective: ${values.skills}`,
      values.link && `Link: ${values.link}`,
      `Why the project interests me:\n${values.why}`,
      values.how && `How I'd like to contribute:\n${values.how}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    return <SuccessNote summary={summary} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          {(p) => (
            <input
              {...p}
              className="field"
              autoComplete="name"
              value={values.name}
              onChange={(e) => set("name")(e.target.value)}
            />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {(p) => (
            <input
              {...p}
              type="email"
              className="field"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set("email")(e.target.value)}
            />
          )}
        </Field>
      </div>
      <Field label="Area of contribution" error={errors.area}>
        {(p) => (
          <select
            {...p}
            className="field"
            value={values.area}
            onChange={(e) => set("area")(e.target.value)}
          >
            <option value="">Choose an area…</option>
            {contributionAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Skills or perspective" optional>
        {(p) => (
          <input
            {...p}
            className="field"
            placeholder="e.g. distributed systems, moral philosophy, red-teaming…"
            value={values.skills}
            onChange={(e) => set("skills")(e.target.value)}
          />
        )}
      </Field>
      <Field label="GitHub or personal website" optional>
        {(p) => (
          <input
            {...p}
            type="url"
            className="field"
            placeholder="https://…"
            value={values.link}
            onChange={(e) => set("link")(e.target.value)}
          />
        )}
      </Field>
      <Field label="Why does the project interest you?" error={errors.why}>
        {(p) => (
          <textarea
            {...p}
            className="field min-h-28"
            value={values.why}
            onChange={(e) => set("why")(e.target.value)}
          />
        )}
      </Field>
      <Field label="How would you like to contribute?" optional>
        {(p) => (
          <textarea
            {...p}
            className="field min-h-28"
            value={values.how}
            onChange={(e) => set("how")(e.target.value)}
          />
        )}
      </Field>
      <button type="submit" className="btn-primary" disabled={state === "loading"}>
        {state === "loading" && (
          <Loader2 size={16} aria-hidden="true" className="animate-spin" />
        )}
        {state === "loading" ? "Preparing…" : "Join the movement"}
      </button>
    </form>
  );
}

/* ---------------------------- Contact form ---------------------------- */

const enquiryTypes = [
  "Research enquiry",
  "Contribution enquiry",
  "Institutional discussion",
  "Media enquiry",
  "Governance discussion",
  "General contact",
];

export function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    org: "",
    type: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const set = (k: keyof typeof values) => (v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Please tell us your name.";
    if (!values.email.trim()) errs.email = "Please add an email address.";
    else if (!isEmail(values.email)) errs.email = "That email address doesn't look valid.";
    if (!values.type) errs.type = "Please choose the type of enquiry.";
    if (!values.message.trim()) errs.message = "Please include a message.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    await simulateSubmit();
    setState("done");
  }

  if (state === "done") {
    const summary = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.org && `Organisation: ${values.org}`,
      `Type of enquiry: ${values.type}`,
      `Message:\n${values.message}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    return <SuccessNote summary={summary} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          {(p) => (
            <input
              {...p}
              className="field"
              autoComplete="name"
              value={values.name}
              onChange={(e) => set("name")(e.target.value)}
            />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {(p) => (
            <input
              {...p}
              type="email"
              className="field"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set("email")(e.target.value)}
            />
          )}
        </Field>
      </div>
      <Field label="Organisation" optional>
        {(p) => (
          <input
            {...p}
            className="field"
            autoComplete="organization"
            value={values.org}
            onChange={(e) => set("org")(e.target.value)}
          />
        )}
      </Field>
      <Field label="Type of enquiry" error={errors.type}>
        {(p) => (
          <select
            {...p}
            className="field"
            value={values.type}
            onChange={(e) => set("type")(e.target.value)}
          >
            <option value="">Choose a type…</option>
            {enquiryTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Message" error={errors.message}>
        {(p) => (
          <textarea
            {...p}
            className="field min-h-36"
            value={values.message}
            onChange={(e) => set("message")(e.target.value)}
          />
        )}
      </Field>
      <button type="submit" className="btn-primary" disabled={state === "loading"}>
        {state === "loading" && (
          <Loader2 size={16} aria-hidden="true" className="animate-spin" />
        )}
        {state === "loading" ? "Preparing…" : "Send message"}
      </button>
    </form>
  );
}
