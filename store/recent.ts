"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface RecentState {
  slugs: string[];
  push: (slug: string) => void;
}

export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      slugs: [],
      push: (slug) =>
        set((s) => ({ slugs: [slug, ...s.slugs.filter((x) => x !== slug)].slice(0, 8) })),
    }),
    { name: "lantana-recent", storage: createJSONStorage(() => localStorage) }
  )
);
