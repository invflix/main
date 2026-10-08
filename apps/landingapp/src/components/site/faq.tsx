import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs } from "@/lib/data"

export function Faq() {
  return (
    <section id="faq" className="border-b border-border/70 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Questions worth answering upfront
        </h2>

        <Accordion defaultValue={["0"]} className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={String(i)}>
              <AccordionTrigger className="text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
