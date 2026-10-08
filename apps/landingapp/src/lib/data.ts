export type Project = {
  name: string
  domain: string
  category: string
  description: string
  stack: string[]
  href: string
}

export const projects: Project[] = [
  {
    name: "Vaidya",
    domain: "Voice",
    category: "AI Operations & Voice Systems",
    description:
      "An AI voice receptionist for Indian businesses. It answers calls, books appointments, takes payments over the phone, and switches naturally between Hindi and English.",
    stack: ["Speech orchestration", "Telephony (Exotel)", "LLM routing"],
    href: "https://chaibytes.in/#projects",
  },
  {
    name: "TrueSkin",
    domain: "Health",
    category: "Healthcare AI · Computer Vision",
    description:
      "A browser-based pre-screening tool that reads skin conditions, cardiovascular vitals, and sleep apnea risk from a phone or laptop camera in under five minutes.",
    stack: ["rPPG", "MediaPipe", "Computer vision"],
    href: "https://trueskin.chaibytes.in/",
  },
]

export type Capability = {
  title: string
  description: string
}

export const capabilities: Capability[] = [
  {
    title: "Voice & telephony",
    description:
      "Real-time speech agents that place and receive calls, with carrier integration and code-switching between languages built in.",
  },
  {
    title: "Computer vision",
    description:
      "Camera-based sensing for health, safety, and quality checks, running in the browser without specialised hardware.",
  },
  {
    title: "Bookings & payments",
    description:
      "Agents that book appointments and collect payments while the caller is still on the line.",
  },
  {
    title: "Health signals",
    description:
      "Cardiovascular vitals and sleep apnea risk read from an ordinary phone or laptop camera, in under five minutes.",
  },
  {
    title: "LLM orchestration",
    description:
      "Custom routing across models and tools, built for latency and cost budgets that a single vendor API can't hit alone.",
  },
]

export const useCases = [
  "Answers every call, day or night",
  "Books appointments mid-call",
  "Takes payments over the phone",
  "Switches between Hindi and English",
  "Screens skin conditions from a camera",
  "Reads heart vitals without a wearable",
  "Flags sleep apnea risk",
  "Runs in the browser, no app install",
]

export type FaqItem = {
  question: string
  answer: string
}

export const faqs: FaqItem[] = [
  {
    question: "Is Inviflix one product or several?",
    answer:
      "Several. Inviflix is a suite: Vaidya and TrueSkin are independent products in different categories, voice and health, not features of a single app.",
  },
  {
    question: "Do you work on an existing product or start from scratch?",
    answer:
      "Both. Some engagements plug an AI layer into a product you already run; others start from a blank repo. We scope that in the first call.",
  },
  {
    question: "How long does a typical build take?",
    answer:
      "A first working version usually ships in four to eight weeks, then we iterate with you against real usage instead of a fixed spec.",
  },
  {
    question: "Who is this for?",
    answer:
      "Teams who need an AI feature in production, not a slide deck: founders, product leads, and operators who already know what the system needs to do.",
  },
]
