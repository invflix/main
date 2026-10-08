"use client"

import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { TextAnimate } from "@/components/ui/text-animate"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { Spotlight } from "@/components/ui/spotlight-new"

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-border/70 bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_32%,transparent)_1px,transparent_1.5px)] bg-[length:30px_30px] opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] dark:opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -bottom-[32%] -z-10 aspect-[2/1] w-[140%] -translate-x-1/2 rounded-[50%] opacity-40 blur-3xl dark:opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklch, var(--brand) 55%, transparent) 0%, color-mix(in oklch, var(--brand) 16%, transparent) 38%, transparent 72%)",
        }}
      />

      {!reduce && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <Spotlight
            gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(45, 100%, 70%, .16) 0, hsla(45, 100%, 55%, .05) 50%, hsla(45, 100%, 45%, 0) 80%)"
            gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(45, 100%, 75%, .12) 0, hsla(45, 100%, 55%, .04) 80%, transparent 100%)"
            gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(45, 100%, 75%, .08) 0, hsla(45, 100%, 45%, .03) 80%, transparent 100%)"
          />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pt-20 pb-40 sm:px-6 lg:px-8 lg:pt-24 lg:pb-56">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 py-1 pr-4 pl-1 backdrop-blur-sm">
            <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
              Inviflix
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              AI product suite, not a single app
            </span>
          </span>

          {reduce ? (
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground md:text-5xl lg:text-6xl">
              Different products. Different categories. One suite.
            </h1>
          ) : (
            <TextAnimate
              as="h1"
              by="word"
              animation="blurInUp"
              duration={0.5}
              className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground md:text-5xl lg:text-6xl"
            >
              Different products. Different categories. One suite.
            </TextAnimate>
          )}
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            Inviflix is a product suite: an AI voice receptionist and a
            camera-based health screener, each built for its own category.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <InteractiveHoverButton
              className="h-10 px-6 text-sm"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
              }
            >
              Book a call
            </InteractiveHoverButton>
            <Button
              size="lg"
              variant="outline"
              className="h-10 px-5"
              render={<a href="#projects" />}
              nativeButton={false}
            >
              View products
            </Button>
          </div>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden select-none"
      >
        <span className="block translate-y-[18%] text-center text-[20vw] leading-none font-semibold tracking-tight whitespace-nowrap text-foreground/[0.1] dark:text-foreground/[0.07]">
          INVIFLIX
        </span>
      </div>
    </section>
  )
}
