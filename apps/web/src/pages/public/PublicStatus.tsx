export function PublicLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
      Loading…
    </div>
  );
}

export function PublicError({ message = 'This site could not be found.' }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-slate-700">
      <div className="text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-slate-400">404</p>
        <p className="mt-2 text-xl">{message}</p>
      </div>
    </div>
  );
}
