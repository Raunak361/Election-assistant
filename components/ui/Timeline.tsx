"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDeadlinePassed } from "@/lib/election-engine";

interface TimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {items.map((item, index) => {
        const passed = isDeadlinePassed(item.date);
        const isExpanded = expandedId === item.id;
        const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <div key={item.id} className="relative pl-8">
            {/* Vertical Line connecting nodes */}
            {index < items.length - 1 && (
              <div className="absolute left-3 top-8 bottom-[-24px] w-[2px] bg-slate-200 dark:bg-slate-800" />
            )}

            {/* Node Icon */}
            <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center bg-white dark:bg-[#0F172A]">
              {passed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-indigo-500" />
              )}
            </div>

            {/* Content Box */}
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors cursor-pointer",
                passed
                  ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 opacity-60 grayscale-[0.5]"
                  : "border-indigo-100 bg-white dark:border-indigo-900/50 dark:bg-[#1E1B4B]/20 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm"
              )}
              onClick={() => {
                // Haptic feedback emulation
                if (navigator.vibrate) navigator.vibrate(50);
                setExpandedId(isExpanded ? null : item.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={cn("font-semibold", passed ? "text-slate-500" : "text-slate-900 dark:text-slate-100")}>
                    {item.title}
                  </h3>
                  <p className={cn("text-sm mt-1", passed ? "text-slate-400" : "text-indigo-600 dark:text-indigo-400 font-medium")}>
                    {formattedDate}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={cn("h-5 w-5", passed ? "text-slate-400" : "text-slate-500")} />
                </motion.div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
