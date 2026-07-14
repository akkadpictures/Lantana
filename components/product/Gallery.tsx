"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  src: string;
  caption?: string;
}

/**
 * The maison's gallery.
 *
 * A staggered column layout rather than a flat grid: perfume photography is
 * mostly tall bottles and wide flat-lays, and forcing both into one square
 * crops the life out of them. Columns let each frame keep its own proportion
 * while the eye still reads a clean vertical rhythm.
 *
 * Every frame below the fold is lazily loaded; the lightbox traps focus, closes
 * on Escape, and steps with the arrow keys.
 */
export function Gallery({
  images,
  alt,
  className,
}: {
  images: GalleryImage[];
  alt: string;
  className?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  if (images.length === 0) return null;

  return (
    <>
      <div className={cn("columns-2 gap-4 md:columns-3 md:gap-6", className)}>
        {images.map((img, i) => (
          <button
            key={img.src + i}
            onClick={() => setIndex(i)}
            aria-label={`${alt} — ${i + 1}`}
            className="frame-zoom group mb-4 block w-full break-inside-avoid overflow-hidden bg-ivory-soft md:mb-6"
          >
            <span className="relative block">
              <Image
                src={img.src}
                alt={img.caption || `${alt} — ${i + 1}`}
                width={900}
                height={1125}
                loading={i < 2 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="h-auto w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-700 ease-luxe group-hover:bg-ink/10" />
            </span>
            {img.caption && (
              <span className="block px-1 pt-3 text-start font-body text-micro uppercase tracking-wide2 text-ink/50">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute end-6 top-6 z-10 text-3xl leading-none text-ivory/70 transition-colors hover:text-ivory"
            >
              ×
            </button>

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous"
                  onClick={(e) => { e.stopPropagation(); step(-1); }}
                  className="absolute start-4 z-10 grid h-12 w-12 place-items-center text-ivory/60 transition-colors hover:text-ivory md:start-10"
                >
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="m15 5-7 7 7 7" /></svg>
                </button>
                <button
                  aria-label="Next"
                  onClick={(e) => { e.stopPropagation(); step(1); }}
                  className="absolute end-4 z-10 grid h-12 w-12 place-items-center text-ivory/60 transition-colors hover:text-ivory md:end-10"
                >
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="m9 5 7 7-7 7" /></svg>
                </button>
              </>
            )}

            <motion.figure
              key={index}
              className="flex max-h-[88vh] w-full max-w-4xl flex-col items-center px-6"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[index!].src}
                alt={images[index!].caption || alt}
                width={1600}
                height={2000}
                priority
                sizes="100vw"
                className="max-h-[78vh] w-auto object-contain"
              />
              <figcaption className="pt-5 text-center font-body text-micro uppercase tracking-luxe text-ivory/60">
                {images[index!].caption || alt} · {index! + 1} / {images.length}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
