import Link from "next/link";
import { LantanaMark } from "@/components/brand/LantanaMark";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <LantanaMark className="mx-auto mb-6 h-10 w-10 text-olive" />
        <p className="eyebrow">LANTANA</p>
        <h1 className="h-display mt-4 text-4xl text-ink sm:text-5xl">This page has evaporated.</h1>
        <p className="mt-3 font-body text-sm text-ink/55">The page you are looking for is no longer here.</p>
        <Link href="/en" className="mt-8 inline-block font-body text-[12px] uppercase tracking-luxe text-olive-deep underline underline-offset-4">
          Return to the maison
        </Link>
      </div>
    </main>
  );
}
