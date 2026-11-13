/**
 * GrainFreak website contact form, Cloudflare Pages advanced mode.
 * Configure RESEND_API_KEY as a secret and verify grainfreak.com in Resend.
 * Optional DEST_EMAIL defaults to info@grainfreak.com.
 * Note: in-memory rate limiting is best-effort per isolate, not a global limit.
 */
const RATE_LIMIT_MAP = new Map();
const RATE_WINDOW = 60 * 10;
const MAX_REQUESTS = 5;

function getClientIP(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function isRateLimited(ip) {
  const now = Math.floor(Date.now() / 1000);
  const entry = RATE_LIMIT_MAP.get(ip);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}

async function sendEmail(env, { name, email, company, message, interest }) {
  if (!env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  const interestLabels = {
    general: "General inquiry", grainport: "GrainPort",
    pilot: "AI Agents pilot", demo: "Request a demo",
  };
  const label = interestLabels[interest] || "General inquiry";
  const content = [
    "New contact form submission", "",
    `Name: ${name}`, `Email: ${email}`,
    company ? `Company: ${company}` : "", `Interest: ${label}`, "",
    "Message:", message,
  ].filter(Boolean).join("\n");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "GrainFreak Website <noreply@grainfreak.com>",
      to: [env.DEST_EMAIL || "info@grainfreak.com"],
      subject: `${label} from ${name.replace(/[\r\n]/g, " ")}`,
      text: content,
    }),
  });
  if (!res.ok) {
    console.error("Email provider returned HTTP", res.status);
    throw new Error(`Email provider HTTP ${res.status}`);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve the static website when a non-API request reaches the Worker.
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }
    if (url.pathname !== "/api/contact") {
      return json({ status: "not_found" }, 404);
    }
    if (request.method !== "POST") {
      return json({ status: "method_not_allowed" }, 405, { Allow: "POST" });
    }
    if (isRateLimited(getClientIP(request))) {
      return json({ status: "rate_limited", message: "Too many requests. Please try again later." }, 429);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ status: "invalid_json", message: "Invalid request body." }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ status: "validation_error", message: "Invalid form submission." }, 422);
    }
    const { name, email, company, message, interest } = body;
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 160) {
      return json({ status: "validation_error", message: "Name must be 2–160 characters." }, 422);
    }
    if (typeof email !== "string" || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return json({ status: "validation_error", message: "Valid email is required." }, 422);
    }
    if (typeof message !== "string" || message.trim().length < 10 || message.length > 4000) {
      return json({ status: "validation_error", message: "Message must be 10–4000 characters." }, 422);
    }
    if (company != null && (typeof company !== "string" || company.length > 160)) {
      return json({ status: "validation_error", message: "Invalid company name." }, 422);
    }
    const validInterest = ["general", "grainport", "pilot", "demo"].includes(interest) ? interest : "general";

    try {
      await sendEmail(env, {
        name: name.trim(), email: email.trim(),
        company: (company || "").trim(), message: message.trim(), interest: validInterest,
      });
      return json({ status: "received" }, 200);
    } catch (err) {
      console.error("Contact form email send failed:", err.message);
      return json({ status: "send_failed", message: "We could not send your message. Please email info@grainfreak.com." }, 502);
    }
  },
};
