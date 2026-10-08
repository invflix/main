"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"

import { Logo } from "@/components/logo-mark"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "#projects", label: "Products" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#faq", label: "FAQ" },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex h-14 items-center justify-between rounded-full border border-border/70 bg-background/80 px-3 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.35)] backdrop-blur-md sm:h-16 sm:px-4">
          <a href="#top" className="flex items-center pl-1" onClick={() => setOpen(false)}>
            <Logo />
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Button
              render={<a href="#contact" />}
              nativeButton={false}
            >
              Book a call
            </Button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[max-height,margin-top,opacity] duration-300 ease-in-out lg:hidden",
            open ? "mt-2 max-h-64 opacity-100" : "mt-0 max-h-0 border-transparent opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button
              render={<a href="#contact" />}
              nativeButton={false}
              className="mt-2"
              onClick={() => setOpen(false)}
            >
              Book a call
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
