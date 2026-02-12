export default function TopMarquee({
  text = "СКИДКИ 20%",
  speedSeconds = 50,
  fontClass = "",
}: {
  text?: string;
  speedSeconds?: number;
  fontClass?: string;
}) {
  const repeats = 14;

  const Item = () => (
    <span className="flex items-center gap-6">
      <span>{text}</span>
      <span aria-hidden="true">•</span>
    </span>
  );

  // Одна “лента” (track)
  const Track = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div
      className={`${fontClass} flex min-w-[140vw] items-center gap-10 px-10 text-[15px] font-medium uppercase tracking-[-0.11em]`}
      aria-hidden={ariaHidden}
    >
      {Array.from({ length: repeats }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );

  return (
    <div className="h-[30px] border-b bg-white">
      <div className="relative h-full overflow-hidden">
        {/* ВАЖНО: тут две одинаковые ленты подряд */}
        <div
          className="flex h-full"
          style={{
            animationName: "satl-marquee",
            animationDuration: `${speedSeconds}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            willChange: "transform",
          }}
        >
          <Track />
          <Track ariaHidden />
        </div>
      </div>
    </div>
  );
}
