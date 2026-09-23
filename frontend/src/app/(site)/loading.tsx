export default function Loading() {
  return (
    <div className="container-page animate-pulse py-16" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-4 h-9 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
