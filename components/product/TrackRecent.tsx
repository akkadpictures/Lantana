"use client";

import { useEffect } from "react";
import { useRecent } from "@/store/recent";

export function TrackRecent({ slug }: { slug: string }) {
  const push = useRecent((s) => s.push);
  useEffect(() => push(slug), [slug, push]);
  return null;
}
