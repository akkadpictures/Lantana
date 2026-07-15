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
}

/**
 * The immersive gallery.
 *
 * One frame at a time, full-bleed, the way a maison would light a single bottle
 * on a plinth. Moving between frames is the point of the room, so the change is
 * staged rather than instant: the outgoing image lifts and dims while the
 * incoming one rises from slightly scaled-up, its caption resolving a beat
 * later. It reads like Apple's product galleries — the transition itself is part
 * of the luxury, not a means to an end.
 *
 * Drag, arrow keys, the rail of dots, or the side arrows all drive it. Reduced
 * motion collapses the choreography to a clean crossfade.
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

  const go = useCallback(
    (delta: number) => {
      setState(([i]) => {
        const next = (i + delta + slides.length) % slides.length;
        return [next, delta];
      });
    },
    [slides.length]
  );

  const jump = useCallback((to: number) => setState(([i]) => [to, to > i ? 1 : -1]), []);

  // Keyboard: left/right arrows respect writing direction.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, rtl]);

  // Gentle autoplay that pauses on interaction.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || reduce) return;
    timer.current = setTimeout(() => go(1), 6000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, reduce, go]);

  const slide = slides[index];

  const enter = reduce
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.08, x: dir > 0 ? "6%" : "-6%" };
  const center = reduce ? { opacity: 1 } : { opacity: 1, scale: 1, x: "0%" };
  const exit = reduce
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.04, x: dir > 0 ? "-6%" : "6%" };

  return (
    <section
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Stage */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink sm:aspect-[16/10] lg:aspect-[16/9]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={enter}
            animate={center}
            exit={exit}
            transition={{
              duration: reduce ? 0.4 : 1.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(rtl ? -1 : 1);
              else if (info.offset.x > 80) go(rtl ? 1 : -1);
            }}
          >
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              draggable={false}
            />
            {/* Cinematic vignette so type always sits on tone, never on busy pixels */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
          </motion.div>
        </AnimatePresence>

        {/* Caption — resolves a beat after the image settles */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-7 sm:p-12 lg:p-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.7, delay: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <p className="eyebrow mb-3 text-ivory/70">
                {String(index + 1).padStart(2, "0")} — {String(slides.length).padStart(2, "0")}
              </p>
              <h2 className="font-display text-d2 font-light leading-[1.05] text-ivory">{slide.title}</h2>
              {slide.caption && (
                <p className="mt-4 max-w-xl font-body text-lead text-ivory/80">{slide.caption}</p>
              )}
              {slide.href && (
                <Link
                  href={slide.href}
                  className="pointer-events-auto mt-7 inline-flex items-center gap-3 border-b border-ivory/40 pb-1 font-body text-nav uppercase tracking-wide2 text-ivory transition-colors hover:border-ivory"
                >
                  {labels.cta}
                  <span aria-hidden className={rtl ? "rotate-180" : ""}>→</span>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side arrows */}
        <button
          onClick={() => go(rtl ? 1 : -1)}
          aria-label="Previous"
          className="group absolute inset-y-0 start-0 flex w-16 items-center justify-center sm:w-24"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-ivory/25 bg-ink/20 text-ivory backdrop-blur-sm transition-all duration-500 group-hover:border-ivory/60 group-hover:bg-ink/40">
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
          <span className="grid h-12 w-12 place-items-center rounded-full border border-ivory/25 bg-ink/20 text-ivory backdrop-blur-sm transition-all duration-500 group-hover:border-ivory/60 group-hover:bg-ink/40">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={rtl ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
            </svg>
          </span>
        </button>

        {/* Floating mark */}
        <div className="absolute start-7 top-7 sm:start-12 sm:top-12">
          <LantanaMark className="h-9 w-9 text-ivory/90" />
        </div>
      </div>

      {/* Thumbnail rail */}
      <div className="shell mt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => jump(i)}
              aria-label={s.title}
              aria-current={i === index}
              className={cn(
                "relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-sm transition-all duration-500 sm:h-20 sm:w-20",
                i === index ? "ring-2 ring-olive ring-offset-2 ring-offset-ivory" : "opacity-55 hover:opacity-100"
              )}
            >
              <Image src={s.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
        <p className="mt-3 text-center font-body text-label uppercase tracking-luxe text-ink/45">{labels.swipe}</p>
      </div>
    </section>
  );
}
