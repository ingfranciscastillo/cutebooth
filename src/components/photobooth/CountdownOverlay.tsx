export function CountdownOverlay({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        key={count}
        className="animate-scale-in flex size-40 items-center justify-center rounded-full bg-booth-ink/45 backdrop-blur-sm"
      >
        <span className="font-display text-8xl font-bold leading-none text-booth-paper drop-shadow-lg">
          {count}
        </span>
      </div>
    </div>
  );
}