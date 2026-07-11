import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const field =
  "w-full border border-ink/20 bg-transparent px-4 py-3 font-body text-sm text-ink placeholder:text-ink/40 focus:border-olive focus:outline-none transition-colors duration-300";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} {...props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "min-h-32", className)} {...props} />;
}
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(field, "appearance-none bg-ivory", className)} {...props} />;
}
export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-body text-[11px] uppercase tracking-wide2 text-ink/70">
      {children}
    </label>
  );
}
