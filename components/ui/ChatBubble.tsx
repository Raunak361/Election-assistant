"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useElectionData } from "@/hooks/useElectionData";

// ── Throttle helper ──────────────────────────────────────────────────
// Prevents rapid-fire submissions (e.g. double-clicks, key-repeat)
const THROTTLE_MS = 2000; // minimum 2s between submissions

// ── Error types from our API ─────────────────────────────────────────
interface ChatAPIError {
  error: "quota_exhausted" | "api_error";
  message: string;
  retryable: boolean;
}

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [quotaError, setQuotaError] = useState<ChatAPIError | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const { selectedState, profile } = useElectionData();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [{ type: 'text', text: "Hi! I am the Election Commission Assistant. How can I help you today?" }]
      }
    ] as UIMessage[],
    onError: (err) => {
      // Try to parse structured error from our API route
      try {
        const parsed: ChatAPIError = JSON.parse(err.message);
        if (parsed.error === "quota_exhausted") {
          setQuotaError(parsed);
        }
      } catch {
        // Non-JSON error, let the default error state handle it
        console.error("[ChatBubble] Error:", err.message);
      }
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Keep scroll at bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // ── Throttled submit ───────────────────────────────────────────────
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Throttle: block if submitted too recently
    const now = Date.now();
    if (now - lastSubmitTime < THROTTLE_MS) {
      console.log("[ChatBubble] Throttled — too soon since last submit");
      return;
    }

    // Clear any previous errors
    if (quotaError) setQuotaError(null);
    if (error) clearError();

    setLastSubmitTime(now);

    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }]
    }, {
      body: {
        state: selectedState,
        profile: profile
      }
    });
    setInput("");
  }, [input, lastSubmitTime, quotaError, error, clearError, sendMessage, selectedState, profile]);

  // ── Dismiss quota error ────────────────────────────────────────────
  const dismissQuotaError = () => {
    setQuotaError(null);
    if (error) clearError();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
            style={{ height: "400px" }}
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm">ECI Assistant</h3>
                <p className="text-indigo-200 text-xs">Ask anything about voting</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-indigo-200 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-indigo-100 text-indigo-900 ml-auto rounded-tr-sm dark:bg-indigo-900/50 dark:text-indigo-100"
                      : "bg-slate-100 text-slate-800 rounded-tl-sm dark:bg-slate-800 dark:text-slate-200"
                  )}
                >
                  {msg.parts.map((part, pi) => (
                    part.type === 'text' && <span key={pi}>{part.text}</span>
                  ))}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="bg-slate-100 text-slate-800 rounded-tl-sm dark:bg-slate-800 dark:text-slate-200 max-w-[85%] rounded-2xl px-4 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              )}

              {/* ── Quota Exhausted Banner ── */}
              {quotaError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        API Quota Exhausted
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                        {quotaError.message}
                      </p>
                      <button
                        onClick={dismissQuotaError}
                        className="mt-2 flex items-center gap-1 text-amber-600 dark:text-amber-300 hover:underline font-medium"
                      >
                        <RefreshCw className="h-3 w-3" /> Dismiss &amp; retry
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Generic Error Banner ── */}
              {error && !quotaError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl p-3 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                        Something went wrong
                      </p>
                      <p className="text-red-700 dark:text-red-400 leading-relaxed">
                        Failed to get a response. Please try again.
                      </p>
                      <button
                        onClick={() => clearError()}
                        className="mt-2 flex items-center gap-1 text-red-600 dark:text-red-300 hover:underline font-medium"
                      >
                        <RefreshCw className="h-3 w-3" /> Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <form
                onSubmit={onSubmit}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={quotaError ? "Quota exhausted — try later" : "Ask a question..."}
                  disabled={!!quotaError}
                  className={cn(
                    "flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                    quotaError
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  )}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !!quotaError}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
