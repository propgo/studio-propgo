"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Details" },
  { num: 2, label: "Floor Plans" },
  { num: 3, label: "Photos" },
  { num: 4, label: "Storyboard" },
  { num: 5, label: "Voiceover" },
];

interface WizardShellProps {
  currentStep: number;
  children: React.ReactNode;
}

export function WizardShell({ currentStep, children }: WizardShellProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Step bar */}
      <div className="border-b border-studio-border bg-studio-surface px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const done = step.num < currentStep;
              const active = step.num === currentStep;
              return (
                <div key={step.num} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                        done
                          ? "bg-brand-primary text-white"
                          : active
                            ? "bg-brand-primary text-white ring-4 ring-brand-primary/20"
                            : "bg-studio-muted text-white/25"
                      )}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium hidden sm:block",
                        active ? "text-white" : done ? "text-white/60" : "text-white/25"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-px mx-3 transition-all",
                        done ? "bg-brand-primary/40" : "bg-studio-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
