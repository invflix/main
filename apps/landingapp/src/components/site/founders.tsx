import { ArrowUpRight, Mail, Sparkles } from "lucide-react"

import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { MagicCard } from "@/components/ui/magic-card"
import { contactEmail, founders } from "@/lib/data"
import { cn } from "@/lib/utils"

const avatarStyles = [
  {
    wrap: "from-brand/30 via-brand/10 to-foreground/10",
    shirt: "bg-foreground/80",
    skin: "bg-[oklch(0.78_0.06_65)]",
  },
  {
    wrap: "from-foreground/20 via-brand/15 to-brand/35",
    shirt: "bg-brand",
    skin: "bg-[oklch(0.68_0.07_58)]",
  },
]

function ProfileAvatar({
  name,
  index,
}: {
  name: string
  index: number
}) {
  const style = avatarStyles[index % avatarStyles.length]

  return (
    <div
      className={cn(
        "relative size-28 shrink-0 overflow-hidden rounded-2xl border border-border bg-linear-to-br shadow-[0_18px_50px_-28px_rgba(0,0,0,0.5)]",
        style.wrap
      )}
      aria-label={`${name} profile avatar`}
      role="img"
    >
      <div className="absolute inset-x-4 bottom-0 h-12 rounded-t-full bg-background/30 blur-sm" />
      <div className={cn("absolute left-1/2 bottom-[-22px] h-20 w-24 -translate-x-1/2 rounded-t-full", style.shirt)} />
      <div className={cn("absolute left-1/2 top-8 size-11 -translate-x-1/2 rounded-full", style.skin)} />
      <div className="absolute top-7 left-1/2 h-5 w-12 -translate-x-1/2 rounded-t-full bg-foreground/80" />
      <div className="absolute top-14 left-1/2 flex -translate-x-1/2 gap-3">
        <span className="size-1 rounded-full bg-foreground/70" />
        <span className="size-1 rounded-full bg-foreground/70" />
      </div>
      <div className="absolute top-19 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-foreground/35" />
    </div>
  )
}

export function Founders() {
  return (
    <section id="founders" className="relative overflow-hidden border-b border-border/70 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 overflow-hidden select-none"
      >
        <span className="block text-center text-[13vw] leading-none font-semibold tracking-tight whitespace-nowrap text-foreground/[0.035]">
          FOUNDERS
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-medium text-brand backdrop-blur">
              <Sparkles className="size-3.5" strokeWidth={1.7} />
              Founders
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built by the team behind Inviflix
            </h2>
            <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-muted-foreground">
              The founding team shaping Inviflix as a suite of focused AI products,
              from voice automation to camera-based health systems.
            </p>
          </div>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="size-4 text-brand" strokeWidth={1.5} />
            {contactEmail}
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {founders.map((founder, i) => (
            <BlurFade key={founder.name} inView direction="up" offset={16} delay={i * 0.08}>
              <a
                href="#contact"
                aria-label={`Contact Inviflix about working with ${founder.name}`}
                className="group block h-full rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MagicCard
                  className="h-full cursor-pointer rounded-2xl transition-transform duration-300 group-hover:-translate-y-1"
                  mode="orb"
                  glowFrom="var(--brand)"
                  glowTo="color-mix(in oklch, var(--foreground) 35%, transparent)"
                  glowOpacity={0.32}
                  glowBlur={72}
                  glowSize={440}
                  gradientFrom="var(--brand)"
                  gradientTo="color-mix(in oklch, var(--brand) 18%, transparent)"
                >
                  <article className="relative min-h-72 overflow-hidden p-6">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(520px circle at 100% 0%, color-mix(in oklch, var(--brand) 12%, transparent), transparent 62%)",
                      }}
                    />
                    {i === 0 && (
                      <BorderBeam
                        size={120}
                        duration={7}
                        colorFrom="var(--brand)"
                        colorTo="transparent"
                        borderWidth={1}
                      />
                    )}

                    <div className="relative flex h-full flex-col justify-between gap-8">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <ProfileAvatar name={founder.name} index={i} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-brand">{founder.role}</p>
                              <h3 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
                                {founder.name}
                              </h3>
                            </div>
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-colors group-hover:text-brand">
                              <ArrowUpRight
                                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                strokeWidth={1.5}
                              />
                            </span>
                          </div>
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            Founder at Inviflix, building category-specific AI products
                            that move from prototype to production.
                          </p>
                        </div>
                      </div>

                      <div className="relative flex flex-wrap gap-2">
                        {["Inviflix", "AI products", "Production systems"].map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-border bg-background/45 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </MagicCard>
              </a>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
