import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-brand-700 to-brand-900",
  "from-brand-600 to-brand-800",
  "from-gold-600 to-brand-800",
  "from-brand-800 to-ink",
  "from-gold-500 to-gold-600",
];

function hashIndex(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % max;
}

export function BookCover({
  title,
  bookId,
  className,
}: {
  title: string;
  bookId: string;
  className?: string;
}) {
  const gradient = GRADIENTS[hashIndex(bookId, GRADIENTS.length)];
  return (
    <div
      className={cn(
        "relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-md bg-gradient-to-br shadow-soft",
        `bg-gradient-to-br ${gradient}`,
        className,
      )}
    >
      <BookOpen className="absolute right-1 top-1 h-3 w-3 text-white/20" />
      <span className="px-2 text-center text-[0.55rem] font-serif font-semibold leading-tight text-white/90 line-clamp-4">
        {title}
      </span>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
      <div className="absolute bottom-1 left-1 h-3 w-px bg-white/20" />
    </div>
  );
}
