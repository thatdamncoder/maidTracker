export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFE] text-center px-4">
      <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
      <p className="text-slate-500 mb-6">
        The page you’re looking for doesn’t exist.
      </p>
      <a
        href="/"
        className="text-indigo-600 font-bold hover:underline"
      >
        Go back to Dashboard →
      </a>
    </div>
  );
}
