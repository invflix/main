"use client"

import { useReducedMotion } from "motion/react"

import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Globe } from "@/components/ui/globe"

const GLOBE_CONFIG = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.32,
  dark: 0,
  diffuse: 0.55,
  mapSamples: 16000,
  mapBrightness: 1.4,
  baseColor: [0.86, 0.82, 0.73] as [number, number, number],
  markerColor: [0.93, 0.72, 0.16] as [number, number, number],
  glowColor: [0.82, 0.68, 0.4] as [number, number, number],
  markers: [
    { location: [19.076, 72.8777] as [number, number], size: 0.1 },
    { location: [28.6139, 77.209] as [number, number], size: 0.08 },
    { location: [12.9716, 77.5946] as [number, number], size: 0.07 },
    { location: [1.3521, 103.8198] as [number, number], size: 0.06 },
    { location: [51.5072, -0.1276] as [number, number], size: 0.06 },
  ],
}

export function Cta() {
  const reduce = useReducedMotion()

  return (
    <section id="contact" className="relative overflow-hidden pt-20 sm:pt-28">
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Have a product worth adding to the suite?
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Tell us what category it is in. We will tell you honestly if it is a
          four-week build or a longer bet.
        </p>
        <div className="mt-8 flex justify-center">
          <a href="mailto:hello@inviflix.com">
            <ShimmerButton
              background="var(--brand)"
              className="text-sm font-medium text-brand-foreground"
            >
              Book a call
            </ShimmerButton>
          </a>
        </div>
      </div>

      <div className="relative mt-16 h-[220px] overflow-hidden sm:mt-20 sm:h-[300px] lg:h-[360px]">
        {!reduce && (
          <div className="pointer-events-none absolute top-0 left-1/2 aspect-square w-[30rem] -translate-x-1/2 opacity-90 sm:w-[34rem] lg:w-[37rem]">
            <Globe config={GLOBE_CONFIG} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>
    </section>
  )
}
