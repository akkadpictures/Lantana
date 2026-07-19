"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { cn } from "@/lib/utils";

export interface Slide {
  src: string;
  title: string;
  caption?: string;
  href?: string;
}

const AUTOPLAY_MS = 5500;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * The gallery carousel.
 *
 * A framed stage rather than a full-bleed takeover — the image sits inside the
 * shell like a piece hung in a maison, with air around it. Movement is layered:
 * the frame slides one way while the photograph inside drifts slightly the
 * other, and the whole stage breathes vertically as the page scrolls. Autoplay
 * turns the frames on its own (a thin progress line shows the rhythm) and
 * pauses the moment the visitor touches, hovers or drags.
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
  const stageRef = useRef<HTMLDivElement>(null);

  // Scroll parallax — the photograph glides gently as the stage crosses the viewport.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const go = useCallback(
    (delta: number) => {
      setState(([i]) => [(i + delta + slides.length) % slides.length, delta]);
    },
    [slides.length]
  );

  const jump = useCallback(
    (to: number) => setState(([i]) => [to, to > i ? 1 : -1]),
    []
  );

  // Keyboard: left/right arrows respect writing direction.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, rtl]);

  // Autoplay that pauses on interaction.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || reduce) return;
    timer.current = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, reduce, go]);

  const slide = slides[index];

  // Frame-level motion: the stage slides…
  const frameEnter = reduce
    ? { opacity: 0 }
    : { opacity: 0, x: dir >= 0 ? "10%" : "-10%" };
  const frameCenter = reduce ? { opacity: 1 } : { opacity: 1, x: "0%" };
  const frameExit = reduce
    ? { opacity: 0 }
    : { opacity: 0, x: dir >= 0 ? "-10%" : "10%" };

  // …while the photograph inside drifts the opposite way (parallax depth).
  const imgEnter = reduce ? {} : { x: dir >= 0 ? "-7%" : "7%", scale: 1.12 };
  const imgCenter = reduce ? {} : { x: "0%", scale: 1.06 };
  const imgExit = reduce ? {} : { x: dir >= 0 ? "7%" : "-7%", scale: 1.12 };

  return (
    <section
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="shell">
        {/* Stage */}
        <div
          ref={stageRef}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-ink shadow-[0_30px_80px_-30px_rgba(20,24,18,0.45)] sm:aspect-[16/9] lg:aspect-[21/9]"
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={index}
              className="absolute inset-0 overflow-hidden"
              initial={frameEnter}
              animate={frameCenter}
              exit={frameExit}
              transition={{ duration: reduce ? 0.4 : 1.05, ease: EASE }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(rtl ? -1 : 1);
                else if (info.offset.x > 80) go(rtl ? 1 : -1);
              }}
            >
              {/* Inner parallax layer */}
              <motion.div
                className="absolute inset-0"
                initial={imgEnter}
                animate={imgCenter}
                exit={imgExit}
                transition={{ duration: reduce ? 0.4 : 1.35, ease: EASE }}
                style={reduce ? undefined : { y: parallaxY }}
              >
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover"
                  draggable={false}
                />
              </motion.div>
              {/* Cinematic vignette so type always sits on tone, never on busy pixels */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-ink/25" />
            </motion.div>
          </AnimatePresence>

          {/* Caption — resolves a beat after the image settles */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                transition={{
                  duration: 0.7,
                  delay: reduce ? 0 : 0.3,
                  ease: EASE,
                }}
                className="max-w-2xl"
              >
                <p className="eyebrow mb-3 text-ivory/70">
                  {String(index + 1).padStart(2, "0")} —{" "}
                  {String(slides.length).padStart(2, "0")}
                </p>
                <h2 className="font-display text-d3 font-light leading-[1.05] text-ivory sm:text-d2">
                  {slide.title}
                </h2>
                {slide.caption && (
                  <p className="mt-3 max-w-xl font-body text-lead text-ivory/80">
                    {slide.caption}
                  </p>
                )}
                {slide.href && (
                  <Link
                    href={slide.href}
                    className="pointer-events-auto mt-6 inline-flex items-center gap-3 border-b border-ivory/40 pb-1 font-body text-nav uppercase tracking-wide2 text-ivory transition-colors hover:border-ivory"
                  >
                    {labels.cta}
                    <span aria-hidden className={rtl ? "rotate-180" : ""}>
                      →
                    </span>
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Autoplay progress line */}
          {!reduce && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-ivory/15">
              <motion.div
                key={`progress-${index}-${paused}`}
                className="h-full origin-left bg-ivory/70 rtl:origin-right"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: paused ? 0 : 1 }}
                transition={{
                  duration: paused ? 0.3 : AUTOPLAY_MS / 1000,
                  ease: "linear",
                }}
              />
            </div>
          )}

          {/* Side arrows */}
          <button
            onClick={() => go(rtl ? 1 : -1)}
            aria-label="Previous"
            className="group absolute inset-y-0 start-0 flex w-14 items-center justify-center sm:w-20"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full border border-ivory/25 bg-ink/20 text-ivory backdrop-blur-sm transition-all duration-500 group-hover:border-ivory/60 group-hover:bg-ink/40">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d={rtl ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
              </svg>
            </span>
          </button>
          <button
            onClick={() => go(rtl ? -1 : 1)}
            aria-label="Next"
            className="group absolute inset-y-0 end-0 flex w-14 items-center justify-center sm:w-20"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full border border-ivory/25 bg-ink/20 text-ivory backdrop-blur-sm transition-all duration-500 group-hover:border-ivory/60 group-hover:bg-ink/40">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d={rtl ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
              </svg>
            </span>
          </button>

          {/* Floating mark */}
          <div className="absolute start-6 top-6 sm:start-10 sm:top-10">
            <LantanaMark className="h-8 w-8 text-ivory/90" />
          </div>
        </div>

        {/* Thumbnail rail */}
        <div className="mt-6">
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slides.map((s, i) => (
              <button
                key={s.src}
                onClick={() => jump(i)}
                aria-label={s.title}
                aria-current={i === index}
                className={cn(
                  "relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-sm transition-all duration-500 sm:h-[4.5rem] sm:w-[4.5rem]",
                  i === index
                    ? "ring-2 ring-olive ring-offset-2 ring-offset-ivory"
                    : "opacity-55 hover:opacity-100"
                )}
              >
                <Image
                  src={s.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          <p className="mt-3 text-center font-body text-label uppercase tracking-luxe text-ink/45">
            {labels.swipe}
          </p>
        </div>
      </div>
    </section>
  );
}
