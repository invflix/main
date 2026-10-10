import { Logo } from "@/components/logo-mark"
import { contactEmail } from "@/lib/data"

export function Footer() {
  return (
    <footer className="border-t border-border/70 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <Logo />
        <p className="text-sm text-muted-foreground">
          © 2026 Inviflix. A suite, not a single product.
        </p>
        <a
          href={`mailto:${contactEmail}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {contactEmail}
        </a>
      </div>
    </footer>
  )
}
