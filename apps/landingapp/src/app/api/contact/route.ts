type ContactPayload = {
  name?: unknown
  email?: unknown
  company?: unknown
  phone?: unknown
  phoneCountryCode?: unknown
  phoneNumber?: unknown
  projectType?: unknown
  message?: unknown
}

type ContactSubmission = {
  name: string
  email: string
  company: string
  phone: string
  phoneCountryCode: string
  phoneNumber: string
  projectType: string
  message: string
  submittedAt: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function validate(payload: ContactPayload): ContactSubmission | Response {
  const submission = {
    name: asString(payload.name),
    email: asString(payload.email),
    company: asString(payload.company),
    phoneCountryCode: asString(payload.phoneCountryCode),
    phoneNumber: asString(payload.phoneNumber),
    phone: "",
    projectType: asString(payload.projectType),
    message: asString(payload.message),
    submittedAt: new Date().toISOString(),
  }
  submission.phone =
    submission.phoneCountryCode && submission.phoneNumber
      ? `${submission.phoneCountryCode} ${submission.phoneNumber}`
      : asString(payload.phone)

  if (!submission.name || !submission.email || !submission.projectType || !submission.message) {
    return Response.json(
      { message: "Please fill the required contact details." },
      { status: 400 }
    )
  }

  if (!emailPattern.test(submission.email)) {
    return Response.json(
      { message: "Please enter a valid email address." },
      { status: 400 }
    )
  }

  if (submission.message.length < 10) {
    return Response.json(
      { message: "Please add a little more detail about the project." },
      { status: 400 }
    )
  }

  return submission
}

export async function POST(request: Request) {
  let payload: ContactPayload

  try {
    payload = (await request.json()) as ContactPayload
  } catch {
    return Response.json({ message: "Invalid contact form payload." }, { status: 400 })
  }

  const validated = validate(payload)

  if (validated instanceof Response) {
    return validated
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (!webhookUrl) {
    return Response.json(
      { message: "Contact form is ready. Add GOOGLE_SHEETS_WEBHOOK_URL to save submissions." },
      { status: 503 }
    )
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validated),
  })

  if (!response.ok) {
    return Response.json(
      { message: "Could not save your details right now. Please email us directly." },
      { status: 502 }
    )
  }

  return Response.json({ message: "Thanks. Your details have been sent." })
}
