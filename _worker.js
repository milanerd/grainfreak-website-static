/**
 * GrainFreak Contact Form Worker
 * Deploy to Cloudflare Workers, set:
 *   DEST_EMAIL (e.g. info@grainfreak.com)
 *   MAILCHANNELS_DOMAIN (your domain verified with MailChannels)
 *   MAILCHANNELS_API_KEY
 *
 * POST /api/contact expects JSON:
 *   { name, email, company?, message, interest }
 */

const RATE_LIMIT_MAP = new Map();
const RATE_WINDOW = 60 * 10; // 10 minutes in seconds
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

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count++;
  return false;
}

async function sendEmail({ name, email, company, message, interest }) {
  const destEmail = DEST_EMAIL || "info@grainfreak.com";
  const domain = MAILCHANNELS_DOMAIN;

  if (!MAILCHANNELS_API_KEY || !domain) {
    console.log("MailChannels not configured. Logging submission:", { name, email, interest });
    return { success: true, mode: "log-only" };
  }

  const interestLabels = {
    general: "General inquiry",
    grainport: "GrainPort",
    pilot: "AI Agents pilot",
    demo: "Request a demo",
  };

  const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": MAILCHANNELS_API_KEY,
    },
    body: JSON.stringify({
      from: {
        email: `noreply@${domain}`,
        name: "GrainFreak Website",
      },
      subject: `${interestLabels[interest] || "New inquiry"} from ${name}`,
      personalizations: [{ to: [{ email: destEmail }] }],
      content: [
        {
          type: "text/plain",
          value: [
            `New contact form submission`,
            ``,
            `Name: ${name}`,
            `Email: ${email}`,
            company ? `Company: ${company}` : "",
            `Interest: ${interestLabels[interest] || interest}`,
            ``,
            `Message:`,
            message,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MailChannels error ${res.status}: ${body}`);
  }

  return { success: true, mode: "sent" };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/contact") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const ip = getClientIP(request);

    if (isRateLimited(ip)) {
      return Response.json(
        { status: "rate_limited", message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ status: "invalid_json", message: "Invalid request body." }, { status: 400 });
    }

    const { name, email, company, message, interest } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return Response.json({ status: "validation_error", message: "Name is required (min 2 characters)." }, { status: 422 });
    }
    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return Response.json({ status: "validation_error", message: "Valid email is required." }, { status: 422 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return Response.json({ status: "validation_error", message: "Message is required (min 10 characters)." }, { status: 422 });
    }

    const interestValue = ["general", "grainport", "pilot", "demo"].includes(interest) ? interest : "general";

    try {
      const result = await sendEmail({
        name: name.trim(),
        email: email.trim(),
        company: (company || "").trim().substring(0, 160),
        message: message.trim().substring(0, 4000),
        interest: interestValue,
      });
      return Response.json({ status: "received" }, { status: 200 });
    } catch (err) {
      console.error("Email send error:", err.message);
      return Response.json({ status: "received" }, { status: 200 });
    }
  },
};

function Response.json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
}