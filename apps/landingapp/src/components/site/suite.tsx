"use client"

import { forwardRef, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { Check, Eye, Mic } from "lucide-react"

import { AnimatedBeam } from "@/components/ui/animated-beam"
import { BlurFade } from "@/components/ui/blur-fade"
import { LogoMark } from "@/components/logo-mark"

type Product = {
  name: string
  domain: string
  tagline: string
  icon: React.ElementType
  features: string[]
}

const vaidya: Product = {
  name: "Vaidya",
  domain: "Voice",
  tagline: "AI voice receptionist",
  icon: Mic,
  features: [
    "Answers and handles inbound calls",
    "Books appointments mid-call",
    "Takes payments over the phone",
    "Switches between Hindi and English",
  ],
}

const trueskin: Product = {
  name: "TrueSkin",
  domain: "Health",
  tagline: "Camera-based pre-screening",
  icon: Eye,
  features: [
    "Reads skin conditions",
    "Estimates cardiovascular vitals",
    "Flags sleep apnea risk",
    "Under five minutes, in the browser",
  ],
}

const foundation = ["LLM routing", "Speech", "Vision", "Telephony"]

const ProductCard = forwardRef<HTMLDivElement, { product: Product }>(
  function ProductCard({ product }, ref) {
    const Icon = product.icon
    return (
      <div
        ref={ref}
        className="relative z-10 mx-auto w-full max-w-sm rounded-2xl lg:mx-0 border border-border bg-card p-5 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10">
            <Icon className="size-5 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{product.name}</p>
              <span className="rounded-full border border-border px-2 py-0.5 text-[0.7rem] text-muted-foreground">
                {product.domain}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{product.tagline}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 border-t border-border pt-4">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="size-3.5 shrink-0 text-brand" strokeWidth={2.5} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    )
  }
)

export function Suite() {
  const reduce = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  const beamProps = {
    containerRef,
    toRef: hubRef,
    pathColor: "var(--border)",
    pathWidth: 1.5,
    pathOpacity: 0.6,
    gradientStartColor: "var(--brand)",
    gradientStopColor: "var(--brand)",
    duration: 3.5,
  }

  return (
    <section className="border-b border-border/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
            The suite
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A suite, not a single product
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Each product under Inviflix solves a different problem for a different
            category. They share an engineering foundation, not a codebase.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-3xl border border-border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_22%,transparent)_1px,transparent_1.5px)] bg-[length:22px_22px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--brand) 16%, transparent), transparent 55%)",
            }}
          />

          <div
            ref={containerRef}
            className="relative grid grid-cols-1 items-center justify-items-center gap-16 px-5 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_auto_1fr] lg:gap-20"
          >
            <BlurFade inView direction="right" offset={16} className="relative z-10 w-full lg:justify-self-start">
              <ProductCard ref={leftRef} product={vaidya} />
            </BlurFade>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                {!reduce && (
                  <span className="absolute inset-0 animate-ping rounded-3xl bg-brand/20 [animation-duration:2.5s]" />
                )}
                <div
                  ref={hubRef}
                  className="relative flex size-24 items-center justify-center rounded-3xl border border-brand/40 bg-card shadow-[0_0_60px_-12px_color-mix(in_oklch,var(--brand)_60%,transparent)]"
                >
                  <LogoMark className="size-11" />
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">Inviflix core</p>
              <div className="mt-3 flex max-w-[12rem] flex-wrap justify-center gap-1.5">
                {foundation.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <BlurFade inView direction="left" offset={16} delay={0.1} className="relative z-10 w-full lg:flex lg:justify-end">
              <ProductCard ref={rightRef} product={trueskin} />
            </BlurFade>

            {!reduce && (
              <>
                <AnimatedBeam {...beamProps} fromRef={leftRef} curvature={40} />
                <AnimatedBeam {...beamProps} fromRef={leftRef} curvature={-40} delay={1.2} reverse />
                <AnimatedBeam {...beamProps} fromRef={rightRef} curvature={40} delay={0.6} reverse />
                <AnimatedBeam {...beamProps} fromRef={rightRef} curvature={-40} delay={1.8} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
