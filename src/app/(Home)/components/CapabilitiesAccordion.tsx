"use client";

import { useState } from "react";
import type { Capability } from "@/app/(Home)/data/capabilities";

export default function CapabilitiesAccordion({
  capabilities,
}: {
  capabilities: Capability[];
}) {
  const [openSlug, setOpenSlug] = useState(capabilities[0]?.slug);

  return (
    <div className="divide-y divide-white/10 border-b cursor-pointer border-white/10 last:border-none">
      {capabilities.map((capability, index) => {
        const isSelected = capability.slug === openSlug;

        return (
          <div
            className="group/item"
            key={capability.slug}
            onMouseEnter={() => setOpenSlug(capability.slug)}
          >
            <button
              type="button"
              onFocus={() => setOpenSlug(capability.slug)}
              className="flex w-full lg:pt-9 lg:pb-6 cursor-pointer items-start gap-10 pt-6 pb-3 text-left lg:gap-20 "
            >
              <span className="pt-1 font-mono text-xs text-white/40">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span
                className={`flex-1 text-2xl lg:text-[30px] lg:leading-[33px] transition-colors duration-300 group-hover/item:text-white ${
                  isSelected ? "text-white" : "text-white/50"
                }`}
              >
                {capability.title}
              </span>

              <span className="relative mt-2 h-4 w-4 shrink-0">
                <span
                  className={`absolute inset-0 m-auto h-px w-4 bg-white transition-transform duration-300 ${
                    isSelected ? "rotate-180" : "rotate-0"
                  }`}
                />
                <span
                  className={`absolute inset-0 m-auto h-4 w-px bg-white/60 transition-transform duration-300 ${
                    isSelected ? "rotate-90 scale-y-0" : "rotate-0 scale-y-100"
                  }`}
                />
              </span>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                isSelected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`max-w-3xl pb-8 pl-13 transition-all duration-500 ease-in-out lg:pl-24 ${
                    isSelected
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 opacity-0"
                  }`}
                >
                  <p className="text-sm leading-relaxed text-white/60">
                    {capability.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {capability.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/20 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
