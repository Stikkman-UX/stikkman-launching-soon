"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type { Project } from "@/app/(Home)/data/projects";
import { COMING_SOON_HREF } from "@/lib/comingSoon";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <a ref={ref} href={project.href || COMING_SOON_HREF} className="block">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-[20px] leading-7 font-normal text-[#0A0A0A] ">{project.title}</h3>
        <p className="text-xs font-normal text-[#8A8781] leading-5 sm:max-w-214 sm:text-right">
          {project.description}
        </p>
      </div>

      <div className="mt-4 rounded-md lg:rounded-2xl border border-dotted border-[#00000033] p-2.5 lg:p-8.5 grid grid-cols-2 gap-2.5">
        {project.assets.map((asset, i) => (
          <div
            key={i}
            className="relative w-full max-w-[403px] aspect-[403/270] overflow-hidden rounded-md bg-neutral-900"
          >
            {asset.type === "video" ? (
              <video
                src={asset.url}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover "
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center "
                style={{ backgroundImage: `url(${asset.url})` }}
              />
            )}
          </div>
        ))}
      </div>
    </a>
  );
}
