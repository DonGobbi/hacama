import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-6 text-center text-ink-950">
      <div>
        <p className="section-tag">404</p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you are looking for does not exist or is no longer available.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Back to home
        </Link>
      </div>
    </div>
  );
}
