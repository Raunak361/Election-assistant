"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ShieldAlert, CreditCard, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useElectionData } from "@/hooks/useElectionData";

const idTypes = [
  { id: "Voter ID (EPIC)", icon: User },
  { id: "Aadhar Card", icon: ShieldAlert },
  { id: "PAN Card", icon: CreditCard },
  { id: "Driving License", icon: FileText },
  { id: "Passport", icon: ShieldAlert },
  { id: "MNREGA Job Card", icon: FileText },
];

export function IDChecker() {
  const { selectedState } = useElectionData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!selectedState) return null;

  const checkValidity = (idName: string) => {
    if (selectedState.requiredID.includes("None")) return true;
    return selectedState.requiredID.includes(idName);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {idTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedId === type.id;
          
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(50);
                setSelectedId(type.id);
              }}
              className={cn(
                "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-sm font-medium transition-colors text-center h-28",
                isSelected 
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              <Icon className={cn("h-6 w-6", isSelected ? "text-indigo-500" : "text-slate-400")} />
              <span>{type.id}</span>
            </motion.button>
          );
        })}
      </div>

      {selectedId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl border flex items-start gap-3",
            checkValidity(selectedId)
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50"
              : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
          )}
        >
          {checkValidity(selectedId) ? (
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-full mt-0.5">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : (
            <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-full mt-0.5">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          )}
          
          <div>
            <h4 className={cn(
              "font-semibold",
              checkValidity(selectedId) ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"
            )}>
              {checkValidity(selectedId) ? "Valid ID for " + selectedState.name : "Not Accepted in " + selectedState.name}
            </h4>
            <p className={cn(
              "text-sm mt-1",
              checkValidity(selectedId) ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
            )}>
              {checkValidity(selectedId) 
                ? "You can use this ID to vote in " + selectedState.name + "."
                : "Please select another form of identification from the accepted list."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
