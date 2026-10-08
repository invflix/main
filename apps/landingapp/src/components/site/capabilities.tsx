import { CalendarCheck, Eye, HeartPulse, Mic, Network, Phone, Languages } from "lucide-react"

import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"
import { capabilities } from "@/lib/data"

const bottomIcons = [Eye, CalendarCheck, HeartPulse]

const voiceDetails = [
  {
    icon: Phone,
    title: "Inbound & outbound calling",
    tags: ["Telephony", "IVR routing"],
  },
  {
    icon: Languages,
    title: "Code-switches EN ↔ HI mid-call",
    tags: ["LLM routing", "Speech synthesis"],
  },
]

const orchestrationChips = [
  { label: "Model routing", className: "left-[6%] top-[12%]" },
  { label: "Cost-aware fallback", className: "right-[2%] top-[52%]" },
  { label: "Latency budget", className: "left-[16%] bottom-[8%]" },
]

export function Capabilities() {
  const [voice, vision, bookings, health, orchestration] = capabilities

  return (
    <section id="capabilities" className="border-b border-border/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
            Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The foundation under every product
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Different categories, same engineering bar. These are the capabilities
            every product in the suite is built on.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <BlurFade
              inView
              className="relative flex min-h-80 flex-col justify-between gap-8 border-b border-border bg-foreground p-8 text-background lg:border-r lg:border-b-0"
            >
              <div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-background/10">
                  <Mic className="size-5 text-brand" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{voice.title}</h3>
                <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-background/70">
                  {voice.description}
                </p>
              </div>

              <div className="space-y-3">
                {voiceDetails.map((detail) => (
                  <div
                    key={detail.title}
                    className="rounded-2xl border border-background/15 bg-background/5 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <detail.icon className="size-4 text-brand" strokeWidth={1.5} />
                      <p className="text-sm font-medium">{detail.title}</p>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {detail.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-background/15 px-2.5 py-0.5 text-xs text-background/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BlurFade>

            <BlurFade
              inView
              delay={0.08}
              className="relative flex min-h-80 flex-col justify-between overflow-hidden bg-card p-8"
            >
              <div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10">
                  <Network className="size-5 text-brand" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  {orchestration.title}
                </h3>
                <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
                  {orchestration.description}
                </p>
              </div>

              <div className="relative mt-8 flex min-h-48 flex-1 items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute rounded-full border border-brand/20"
                    style={{ width: `${(i + 1) * 64}px`, height: `${(i + 1) * 64}px` }}
                  />
                ))}
                <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md">
                  <Network className="size-4" strokeWidth={1.5} />
                </span>

                {orchestrationChips.map((chip) => (
                  <span
                    key={chip.label}
                    className={cn(
                      "absolute rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm",
                      chip.className
                    )}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </BlurFade>
          </div>

          <div className="grid grid-cols-1 border-t border-border sm:grid-cols-3">
            {[vision, bookings, health].map((capability, i) => {
              const Icon = bottomIcons[i]
              return (
                <BlurFade
                  key={capability.title}
                  inView
                  delay={0.16 + i * 0.08}
                  className={cn(
                    "flex flex-col gap-3 p-8",
                    i > 0 && "border-t border-border sm:border-t-0 sm:border-l"
                  )}
                >
                  <Icon className="size-5 text-brand" strokeWidth={1.5} />
                  <h3 className="text-base font-semibold text-foreground">
                    {capability.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {capability.description}
                  </p>
                </BlurFade>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
