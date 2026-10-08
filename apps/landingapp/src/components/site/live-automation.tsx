"use client";

import {
  Calendar,
  Camera,
  CreditCard,
  Eye,
  FileCheck,
  HeartPulse,
  Languages,
  Mic,
  Moon,
  Phone,
  PhoneIncoming,
  ScanFace,
} from "lucide-react";
import { useReducedMotion } from "motion/react";

import { AnimatedList } from "@/components/ui/animated-list";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { LogoMark } from "@/components/logo-mark";

type Event = {
  product: string;
  action: string;
  icon: React.ElementType;
};

const events: Event[] = [
  { product: "Vaidya", action: "Booked a 4:30 PM appointment", icon: Calendar },
  { product: "TrueSkin", action: "Screening complete, report ready", icon: FileCheck },
  { product: "Vaidya", action: "Took a payment over the phone", icon: CreditCard },
  { product: "TrueSkin", action: "Heart rate read from the camera", icon: HeartPulse },
  { product: "Vaidya", action: "Switched to Hindi mid-call", icon: Languages },
  { product: "TrueSkin", action: "Skin check completed", icon: ScanFace },
  { product: "Vaidya", action: "Answered a call after hours", icon: PhoneIncoming },
  { product: "TrueSkin", action: "Sleep apnea risk flagged for follow-up", icon: Moon },
];

const feed = Array.from({ length: 3 }, (_, round) =>
  events.map((event, i) => ({ ...event, id: `${round}-${i}` })),
).flat();

function EventRow({ product, action, icon: Icon }: Event) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.25)]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
        <Icon className="size-5 text-brand" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{product}</p>
          <span className="text-xs text-muted-foreground">· just now</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{action}</p>
      </div>
      <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
    </div>
  );
}

function OrbitIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="flex size-full items-center justify-center rounded-full border border-border bg-card shadow-sm">
      <Icon className="size-1/2 text-brand" strokeWidth={1.5} />
    </div>
  );
}

export function LiveAutomation() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-border/70 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
            Live workflows
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Two products, one stream of work getting done
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Calls answered, slots booked, payments taken, screenings completed.
            Every channel plugs into the same automation layer.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 overflow-hidden rounded-3xl border border-border lg:grid-cols-2">
          <div className="relative border-b border-border p-6 sm:p-8 lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Activity</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex size-2">
                  {!reduce && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  )}
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Example feed
              </span>
            </div>

            <div className="relative mt-6 h-[380px] overflow-hidden">
              {reduce ? (
                <div className="flex flex-col gap-4">
                  {events.slice(0, 5).map((event) => (
                    <EventRow key={event.action} {...event} />
                  ))}
                </div>
              ) : (
                <AnimatedList delay={1600}>
                  {feed.map(({ id, ...event }) => (
                    <EventRow key={id} {...event} />
                  ))}
                </AnimatedList>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>

          <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden bg-card/40 p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--brand) 18%, transparent), transparent 60%)",
              }}
            />
            <div className="relative flex size-[420px] shrink-0 scale-[0.78] items-center justify-center sm:scale-100">
              <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl border border-brand/30 bg-card shadow-md">
                <LogoMark className="size-8" />
              </div>

              {!reduce && (
                <>
                  <OrbitingCircles iconSize={44} radius={100} duration={24}>
                    <OrbitIcon icon={Mic} />
                    <OrbitIcon icon={Eye} />
                  </OrbitingCircles>
                  <OrbitingCircles
                    iconSize={36}
                    radius={175}
                    duration={36}
                    reverse
                  >
                    <OrbitIcon icon={Phone} />
                    <OrbitIcon icon={Calendar} />
                    <OrbitIcon icon={CreditCard} />
                    <OrbitIcon icon={Languages} />
                    <OrbitIcon icon={Camera} />
                    <OrbitIcon icon={HeartPulse} />
                    <OrbitIcon icon={ScanFace} />
                  </OrbitingCircles>
                </>
              )}
            </div>

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground">
              Products inside, channels and tools outside
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
