import { google } from "@ai-sdk/google";
import { streamText, UIMessage } from "ai";

// Allow streaming responses up to 60 seconds (extra headroom for retries)
export const maxDuration = 60;

// ── Constants ────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000; // 2s, 4s, 8s exponential backoff

// ── Types ────────────────────────────────────────────────────────────
interface QuotaViolation {
  quotaMetric: string;
  quotaId: string;
  quotaDimensions?: Record<string, string>;
}

interface GeminiErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<{
      "@type": string;
      retryDelay?: string;
      violations?: QuotaViolation[];
    }>;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Convert UIMessages (parts-based) to the ModelMessage format that streamText expects */
function convertUIMessagesToModelMessages(uiMessages: UIMessage[]) {
  return uiMessages.map((msg) => ({
    role: msg.role as "user" | "assistant" | "system",
    content: msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(""),
  }));
}

/** Parse the retry delay from the Gemini 429 error body */
function parseRetryDelay(errorBody: GeminiErrorBody): number | null {
  const details = errorBody?.error?.details;
  if (!details) return null;

  for (const detail of details) {
    if (detail["@type"]?.includes("RetryInfo") && detail.retryDelay) {
      // retryDelay comes as "34s" or "12.856787033s"
      const seconds = parseFloat(detail.retryDelay.replace("s", ""));
      if (!isNaN(seconds)) return seconds * 1000;
    }
  }
  return null;
}

/** Log quota violation details for tracking which limit is hit */
function logQuotaViolations(errorBody: GeminiErrorBody) {
  const details = errorBody?.error?.details;
  if (!details) return;

  for (const detail of details) {
    if (detail["@type"]?.includes("QuotaFailure") && detail.violations) {
      for (const v of detail.violations) {
        console.error(
          `[QUOTA VIOLATION] metric: ${v.quotaMetric}, id: ${v.quotaId}, dimensions:`,
          v.quotaDimensions ?? {}
        );
      }
    }
  }
}

/** Check if the error indicates a hard daily quota (limit: 0) vs a temporary rate limit */
function isDailyQuotaExhausted(errorBody: GeminiErrorBody): boolean {
  const message = errorBody?.error?.message ?? "";
  // When limit is 0, the message contains "limit: 0"
  return message.includes("limit: 0");
}

/** Sleep helper */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main Handler ─────────────────────────────────────────────────────

export async function POST(req: Request) {
  console.log("[Chat API] Request received");
  const { messages, state, profile } = await req.json();
  console.log("[Chat API] Messages:", messages?.length, "| State:", state?.name ?? "none");

  // Build system prompt with context
  let systemPrompt =
    "You are an Election Commission of India assistant. You help citizens understand their voting rights, ID requirements, and deadlines in a concise and polite manner. Keep responses short and directly answer the user's question.";

  if (state) {
    systemPrompt += `\n\nThe user is voting in ${state.name}. The registration deadline is ${new Date(state.registrationDeadline).toLocaleDateString()}, and election day is ${new Date(state.electionDay).toLocaleDateString()}. Accepted IDs include: ${state.requiredID.join(", ")}. Postal ballot rules: ${state.absenteeRules}.`;
  }

  if (profile) {
    systemPrompt += `\n\nThe user's profile: Senior Citizen (85+): ${profile.isSeniorCitizen}, PwD: ${profile.isPwD}, Service Voter: ${profile.isServiceVoter}.`;
  }

  const modelMessages = convertUIMessagesToModelMessages(messages);

  // ── Retry loop with exponential backoff ──
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        messages: modelMessages,
      });

      return result.toUIMessageStreamResponse();
    } catch (err: unknown) {
      const error = err as { statusCode?: number; responseBody?: string; data?: GeminiErrorBody; message?: string };
      const statusCode = error.statusCode ?? 0;
      const errorBody: GeminiErrorBody =
        error.data ?? (error.responseBody ? JSON.parse(error.responseBody) : {});

      // ── Usage Logging ──
      console.error(
        `[Chat API] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed | Status: ${statusCode} | Message: ${errorBody?.error?.message?.slice(0, 120) ?? error.message}`
      );
      logQuotaViolations(errorBody);

      // ── 429 handling ──
      if (statusCode === 429) {
        // Check if daily quota is hard-exhausted (limit: 0)
        if (isDailyQuotaExhausted(errorBody)) {
          console.error("[Chat API] Daily quota exhausted (limit: 0). Not retrying.");
          return Response.json(
            {
              error: "quota_exhausted",
              message:
                "The Gemini API daily quota has been exhausted. Please try again later or update your API key with billing enabled.",
              retryable: false,
            },
            { status: 429 }
          );
        }

        // Temporary rate limit — retry with backoff
        if (attempt < MAX_RETRIES) {
          // Prefer server-specified retry delay, fall back to exponential backoff
          const serverDelay = parseRetryDelay(errorBody);
          const backoffDelay = BASE_DELAY_MS * Math.pow(2, attempt); // 2s, 4s, 8s
          const waitMs = serverDelay ?? backoffDelay;

          console.log(`[Chat API] Rate limited. Waiting ${(waitMs / 1000).toFixed(1)}s before retry...`);
          await sleep(waitMs);
          continue;
        }
      }

      // Non-429 error or retries exhausted
      if (attempt === MAX_RETRIES) {
        console.error(`[Chat API] All ${MAX_RETRIES + 1} attempts exhausted.`);
        return Response.json(
          {
            error: "api_error",
            message: errorBody?.error?.message ?? error.message ?? "An unexpected error occurred with the Gemini API.",
            retryable: statusCode === 429,
          },
          { status: statusCode || 500 }
        );
      }

      // For non-429 errors, don't retry
      return Response.json(
        {
          error: "api_error",
          message: errorBody?.error?.message ?? error.message ?? "An unexpected error occurred.",
          retryable: false,
        },
        { status: statusCode || 500 }
      );
    }
  }
}
