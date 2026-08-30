"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { cn } from "@/lib/utils";

export interface Slide {
  src: string;
  title: string;
  caption?: string;
  href?: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * The gallery — a staggered editorial hang.
 *
 * Each frame occupies its own row and alternates side to side, so the empty
 * space beside it reads as deliberate margin rather than a gap left over by a
 * column algorithm. Nothing is cropped: every image keeps its native ratio, and
 * a portrait, a landscape and a square can sit in the same sequence without one
 * distorting the rhythm of the others.
 *
 * This replaces a `columns-3` masonry wall, which balanced column HEIGHTS and
 * therefore stranded a hole in the middle whenever the source ratios differed —
 * unavoidable with a small, mixed set.
 *
 * Order is curated upstream (the `slides` array). Tapping any frame opens the
 * full uncropped view with caption and a way back into the piece.
 */
export function ImmersiveGallery({
  slides,
  labels,
  locale,
}: {
  slides: Slide[];
  labels: { swipe?: string; cta: string };
  locale: "en" | "ar";
}) {
  const rtl = locale === "ar";
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const isOpen = active !== null;

  const close = useCallback(() => setActive(null), []);
  const go = useCallback(
    (delta: number) =>
      setActive((i) =>
        i === null ? i : (i + delta + slides.length) % slides.length
      ),
    [slides.length]
  );

  // Lock scroll + wire keyboard while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, go, close, rtl]);

  const current = active !== null ? slides[active] : null;

  return (
    <section className="relative" aria-roledescription="gallery">
      <div className="shell">
        <div className="flex flex-col gap-24 sm:gap-32 lg:gap-40">
          {slides.map((s, i) => {
            // Alternating hang: even frames sit toward the start edge, odd
            // frames toward the end edge and dropped slightly, so the eye
            // travels diagonally down the page instead of scanning a grid.
            const flip = i % 2 === 1;

            return (
              <motion.div
                key={s.src}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 1.1, ease: EASE }}
                className={cn(
                  "flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-14",
                  flip && "lg:flex-row-reverse",
                  // The drop that turns a row into a hang.
                  flip && "lg:mt-8"
                )}
              >
                {/* Frame */}
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={s.title || `View image ${i + 1}`}
                  className="group relative block w-full overflow-hidden rounded-md bg-ink/[0.03] text-start shadow-[0_20px_60px_-30px_rgba(20,24,18,0.4)] ring-1 ring-ink/5 transition-shadow duration-700 hover:shadow-[0_40px_100px_-34px_rgba(20,24,18,0.5)] lg:w-[62%]"
                >
                  <Image
                    src={s.src}
                    alt={s.title || ""}
                    width={1600}
                    height={2000}
                    sizes="(min-width: 1024px) 62vw, 100vw"
                    className="h-auto w-full transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.03]"
                    priority={i === 0}
                  />
                  {/* Veil resolves on hover — only when there is something to say. */}
                  {s.title && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 p-6 opacity-0 transition-opacity duration-700 group-hover:opacity-100 sm:p-8">
                      <h3 className="font-display text-d3 font-light leading-[1.05] text-ivory">
                        {s.title}
                      </h3>
                    </div>
                  )}
                  <div className="pointer-events-none absolute start-5 top-5 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                    <LantanaMark className="h-7 w-7 text-ivory/85" />
                  </div>
                </button>

                {/* Margin — carries the index, and the words when they exist.
                    With no title this stays a numeral over a hairline, which
                    reads as intentional restraint rather than an empty slot. */}
                <div className="lg:w-[38%] lg:pb-2">
                  <p className="eyebrow text-ink/40">
                    {String(i + 1).padStart(2, "0")} —{" "}
                    {String(slides.length).padStart(2, "0")}
                  </p>
                  <div className="mt-4 h-px w-16 bg-ink/15" />

                  {s.title && (
                    <h3 className="mt-6 font-display text-d2 font-light leading-[1.08] text-ink">
                      {s.title}
                    </h3>
                  )}
                  {s.caption && (
                    <p className="mt-3 max-w-sm font-body text-lead text-ink/60">
                      {s.caption}
                    </p>
                  )}
                  {s.href && (
                    <Link
                      href={s.href}
                      className="mt-6 inline-flex items-center gap-3 border-b border-ink/25 pb-1 font-body text-nav uppercase tracking-wide2 text-ink transition-colors hover:border-ink"
                    >
                      {labels.cta}
                      <span aria-hidden className={rtl ? "rotate-180" : ""}>→</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {labels.swipe && (
          <p className="mt-24 text-center font-body text-label uppercase tracking-luxe text-ink/40">
            {labels.swipe}
          </p>
        )}
      </div>

      {/* Lightbox — full, uncropped, one frame at a time. */}
      <AnimatePresence>
        {isOpen && current && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
          >
            {/* Close — must sit ABOVE the nav strips: they span the full
                viewport height at both edges, and this button lives inside
                the "next" strip's band. Equal z-index let the later-painted
                strip swallow the click and advance the slide instead. */}
            <button
              onClick={(e) => { e.stopPropagation(); close(); }}
              aria-label="Close"
              className="absolute end-5 top-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-ivory/25 bg-ink/40 text-ivory backdrop-blur-sm transition-colors duration-300 hover:border-ivory/60 hover:bg-ivory/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Prev / Next — the strips start well below the close button.
                In RTL `end-0` puts the "next" strip on the LEFT, the same side
                as the close button, so the vertical gap (not just z-index) is
                what keeps a tap on ✕ from advancing the slide. */}
            <button
              onClick={(e) => { e.stopPropagation(); go(rtl ? 1 : -1); }}
              aria-label="Previous"
              className="group absolute bottom-0 start-0 top-32 z-10 flex w-16 items-center justify-center sm:w-24"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-ivory/25 text-ivory transition-all duration-300 group-hover:border-ivory/60 group-hover:bg-ivory/10">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={rtl ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
                </svg>
              </span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(rtl ? -1 : 1); }}
              aria-label="Next"
              className="group absolute bottom-0 end-0 top-32 z-10 flex w-16 items-center justify-center sm:w-24"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-ivory/25 text-ivory transition-all duration-300 group-hover:border-ivory/60 group-hover:bg-ivory/10">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={rtl ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
                </svg>
              </span>
            </button>

            {/* Frame */}
            <div
              className="relative flex max-h-[92vh] w-full max-w-6xl flex-col items-center px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex max-h-[80vh] items-center justify-center"
                >
                  {/* Uncropped: object-contain, image keeps its ratio in full. */}
                  <Image
                    src={current.src}
                    alt={current.title}
                    width={1600}
                    height={2000}
                    sizes="90vw"
                    className="max-h-[80vh] w-auto rounded-md object-contain shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 max-w-2xl text-center">
                <p className="eyebrow mb-2 text-ivory/60">
                  {String((active ?? 0) + 1).padStart(2, "0")} —{" "}
                  {String(slides.length).padStart(2, "0")}
                </p>
                {current.title && (
                  <h2 className="font-display text-d3 font-light leading-[1.1] text-ivory">
                    {current.title}
                  </h2>
                )}
                {current.caption && (
                  <p className="mt-2 font-body text-lead text-ivory/75">{current.caption}</p>
                )}
                {current.href && (
                  <Link
                    href={current.href}
                    className="mt-5 inline-flex items-center gap-3 border-b border-ivory/40 pb-1 font-body text-nav uppercase tracking-wide2 text-ivory transition-colors hover:border-ivory"
                  >
                    {labels.cta}
                    <span aria-hidden className={rtl ? "rotate-180" : ""}>→</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
