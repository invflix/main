"use client"

import { ArrowUpRight, Mic, Eye } from "lucide-react"

import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"
import { projects } from "@/lib/data"

const icons: Record<string, React.ElementType> = {
  Vaidya: Mic,
  TrueSkin: Eye,
}

function ProjectCell({ project, dark }: { project: (typeof projects)[number]; dark?: boolean }) {
  const Icon = icons[project.name]

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex h-full min-h-80 flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-colors",
        dark
          ? "border-transparent bg-foreground text-background hover:bg-foreground/90"
          : "border-border bg-card hover:border-brand/40"
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(420px circle at 85% 0%, color-mix(in oklch, var(--brand) 35%, transparent), transparent 70%)"
            : "radial-gradient(320px circle at 90% 100%, color-mix(in oklch, var(--brand) 18%, transparent), transparent 72%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            dark ? "bg-background/10" : "bg-brand/10"
          )}
        >
          <Icon className="size-5 text-brand" strokeWidth={1.5} />
        </div>
        <ArrowUpRight
          className={cn(
            "size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
            dark ? "text-background/50 group-hover:text-brand" : "text-muted-foreground group-hover:text-brand"
          )}
        />
      </div>

      <div className="relative">
        <p className="text-sm font-medium text-brand">{project.category}</p>
        <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{project.name}</h3>
        <p
          className={cn(
            "mt-2 max-w-[42ch] text-sm leading-relaxed",
            dark ? "text-background/70" : "text-muted-foreground"
          )}
        >
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span
              key={item}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                dark
                  ? "border-background/15 text-background/70"
                  : "border-border text-muted-foreground"
              )}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </a>
  )
}

export function Projects() {
  return (
    <section id="projects" className="relative isolate overflow-hidden border-b border-border/70 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 -translate-y-1/4 overflow-hidden select-none"
      >
        <span className="block text-center text-[14vw] leading-none font-semibold tracking-tight whitespace-nowrap text-foreground/[0.04]">
          WORK
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Products we&apos;ve shipped
          </h2>
          <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-muted-foreground">
            Two products, two categories, each built end to end: model,
            backend, and the interface people actually use.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project, i) => (
            <BlurFade
              key={project.name}
              inView
              direction="up"
              offset={16}
              delay={i * 0.08}
              className="h-full"
            >
              <ProjectCell project={project} dark={project.name === "Vaidya"} />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
