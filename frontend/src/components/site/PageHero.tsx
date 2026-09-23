export function PageHero({ tag, title, text }: { tag: string; title: string; text?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-stone-50 text-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.08),transparent_35%)]" />
      <div className="container-page relative py-16 sm:py-20">
        <span className="section-tag">{tag}</span>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-slate-600">{text}</p>}
      </div>
    </section>
  );
}
