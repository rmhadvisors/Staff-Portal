export function AnimatedBackground({ dense = false }: { dense?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* gradient mesh blobs */}
      <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-primary/20 blur-[120px] animate-mesh" />
      <div
        className="absolute -right-32 top-20 h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-[120px] animate-mesh"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[36rem] w-[36rem] rounded-full bg-violet/15 blur-[130px] animate-mesh"
        style={{ animationDelay: "-12s" }}
      />
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%)",
        }}
      />
      {/* moving chart lines */}
      <svg className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-[0.20]" preserveAspectRatio="none" viewBox="0 0 1200 400">
        <defs>
          <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <path
          d="M0,300 C150,220 250,340 400,260 C560,170 680,300 820,210 C960,130 1080,260 1200,180"
          fill="none"
          stroke="url(#chartLine)"
          strokeWidth="2.5"
          className="animate-pulse-glow"
        />
        <path
          d="M0,360 C160,320 280,380 420,320 C580,250 700,350 860,290 C1000,240 1100,320 1200,280"
          fill="none"
          stroke="url(#chartLine)"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </svg>
      {/* floating particles */}
      {Array.from({ length: dense ? 22 : 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute block h-1.5 w-1.5 rounded-full bg-accent/40 animate-float-y"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 6) * 0.7}s`,
            animationDuration: `${4 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}