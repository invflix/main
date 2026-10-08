"use client"

import { forwardRef, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  Bot,
  CalendarCheck,
  Check,
  CheckCircle2,
  CreditCard,
  FileCheck,
  HeartPulse,
  PhoneIncoming,
  ScanFace,
  Webcam,
} from "lucide-react"

import { AnimatedBeam } from "@/components/ui/animated-beam"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"

type Step = { icon: React.ElementType; title: string; detail: string }

type Flow = {
  id: string
  product: string
  name: string
  trigger: Step
  agent: { icon: React.ElementType; title: string; checks: string[] }
  actions: [Step, Step]
  result: Step
}

const flows: Flow[] = [
  {
    id: "vaidya",
    product: "Vaidya",
    name: "Inbound call",
    trigger: { icon: PhoneIncoming, title: "Incoming call", detail: "Caller speaks Hindi" },
    agent: {
      icon: Bot,
      title: "Vaidya agent",
      checks: ["Intent: book a visit", "Switched to Hindi", "Slot available"],
    },
    actions: [
      { icon: CalendarCheck, title: "Book appointment", detail: "Tue · 4:30 PM" },
      { icon: CreditCard, title: "Collect payment", detail: "Paid on the call" },
    ],
    result: { icon: CheckCircle2, title: "Booking confirmed", detail: "No staff involved" },
  },
  {
    id: "trueskin",
    product: "TrueSkin",
    name: "Camera screening",
    trigger: { icon: Webcam, title: "Scan started", detail: "Phone or laptop camera" },
    agent: {
      icon: ScanFace,
      title: "Vision pipeline",
      checks: ["Skin regions detected", "rPPG signal extracted", "Quality checks passed"],
    },
    actions: [
      { icon: ScanFace, title: "Skin analysis", detail: "Conditions flagged" },
      { icon: HeartPulse, title: "Vitals & apnea risk", detail: "From the camera feed" },
    ],
    result: { icon: FileCheck, title: "Report ready", detail: "Under five minutes" },
  },
]

const StepNode = forwardRef<
  HTMLDivElement,
  { step: Step; label: string; done?: boolean; className?: string }
>(function StepNode({ step, label, done, className }, ref) {
  const Icon = step.icon
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-10 w-full max-w-[15rem] rounded-2xl border border-border bg-card p-4 shadow-[0_12px_32px_-22px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {label}
        </span>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-3" strokeWidth={3} />
            Done
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <Icon className="size-4 text-brand" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-sm leading-snug font-semibold text-foreground">{step.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
        </div>
      </div>
    </div>
  )
})

const AgentNode = forwardRef<
  HTMLDivElement,
  { agent: Flow["agent"]; reduce: boolean | null }
>(function AgentNode({ agent, reduce }, ref) {
  const Icon = agent.icon
  return (
    <div
      ref={ref}
      className="relative z-10 w-full max-w-[17rem] overflow-hidden rounded-2xl border border-brand/40 bg-card p-5 shadow-[0_0_60px_-20px_color-mix(in_oklch,var(--brand)_70%,transparent)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div>
          <span className="text-[0.65rem] font-medium tracking-[0.12em] text-brand uppercase">
            AI agent
          </span>
          <p className="text-sm font-semibold text-foreground">{agent.title}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 border-t border-border pt-4">
        {agent.checks.map((check, i) => (
          <motion.li
            key={check}
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.35, duration: 0.3 }}
            className="flex items-center gap-2 text-xs text-foreground/80"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-brand/15">
              <Check className="size-2.5 text-brand" strokeWidth={3} />
            </span>
            {check}
          </motion.li>
        ))}
      </ul>
      {!reduce && (
        <BorderBeam size={90} duration={5} colorFrom="var(--brand)" colorTo="transparent" />
      )}
    </div>
  )
})

function Canvas({ flow }: { flow: Flow }) {
  const reduce = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const agentRef = useRef<HTMLDivElement>(null)
  const actionARef = useRef<HTMLDivElement>(null)
  const actionBRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const beam = {
    containerRef,
    pathColor: "var(--border)",
    pathWidth: 1.5,
    pathOpacity: 0.8,
    gradientStartColor: "var(--brand)",
    gradientStopColor: "var(--brand)",
    duration: 3,
    repeatDelay: 0.5,
  }

  return (
    <div
      ref={containerRef}
      className="relative grid grid-cols-1 items-center justify-items-center gap-12 px-5 py-12 sm:px-10 lg:grid-cols-[1fr_1.25fr_1fr_1fr] lg:gap-10"
    >
      <StepNode ref={triggerRef} step={flow.trigger} label="Trigger" />
      <AgentNode ref={agentRef} agent={flow.agent} reduce={reduce} />
      <div className="grid w-full grid-cols-2 justify-items-center gap-3 lg:grid-cols-1 lg:gap-6">
        <StepNode ref={actionARef} step={flow.actions[0]} label="Action" done />
        <StepNode ref={actionBRef} step={flow.actions[1]} label="Action" done />
      </div>
      <StepNode
        ref={resultRef}
        step={flow.result}
        label="Result"
        done
        className="border-emerald-500/30"
      />

      {!reduce && (
        <>
          <AnimatedBeam {...beam} fromRef={triggerRef} toRef={agentRef} />
          <AnimatedBeam {...beam} fromRef={agentRef} toRef={actionARef} curvature={20} delay={0.8} />
          <AnimatedBeam {...beam} fromRef={agentRef} toRef={actionBRef} curvature={-20} delay={0.8} />
          <AnimatedBeam {...beam} fromRef={actionARef} toRef={resultRef} curvature={20} delay={1.6} />
          <AnimatedBeam {...beam} fromRef={actionBRef} toRef={resultRef} curvature={-20} delay={1.6} />
        </>
      )}
    </div>
  )
}

export function Workflow() {
  const reduce = useReducedMotion()
  const [activeId, setActiveId] = useState(flows[0].id)
  const flow = flows.find((f) => f.id === activeId) ?? flows[0]

  return (
    <section className="border-b border-border/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
            Automation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From trigger to done, with no manual handoff
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Something happens, an agent decides, actions run in parallel, a result
            lands. No ticket, no queue, no waiting on someone to pick it up.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-card/30">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/70 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{flow.product}</span>
                {" / "}
                {flow.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <span className="relative flex size-2">
                  {!reduce && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  )}
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Running
              </span>
              <div role="tablist" aria-label="Example workflow" className="flex rounded-full border border-border bg-background p-1">
                {flows.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={f.id === activeId}
                    onClick={() => setActiveId(f.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      f.id === activeId
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.product}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_22%,transparent)_1px,transparent_1.5px)] bg-[length:22px_22px] opacity-40"
            />
            <Canvas key={flow.id} flow={flow} />
          </div>
        </div>
      </div>
    </section>
  )
}
