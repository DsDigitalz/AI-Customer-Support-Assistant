'use client';

import React from 'react';
import { Shield, Cpu, GraduationCap, Headphones, Pencil } from 'lucide-react';

export interface QuickOption {
  id: string;
  title: string;
  prompt: string;
  icon: React.ElementType;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

export const PREDEFINED_QUICK_OPTIONS: QuickOption[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Services',
    prompt: 'Can you tell me more about Apexium Cybersecurity Services, penetration testing, and 24/7 SOC monitoring?',
    icon: Shield,
    badgeColor: 'text-teal-400',
    borderColor: 'border-teal-500/30 hover:border-teal-400/60',
    bgColor: 'bg-teal-950/40 hover:bg-teal-950/70',
    description: 'Pen testing, SOC 24/7 & ISO compliance',
  },
  {
    id: 'technology',
    title: 'Technology Services',
    prompt: 'What Technology Services does Apexium offer for cloud migration and custom software development?',
    icon: Cpu,
    badgeColor: 'text-sky-400',
    borderColor: 'border-sky-500/30 hover:border-sky-400/60',
    bgColor: 'bg-sky-950/40 hover:bg-sky-950/70',
    description: 'Cloud migration, IT systems & custom dev',
  },
  {
    id: 'training',
    title: 'Training Programs',
    prompt: 'What training programs and certification prep courses (e.g. CISSP, staff awareness) are currently available?',
    icon: GraduationCap,
    badgeColor: 'text-amber-400',
    borderColor: 'border-amber-500/30 hover:border-amber-400/60',
    bgColor: 'bg-amber-950/40 hover:bg-amber-950/70',
    description: 'CISSP cert prep & cybersecurity awareness',
  },
  {
    id: 'support',
    title: 'Contact Support',
    prompt: 'I need to contact Apexium support or speak directly with a service specialist.',
    icon: Headphones,
    badgeColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
    bgColor: 'bg-emerald-950/40 hover:bg-emerald-950/70',
    description: 'Connect with a support specialist or SOC team',
  },
];

interface QuickEnquiryOptionsProps {
  onSelectOption: (prompt: string) => void;
  onPrefillOption?: (prompt: string) => void;
  isLoading: boolean;
}

export const QuickEnquiryOptions: React.FC<QuickEnquiryOptionsProps> = ({
  onSelectOption,
  onPrefillOption,
  isLoading,
}) => {
  return (
    <div className="w-full space-y-2 mb-2 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Quick Enquiries
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Click to send · Edit icon to prefill
        </span>
      </div>

      {/* Horizontal Scrollable Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PREDEFINED_QUICK_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 backdrop-blur-md shadow-sm ${opt.bgColor} ${opt.borderColor}`}
            >
              {/* Click main card to send message directly */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onSelectOption(opt.prompt)}
                className="flex items-center gap-2.5 flex-1 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
              >
                <div
                  className={`w-7 h-7 rounded-lg bg-slate-900/80 flex items-center justify-center shrink-0 border border-slate-800 shadow-inner`}
                >
                  <Icon className={`w-4 h-4 ${opt.badgeColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 truncate">
                    {opt.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {opt.description}
                  </div>
                </div>
              </button>

              {/* Prefill button to edit before sending */}
              {onPrefillOption && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrefillOption(opt.prompt);
                  }}
                  title={`Edit "${opt.title}" prompt before sending`}
                  className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors opacity-70 group-hover:opacity-100 shrink-0 cursor-pointer disabled:opacity-30"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
