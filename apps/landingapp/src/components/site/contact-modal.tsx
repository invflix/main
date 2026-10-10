"use client"

import { type FormEvent, useEffect, useId, useState } from "react"
import { CheckCircle2, Loader2, Mail, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { countryCodes } from "@/lib/country-codes"
import { contactEmail } from "@/lib/data"
import { cn } from "@/lib/utils"

type SubmitState = "idle" | "submitting" | "success" | "error"

const initialForm = {
  name: "",
  email: "",
  company: "",
  phoneCountryCode: "+91",
  customPhoneCountryCode: "",
  phoneNumber: "",
  projectType: "",
  message: "",
}

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-3 focus:ring-ring/35"

const textareaClass =
  "min-h-28 w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-3 focus:ring-ring/35"

export function ContactModal() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [state, setState] = useState<SubmitState>("idle")
  const [message, setMessage] = useState("")
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state !== "submitting") setOpen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, state])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("submitting")
    setMessage("")
    const phoneCountryCode =
      form.phoneCountryCode === "custom"
        ? form.customPhoneCountryCode.trim()
        : form.phoneCountryCode

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phoneCountryCode }),
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(result.message ?? "Could not send your message.")
      }

      setState("success")
      setMessage(result.message ?? "Thanks. We will get back to you soon.")
      setForm(initialForm)
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "Could not send your message.")
    }
  }

  return (
    <>
      <ShimmerButton
        type="button"
        onClick={() => {
          setOpen(true)
          setState("idle")
          setMessage("")
        }}
        background="var(--brand)"
        className="gap-2 text-sm font-medium text-brand-foreground"
      >
        <Mail className="size-4" strokeWidth={1.8} />
        Contact us
      </ShimmerButton>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && state !== "submitting") setOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative max-h-[min(90vh,760px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(620px circle at 100% 0%, color-mix(in oklch, var(--brand) 16%, transparent), transparent 66%)",
              }}
            />

            <div className="relative border-b border-border p-6 sm:p-8">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close contact form"
                className="absolute top-4 right-4"
                disabled={state === "submitting"}
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>

              <p className="text-sm font-medium text-brand">Contact Inviflix</p>
              <h2 id={titleId} className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Tell us what you want to build
              </h2>
              <p id={descriptionId} className="mt-3 max-w-[54ch] text-sm leading-relaxed text-muted-foreground">
                Share the essentials and the founding team will review the project.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative grid gap-5 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Name
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className={inputClass}
                    placeholder="Your name"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className={inputClass}
                    placeholder={contactEmail}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Company
                  <input
                    name="company"
                    autoComplete="organization"
                    value={form.company}
                    onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                    className={inputClass}
                    placeholder="Company or team"
                  />
                </label>

                <div className="grid gap-2 text-sm font-medium text-foreground">
                  Phone
                  <div className="grid grid-cols-[minmax(7rem,9.5rem)_1fr] gap-2">
                    <select
                      name="phoneCountryCode"
                      value={form.phoneCountryCode}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phoneCountryCode: event.target.value,
                        }))
                      }
                      className={cn(inputClass, "appearance-none")}
                      aria-label="Phone country code"
                    >
                      {countryCodes.map((item) => (
                        <option key={`${item.country}-${item.code}`} value={item.code}>
                          {item.country} {item.code}
                        </option>
                      ))}
                      <option value="custom">Other country</option>
                    </select>
                    <input
                      name="phoneNumber"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={form.phoneNumber}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phoneNumber: event.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Phone number"
                    />
                  </div>
                  {form.phoneCountryCode === "custom" && (
                    <input
                      name="customPhoneCountryCode"
                      inputMode="tel"
                      value={form.customPhoneCountryCode}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          customPhoneCountryCode: event.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Enter country code, e.g. +358"
                      aria-label="Custom phone country code"
                    />
                  )}
                </div>
              </div>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Project type
                <select
                  required
                  name="projectType"
                  value={form.projectType}
                  onChange={(event) => setForm((current) => ({ ...current, projectType: event.target.value }))}
                  className={cn(inputClass, "appearance-none")}
                >
                  <option value="">Select a category</option>
                  <option value="Voice automation">Voice automation</option>
                  <option value="Healthcare AI">Healthcare AI</option>
                  <option value="Computer vision">Computer vision</option>
                  <option value="AI product build">AI product build</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Message
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  className={textareaClass}
                  placeholder="What are you building, who is it for, and when do you want to ship?"
                />
              </label>

              {message && (
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm",
                    state === "success"
                      ? "border-brand/30 bg-brand/10 text-foreground"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  )}
                  role="status"
                >
                  {message}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-4 text-brand" strokeWidth={1.5} />
                  {contactEmail}
                </a>

                <Button type="submit" size="lg" disabled={state === "submitting"} className="h-11 px-5">
                  {state === "submitting" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : state === "success" ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {state === "submitting" ? "Sending" : "Send details"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
