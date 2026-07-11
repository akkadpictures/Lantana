"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LantanaMark } from "./LantanaMark";

/** The veil — floret blooms, then the curtain lifts. Shown once per session. */
export function Preloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("lantana_veil")) return;
    sessionStorage.setItem("lantana_veil", "1");
    setShow(true);
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-olive"
          exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
          aria-hidden="true"
        >
          <div className="text-ivory">
            <LantanaMark animated className="mx-auto h-20 w-20" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.9, duration: 0.6 } }}
              className="mt-6 text-center font-body text-[11px] uppercase tracking-luxe"
            >
              Lantana
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
