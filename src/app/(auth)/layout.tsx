export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-canopy-100 via-parchment-50 to-parchment-100 px-4">
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-canopy-300/50"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,120 C240,180 480,60 720,90 C960,120 1200,180 1440,110 L1440,200 L0,200 Z"
        />
      </svg>
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-canopy-500/40"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,100 C320,40 640,140 960,80 C1200,40 1320,90 1440,70 L1440,150 L0,150 Z"
        />
      </svg>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">🌳</div>
          <h1 className="font-display text-3xl font-semibold text-canopy-900">Canopée</h1>
          <p className="mt-1 text-sm text-canopy-700">
            Ton jardin personnel de suivi, jour après jour.
          </p>
        </div>
        <div className="rounded-2xl border border-border-soft bg-surface/90 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
