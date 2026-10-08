import { Rocket, Users, ShieldCheck } from "lucide-react"

import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { NumberTicker } from "@/components/ui/number-ticker"

const stats = [
  { value: 2, prefix: "", suffix: "", label: "Products live in two categories" },
  { value: 2, prefix: "", suffix: "", label: "Languages Vaidya switches between mid-call" },
  { value: 5, prefix: "<", suffix: " min", label: "TrueSkin camera screening" },
  { value: 4, prefix: "", suffix: "–8 wk", label: "Typical time to a first working version" },
]

const points = [
  {
    icon: Rocket,
    title: "Ships production code",
    description:
      "You get a running system with tests and documentation, not a notebook of experiments.",
  },
  {
    icon: Users,
    title: "One team, start to finish",
    description:
      "The engineers who scope the project also write the model code and the interface, so nothing gets lost in handoff.",
  },
  {
    icon: ShieldCheck,
    title: "Built for real traffic",
    description:
      "Vaidya and TrueSkin run with live users today. We design around the failure cases, not just the demo.",
  },
]

export function WhyUs() {
  return (
    <section className="border-b border-border/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Why teams bring Inviflix in
        </h2>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 border-y border-border py-10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {stat.prefix}
                <NumberTicker
                  value={stat.value}
                  delay={i * 0.1}
                  className="tracking-tight text-foreground dark:text-foreground"
                />
                <span className="text-2xl text-brand sm:text-3xl">{stat.suffix}</span>
              </dd>
              <p aria-hidden="true" className="mt-2 max-w-[24ch] text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {points.map((point, i) => (
            <BlurFade key={point.title} inView direction="up" offset={16} delay={i * 0.1}>
              <MagicCard
                className="h-full rounded-2xl"
                gradientFrom="var(--brand)"
                gradientTo="color-mix(in oklch, var(--brand) 40%, transparent)"
                gradientColor="color-mix(in oklch, var(--brand) 14%, transparent)"
                gradientOpacity={1}
              >
                <div className="p-6">
                  <point.icon className="size-6 text-brand" strokeWidth={1.5} />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
