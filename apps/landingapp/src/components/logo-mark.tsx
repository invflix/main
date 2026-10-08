import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" className="fill-brand" />
      <circle cx="16" cy="9.5" r="2.6" className="fill-brand-foreground" />
      <rect
        x="13"
        y="14.5"
        width="6"
        height="11.5"
        rx="3"
        className="fill-brand-foreground"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[1.05rem] font-semibold tracking-tight text-foreground">
        Inviflix
      </span>
    </span>
  )
}
