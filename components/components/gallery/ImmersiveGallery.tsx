"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { cn } from "@/lib/utils";

export interface Slide {
  src: string;
  title: string;
  caption?: string;
  href?: string;
  mood: [string, string];
}

/**
 * The immersive gallery — bottles float centred on a per-fragrance mood stage,
 * changing with an Apple-style staged reveal (colour cross-dissolve + the bottle
 * rising from below as the title resolves a beat later). Arrow keys, drag, side
 * controls and the dot rail all drive it; reduced motion becomes a clean fade.
 */
export function ImmersiveGallery({
  slides,
  labels,
  locale,
}: {
  slides: Slide[];
  labels: { swipe: string; cta: string };
  locale: "en" | "ar";
}) {
  const rtl = locale === "ar";
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) => setState(([i]) => [(i + delta + slides.length) % slides.length, delta]),
    [slides.length]
  );
  const jump = useCallback((to: number) => setState(([i]) => [to, to > i ? 1 : -1]), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, rtl]);

  useEffect(() => {
    if (paused || reduce) return;
    timer.current = setTimeout(() => go(1), 5500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, reduce, go]);

  const slide = slides[index];

  return (
    <section
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[21/9]">
        <AnimatePresence initial={false}>
          <motion.div
            key={`bg-${index}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.4 : 1.4, ease: "easeInOut" }}
            style={{
              background: `radial-gradient(120% 120% at 50% 15%, ${slide.mood[0]} 0%, ${slide.mood[1]} 70%, ${slide.mood[1]} 100%)`,
            }}
          />
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_40%,transparent_40%,rgba(20,22,16,0.45)_100%)]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={index}
              className="relative aspect-square h-[68%] max-h-[560px] sm:h-[86%]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.94 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -40, scale: 1.03 }}
              transition={{ duration: reduce ? 0.4 : 1.15, ease: [0.22, 1, 0.36, 1] }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(rtl ? -1 : 1);
                else if (info.offset.x > 80) go(rtl ? 1 : -1);
              }}
            >
              <div className="absolute inset-x-6 bottom-2 h-10 rounded-[50%] bg-black/25 blur-2xl" />
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 80vw, 560px"
                className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-7 text-center sm:p-12 lg:p-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -12 }}
              transition={{ duration: 0.7, delay: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow mb-3 text-ivory/70">
                {String(index + 1).padStart(2, "0")} — {String(slides.length).padStart(2, "0")}
              </p>
              <h2 className="font-display text-d2 font-light leading-[1.05] text-ivory">{slide.title}</h2>
              {slide.caption && (
                <p className="mx-auto mt-3 max-w-md font-body text-lead text-ivory/85">{slide.caption}</p>
              )}
              {slide.href && (
                <Link
                  href={slide.href}
                  className="pointer-events-auto mt-6 inline-flex items-center gap-3 border-b border-ivory/40 pb-1 font-body text-nav uppercase tracking-wide2 text-ivory transition-colors hover:border-ivory"
                >
                  {labels.cta}
                  <span aria-hidden className={rtl ? "rotate-180" : ""}>→</span>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(rtl ? 1 : -1)}
          aria-label="Previous"
          className="group absolute inset-y-0 start-0 flex w-16 items-center justify-center sm:w-24"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-ivory/30 bg-black/15 text-ivory backdrop-blur-sm transition-all duration-500 group-hover:border-ivory/70 group-hover:bg-black/30">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={rtl ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
            </svg>
          </span>
        </button>
        <button
          onClick={() => go(rtl ? -1 : 1)}
          aria-label="Next"
          className="group absolute inset-y-0 end-0 flex w-16 items-center justify-center sm:w-24"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-ivory/30 bg-black/15 text-ivory backdrop-blur-sm transition-all duration-500 group-hover:border-ivory/70 group-hover:bg-black/30">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={rtl ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
            </svg>
          </span>
        </button>

        <div className="absolute start-7 top-7 sm:start-12 sm:top-10">
          <LantanaMark className="h-9 w-9 text-ivory/85" />
        </div>

        <div className="absolute inset-x-0 top-8 flex items-center justify-center gap-2 sm:top-10">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => jump(i)}
              aria-label={s.title}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === index ? "w-8 bg-ivory" : "w-1.5 bg-ivory/40 hover:bg-ivory/70"
              )}
            />
          ))}
        </div>
      </div>

      <div className="shell mt-6">
        <div className="flex items-center justify-start gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => jump(i)}
              aria-label={s.title}
              aria-current={i === index}
              className={cn(
                "relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-ivory-soft transition-all duration-500 sm:h-[76px] sm:w-[76px]",
                i === index ? "ring-2 ring-olive ring-offset-2 ring-offset-ivory" : "opacity-50 hover:opacity-100"
              )}
            >
              <Image src={s.src} alt="" fill sizes="76px" className="object-cover" />
            </button>
          ))}
        </div>
        <p className="mt-3 text-center font-body text-micro uppercase tracking-luxe text-ink/45">{labels.swipe}</p>
      </div>
    </section>
  );
}
