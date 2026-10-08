import {
  Calendar,
  CreditCard,
  Globe2,
  HeartPulse,
  Languages,
  Moon,
  PhoneIncoming,
  ScanFace,
} from "lucide-react"

import { Marquee } from "@/components/ui/marquee"
import { useCases } from "@/lib/data"

const icons = [PhoneIncoming, Calendar, CreditCard, Languages, ScanFace, HeartPulse, Moon, Globe2]

const items = useCases.map((label, i) => ({ label, icon: icons[i] }))
const half = Math.ceil(items.length / 2)
const rows = [items.slice(0, half), items.slice(half)]

function Chip({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <span className="mx-2 flex h-12 items-center gap-2.5 rounded-full border border-border bg-card py-1 pr-5 pl-1.5 text-sm font-medium whitespace-nowrap text-foreground/85 shadow-[0_6px_20px_-14px_rgba(0,0,0,0.4)]">
      <span className="flex size-9 items-center justify-center rounded-full bg-brand/12">
        <Icon className="size-4 text-brand" strokeWidth={1.75} />
      </span>
      {label}
    </span>
  )
}

export function TechMarquee() {
  return (
    <section className="border-b border-border/70 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium tracking-[0.14em] text-brand uppercase">
          What the suite handles today
        </p>
      </div>
      <div className="relative mt-8 space-y-3">
        <Marquee pauseOnHover className="[--duration:40s] [--gap:0rem] py-1">
          {rows[0].map((item, i) => (
            <Chip key={`a-${i}`} {...item} />
          ))}
        </Marquee>
        <Marquee pauseOnHover reverse className="[--duration:40s] [--gap:0rem] py-1">
          {rows[1].map((item, i) => (
            <Chip key={`b-${i}`} {...item} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent sm:w-40" />
      </div>
    </section>
  )
}
