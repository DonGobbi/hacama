import Image from 'next/image';
import Link from 'next/link';

export function Brand({ full = false }: { full?: boolean }) {
  if (full) {
    return (
      <Link href="/" className="inline-block" aria-label="Hacama Investments home">
        <Image
          src="/hacama_logo.png"
          alt="Hacama Investments"
          width={180}
          height={180}
          className="rounded-2xl"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Hacama Investments home">
      <Image src="/hacama_icon.png" alt="" width={40} height={40} className="size-10 rounded-lg object-contain" priority />
      <span className="flex flex-col leading-tight">
        <strong className="text-ink-950">Hacama</strong>
        <span className="text-xs tracking-wider text-slate-500 uppercase">Investments</span>
      </span>
    </Link>
  );
}
