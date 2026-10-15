import Image from "next/image";
import Link from "next/link";

/** The official GameXChange logo. Its cyan/magenta read on both themes, so one asset serves both. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="GameXChange — home" className={`group inline-flex min-h-11 shrink-0 items-center ${className}`}>
      <Image
        src="/brand/gamexchange-logo-360.webp"
        alt=""
        width={360}
        height={147}
        priority
        unoptimized
        className="h-8 w-auto transition-transform duration-300 group-hover:scale-[1.04] sm:h-9"
      />
    </Link>
  );
}
