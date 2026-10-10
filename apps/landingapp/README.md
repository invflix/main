# Inviflix landing page

Marketing site for Inviflix, built with Next.js (App Router), Tailwind CSS v4, shadcn/ui, and Magic UI / Aceternity UI components.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Contact Form

The contact modal submits to `POST /api/contact`. Set `GOOGLE_SHEETS_WEBHOOK_URL`
to a Google Apps Script web app URL to save submissions into a Google Sheet.

Expected submitted fields: `name`, `email`, `company`, `phoneCountryCode`,
`phoneNumber`, `phone`, `projectType`, `message`, and `submittedAt`.

## Structure

- `src/app/page.tsx` assembles the sections from `src/components/site/`.
- `src/lib/data.ts` holds the content for products, capabilities, tech stack, and FAQ.
- `src/components/ui/` holds shadcn/ui and Magic UI / Aceternity UI components.
